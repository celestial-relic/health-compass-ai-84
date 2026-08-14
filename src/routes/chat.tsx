import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MessageSquareHeart, Send, Mic, Trash2, Sparkles, Bot, User2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { chatWithAI } from "@/lib/ai.functions";
import { STORE_KEYS, pushActivity, uid, useLocalStore, type ChatMessage } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Medical Chat | MedAssist AI" },
      {
        name: "description",
        content:
          "Chat with an AI health assistant in English or Hindi. Choose Gemini or ChatGPT and get safe, educational guidance with emergency warnings.",
      },
      { property: "og:title", content: "AI Medical Chat | MedAssist AI" },
      {
        property: "og:description",
        content: "Educational health answers in English and Hindi, powered by Gemini or ChatGPT.",
      },
    ],
  }),
  component: ChatPage,
});

const SUGGESTIONS = [
  "I've had a fever and headache for 2 days",
  "मुझे खांसी और गले में दर्द है, क्या करूँ?",
  "What do high cholesterol numbers mean?",
  "How much water should I drink daily?",
];

type Engine = "gemini" | "openai";

function ChatPage() {
  const send = useServerFn(chatWithAI);
  const { value: messages, setValue: setMessages } = useLocalStore<ChatMessage[]>(
    STORE_KEYS.chats,
    [],
  );
  const [input, setInput] = useState("");
  const [engine, setEngine] = useState<Engine>("gemini");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function submit(text: string) {
    const clean = text.trim();
    if (!clean || loading) return;
    const userMsg: ChatMessage = { id: uid(), role: "user", content: clean, createdAt: Date.now() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await send({
        data: {
          engine,
          messages: next.slice(-16).map((m) => ({ role: m.role, content: m.content })),
        },
      });
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "assistant", content: res.reply, createdAt: Date.now() },
      ]);
      pushActivity({ type: "chat", title: "AI chat", detail: clean.slice(0, 90) });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reach the AI service.");
      setMessages(next);
    } finally {
      setLoading(false);
    }
  }

  function startVoice() {
    const w = window as unknown as {
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
      SpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) {
      toast.error("Voice input isn't supported in this browser.");
      return;
    }
    const rec = new Ctor();
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.onresult = (e) => setInput(e.results[0][0].transcript);
    rec.onerror = () => toast.error("Could not hear you. Try again.");
    rec.onend = () => setListening(false);
    setListening(true);
    rec.start();
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-10">
        <PageHeader
          icon={MessageSquareHeart}
          title="AI Medical Chat"
          subtitle="Ask health questions in English or Hindi. Choose your AI engine — Gemini or ChatGPT via API."
        />

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">AI engine:</span>
          {(["gemini", "openai"] as const).map((e) => (
            <button
              key={e}
              onClick={() => setEngine(e)}
              className={cn(
                "rounded-full border border-border px-3 py-1.5 text-xs font-semibold transition-colors",
                engine === e ? "bg-brand text-primary-foreground" : "hover:bg-accent",
              )}
            >
              {e === "gemini" ? "Gemini" : "ChatGPT (API)"}
            </button>
          ))}
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-accent"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear chat
            </button>
          )}
        </div>

        <div className="glass-card flex h-[62vh] flex-col overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {messages.length === 0 && (
              <div className="grid h-full place-items-center text-center">
                <div>
                  <motion.span
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ repeat: Infinity, duration: 2.4 }}
                    className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-brand text-primary-foreground shadow-glow"
                  >
                    <Sparkles className="h-7 w-7" />
                  </motion.span>
                  <p className="mt-4 text-sm text-muted-foreground">
                    Describe how you feel — I'll explain it simply.
                  </p>
                </div>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}
                >
                  <span
                    className={cn(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-full",
                      m.role === "user" ? "bg-accent text-accent-foreground" : "bg-brand text-primary-foreground",
                    )}
                  >
                    {m.role === "user" ? <User2 className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </span>
                  <div className={cn("max-w-[82%]", m.role === "user" && "text-right")}>
                    <div
                      className={cn(
                        "prose prose-sm dark:prose-invert max-w-none rounded-2xl px-4 py-3 text-left text-sm",
                        m.role === "user"
                          ? "rounded-br-sm bg-brand text-primary-foreground"
                          : "rounded-bl-sm bg-muted",
                      )}
                    >
                      {m.role === "assistant" ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                      ) : (
                        <p className="whitespace-pre-wrap">{m.content}</p>
                      )}
                    </div>
                    <time className="mt-1 block text-[11px] text-muted-foreground">
                      {new Date(m.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-brand text-primary-foreground">
                  <Bot className="h-4 w-4" />
                </span>
                <span className="flex gap-1 rounded-2xl bg-muted px-4 py-3">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                      className="h-2 w-2 rounded-full bg-primary"
                    />
                  ))}
                </span>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-border/60 p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => submit(s)}
                  className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit(input);
              }}
              className="flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your health question…"
                aria-label="Your message"
                className="h-11 flex-1 rounded-full border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={startVoice}
                aria-label="Voice input"
                className={cn(
                  "grid h-11 w-11 place-items-center rounded-full border border-border transition-colors hover:bg-accent",
                  listening && "bg-destructive text-destructive-foreground",
                )}
              >
                <Mic className="h-4 w-4" />
              </button>
              <button
                type="submit"
                disabled={loading}
                aria-label="Send"
                className="grid h-11 w-11 place-items-center rounded-full bg-brand text-primary-foreground shadow-glow disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          ⚠️ MedAssist AI never diagnoses or prescribes. For emergencies call 108 / 112.
        </p>
      </div>
    </AppShell>
  );
}

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  start: () => void;
  onresult: (e: { results: Array<Array<{ transcript: string }>> }) => void;
  onerror: () => void;
  onend: () => void;
};
