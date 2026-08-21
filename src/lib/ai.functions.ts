import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const engineSchema = z.enum(["gemini", "openai"]).default("gemini");
const langSchema = z.enum(["en", "hi"]).default("en");

const chatInput = z.object({
  engine: engineSchema,
  lang: langSchema,
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(6000),
      }),
    )
    .min(1)
    .max(40),
});

/** Conversational health assistant (English + Hindi). */
export const chatWithAI = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => chatInput.parse(input))
  .handler(async ({ data }) => {
    const { askAI, DISCLAIMER_RULES } = await import("./ai.server");
    const langNote =
      data.lang === "hi"
        ? "The user's selected app language is Hindi. Reply in natural Hindi (Devanagari) regardless of the script the user typed in, unless they explicitly ask for English."
        : "The user's selected app language is English. Reply in English unless the user writes in Hindi.";
    const reply = await askAI(
      [
        { role: "system", content: `${DISCLAIMER_RULES}\n${langNote}` },
        ...data.messages,
      ],
      data.engine,
    );
    return { reply: reply || "Sorry, I could not generate a response. Please try again." };
  });

const symptomInput = z.object({
  engine: engineSchema,
  lang: langSchema,
  symptoms: z.array(z.string().min(1).max(80)).min(1).max(20),
  notes: z.string().max(1000).default(""),
  age: z.string().max(10).default(""),
  gender: z.string().max(20).default(""),
});

export type SymptomResult = {
  risk: "Low" | "Medium" | "High";
  summary: string;
  possibleCauses: string[];
  homeCare: string[];
  seeDoctor: string[];
  emergencySigns: string[];
};

/** Structured symptom triage with Low / Medium / High urgency. */
export const analyzeSymptoms = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => symptomInput.parse(input))
  .handler(async ({ data }): Promise<SymptomResult> => {
    const { askAI, DISCLAIMER_RULES } = await import("./ai.server");
    const langNote =
      data.lang === "hi"
        ? "Write all text values (summary, possibleCauses, homeCare, seeDoctor, emergencySigns) in natural Hindi (Devanagari)."
        : "Write all text values in English.";
    const raw = await askAI(
      [
        { role: "system", content: DISCLAIMER_RULES },
        {
          role: "user",
          content: `Triage these symptoms and reply with ONLY valid JSON (no markdown fence) using this exact shape:
{"risk":"Low|Medium|High","summary":"2-3 sentences in simple language","possibleCauses":["..."],"homeCare":["..."],"seeDoctor":["..."],"emergencySigns":["..."]}
Set risk to "High" for chest pain, stroke signs, severe breathing difficulty, heavy bleeding or fainting.
${langNote}
Patient age: ${data.age || "unknown"}; gender: ${data.gender || "unknown"}.
Symptoms: ${data.symptoms.join(", ")}.
Extra notes: ${data.notes || "none"}.`,
        },
      ],
      data.engine,
    );

    const cleaned = raw
      .trim()
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/, "")
      .trim();
    try {
      const parsed = JSON.parse(cleaned) as SymptomResult;
      return {
        risk: ["Low", "Medium", "High"].includes(parsed.risk) ? parsed.risk : "Medium",
        summary: parsed.summary ?? "",
        possibleCauses: parsed.possibleCauses ?? [],
        homeCare: parsed.homeCare ?? [],
        seeDoctor: parsed.seeDoctor ?? [],
        emergencySigns: parsed.emergencySigns ?? [],
      };
    } catch {
      return {
        risk: "Medium",
        summary: cleaned.slice(0, 800),
        possibleCauses: [],
        homeCare: [],
        seeDoctor: ["Please consult a doctor if symptoms persist or worsen."],
        emergencySigns: [],
      };
    }
  });

const reportInput = z.object({
  engine: engineSchema,
  fileName: z.string().min(1).max(200),
  mimeType: z.string().min(3).max(100),
  dataUrl: z.string().min(20).max(12_000_000),
});

/** Reads a lab report (image or PDF) and explains it in plain language. */
export const analyzeReport = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => reportInput.parse(input))
  .handler(async ({ data }) => {
    const { askAI, DISCLAIMER_RULES } = await import("./ai.server");
    const isPdf = data.mimeType.includes("pdf");
    const instruction = `Read this medical lab report and explain it for a non-medical person.
Use markdown with these sections:
## Overview
## Key Values (a markdown table: Test | Your Value | Normal Range | Status)
## What The Abnormal Values Mean
## Lifestyle & Next Steps
Mark abnormal values with ⚠️ and normal ones with ✅. Never diagnose or prescribe.`;

    const reply = await askAI(
      [
        { role: "system", content: DISCLAIMER_RULES },
        {
          role: "user",
          content: [
            { type: "text", text: instruction },
            isPdf
              ? { type: "file", file: { filename: data.fileName, file_data: data.dataUrl } }
              : { type: "image_url", image_url: { url: data.dataUrl } },
          ],
        },
      ],
      data.engine,
    );
    return { summary: reply || "Could not read this report. Try a clearer photo or a PDF." };
  });
