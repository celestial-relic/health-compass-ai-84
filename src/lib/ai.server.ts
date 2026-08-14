/**
 * Server-only helpers for talking to the Lovable AI Gateway.
 * Supports both Gemini (chat completions) and OpenAI (Responses API, streamed
 * server-side and accumulated) so users can pick their engine in the app.
 */

const GATEWAY = "https://ai.gateway.lovable.dev/v1";

export type Engine = "gemini" | "openai";

export const MODELS: Record<Engine, string> = {
  gemini: "google/gemini-3.6-flash",
  openai: "openai/gpt-5.6-terra",
};

export type Part =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } }
  | { type: "file"; file: { filename: string; file_data: string } };

export type Msg = { role: "system" | "user" | "assistant"; content: string | Part[] };

function key() {
  const k = process.env["LOVABLE_API_KEY"];
  if (!k) throw new Error("AI is not configured yet.");
  return k;
}

async function viaChatCompletions(messages: Msg[], model: string) {
  const res = await fetch(`${GATEWAY}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key(),
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({ model, messages }),
  });
  if (!res.ok) throw new Error(await readError(res));
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return json.choices?.[0]?.message?.content ?? "";
}

async function viaResponses(messages: Msg[], model: string) {
  const input = messages.map((m) => ({
    role: m.role === "assistant" ? "assistant" : m.role,
    content:
      typeof m.content === "string"
        ? [{ type: m.role === "assistant" ? "output_text" : "input_text", text: m.content }]
        : m.content.map((p) =>
            p.type === "text"
              ? { type: "input_text", text: p.text }
              : p.type === "image_url"
                ? { type: "input_image", image_url: p.image_url.url }
                : { type: "input_file", filename: p.file.filename, file_data: p.file.file_data },
          ),
  }));

  const res = await fetch(`${GATEWAY}/responses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key(),
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({ model, input, stream: true, store: false }),
  });
  if (!res.ok || !res.body) throw new Error(await readError(res));

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const evt = JSON.parse(payload) as { type?: string; delta?: string };
        if (evt.type === "response.output_text.delta" && typeof evt.delta === "string") {
          text += evt.delta;
        }
      } catch {
        /* skip partial event */
      }
    }
  }
  return text;
}

async function readError(res: Response) {
  const body = await res.text().catch(() => "");
  if (res.status === 429) return "The AI service is busy right now. Please try again in a moment.";
  if (res.status === 402) return "AI credits are exhausted for this workspace.";
  return `AI request failed (${res.status}). ${body.slice(0, 200)}`;
}

export async function askAI(messages: Msg[], engine: Engine = "gemini") {
  const model = MODELS[engine];
  return engine === "openai" ? viaResponses(messages, model) : viaChatCompletions(messages, model);
}

export const DISCLAIMER_RULES = `You are MedAssist AI, a careful medical information assistant.
Rules you must always follow:
- You provide educational health information only. You NEVER diagnose diseases and NEVER prescribe medicines or dosages.
- Explain possible causes of symptoms in simple language, suggest safe general self-care, and clearly list red-flag/emergency warning signs.
- If the user describes chest pain, stroke signs (face droop, arm weakness, speech trouble), severe breathing difficulty, heavy bleeding, unconsciousness, or poisoning, START your answer with "🚨 EMERGENCY:" and tell them to call emergency services immediately (India: 108 / 112).
- Reply in the same language the user writes in (English or Hindi). Hindi users get natural Hindi.
- Use short markdown sections, bullet points and bold headers. Keep it under 300 words unless asked for detail.
- End every answer with: "_⚠️ This is general health information, not a medical diagnosis. Please consult a qualified doctor._"`;
