import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Stethoscope, Loader2, ShieldAlert, HeartPulse, Home, UserRound } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { analyzeSymptoms, type SymptomResult } from "@/lib/ai.functions";
import { STORE_KEYS, emptyProfile, pushActivity, useLocalStore, type HealthProfile } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/symptoms")({
  head: () => ({
    meta: [
      { title: "Symptom Checker | MedAssist AI" },
      {
        name: "description",
        content:
          "Select your symptoms and get an AI urgency read — Low, Medium or High risk — with home care tips and emergency warning signs.",
      },
      { property: "og:title", content: "Symptom Checker | MedAssist AI" },
      {
        property: "og:description",
        content: "AI symptom triage with Low / Medium / High urgency and safe next steps.",
      },
    ],
  }),
  component: SymptomsPage,
});

const COMMON = [
  { en: "Fever", hi: "बुखार" },
  { en: "Cough", hi: "खांसी" },
  { en: "Headache", hi: "सिरदर्द" },
  { en: "Sore throat", hi: "गले में खराश" },
  { en: "Vomiting", hi: "उल्टी" },
  { en: "Fatigue", hi: "थकान" },
  { en: "Chest pain", hi: "सीने में दर्द" },
  { en: "Breathing difficulty", hi: "सांस लेने में तकलीफ" },
  { en: "Body pain", hi: "बदन दर्द" },
  { en: "Stomach pain", hi: "पेट दर्द" },
  { en: "Dizziness", hi: "चक्कर आना" },
  { en: "Rash", hi: "त्वचा पर चकत्ते" },
];

const RISK_STYLES: Record<SymptomResult["risk"], string> = {
  Low: "bg-success/15 text-success border-success/40",
  Medium: "bg-warning/15 text-warning border-warning/40",
  High: "bg-destructive/15 text-destructive border-destructive/40",
};

function SymptomsPage() {
  const { t, lang } = useI18n();
  const analyze = useServerFn(analyzeSymptoms);
  const { value: profile } = useLocalStore<HealthProfile>(STORE_KEYS.profile, emptyProfile);
  const [selected, setSelected] = useState<string[]>([]);
  const [custom, setCustom] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SymptomResult | null>(null);

  const toggle = (s: string) =>
    setSelected((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  async function run() {
    const all = [...selected, ...custom.split(",").map((s) => s.trim()).filter(Boolean)];
    if (all.length === 0) {
      toast.error(t("Pick at least one symptom.", "कम से कम एक लक्षण चुनें।"));
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await analyze({
        data: {
          engine: "gemini",
          lang,
          symptoms: all.slice(0, 20),
          notes,
          age: profile.age,
          gender: profile.gender,
        },
      });
      setResult(res);
      pushActivity({
        type: "symptom",
        title: `${t("Symptom check", "लक्षण जांच")} — ${res.risk} ${t("risk", "जोखिम")}`,
        detail: all.join(", ").slice(0, 90),
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("Analysis failed.", "विश्लेषण विफल हुआ।"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-10">
        <PageHeader
          icon={Stethoscope}
          title={t("Symptom Checker", "लक्षण जांचक")}
          subtitle={t(
            "Tell MedAssist AI what you're feeling. You'll get an urgency level, likely explanations and clear next steps.",
            "MedAssist AI को बताएं कि आप कैसा महसूस कर रहे हैं। आपको एक तात्कालिकता स्तर, संभावित कारण और स्पष्ट अगले कदम मिलेंगे।",
          )}
        />

        <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
          <section className="glass-card p-6">
            <h2 className="text-sm font-semibold">{t("Select your symptoms", "अपने लक्षण चुनें")}</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {COMMON.map((s) => (
                <button
                  key={s.en}
                  onClick={() => toggle(t(s.en, s.hi))}
                  aria-pressed={selected.includes(t(s.en, s.hi))}
                  className={cn(
                    "rounded-full border border-border px-3.5 py-1.5 text-sm transition-all",
                    selected.includes(t(s.en, s.hi))
                      ? "bg-brand text-primary-foreground shadow-glow"
                      : "hover:bg-accent",
                  )}
                >
                  {t(s.en, s.hi)}
                </button>
              ))}
            </div>

            <label className="mt-6 block text-sm font-medium" htmlFor="custom">
              {t("Other symptoms (comma separated)", "अन्य लक्षण (कॉमा से अलग करें)")}
            </label>
            <input
              id="custom"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder={t("e.g. chills, loss of appetite", "जैसे ठंड लगना, भूख न लगना")}
              className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />

            <label className="mt-4 block text-sm font-medium" htmlFor="notes">
              {t("How long, how severe, anything else?", "कितने समय से, कितना गंभीर, और कुछ और?")}
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-2 w-full rounded-xl border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />

            <button
              onClick={run}
              disabled={loading}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Stethoscope className="h-4 w-4" />}
              {loading ? t("Analyzing…", "विश्लेषण हो रहा है…") : t("Analyze symptoms", "लक्षणों का विश्लेषण करें")}
            </button>
          </section>

          <section className="space-y-4">
            {loading && (
              <div className="glass-card space-y-3 p-6">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-4 animate-pulse rounded-full bg-muted"
                    style={{ width: `${90 - i * 12}%` }}
                  />
                ))}
              </div>
            )}

            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className={cn("glass-card border p-6", RISK_STYLES[result.risk])}>
                    <div className="flex items-center gap-3">
                      <motion.span
                        animate={{ scale: [1, 1.12, 1] }}
                        transition={{ repeat: Infinity, duration: 1.8 }}
                      >
                        <ShieldAlert className="h-7 w-7" />
                      </motion.span>
                      <div>
                        <p className="text-xs font-semibold tracking-wide uppercase">{t("Urgency", "तात्कालिकता")}</p>
                        <p className="text-2xl font-bold">{result.risk} {t("risk", "जोखिम")}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-foreground">{result.summary}</p>
                  </div>

                  {result.risk === "High" && (
                    <div className="animate-sos rounded-2xl border border-destructive/50 bg-destructive/10 p-5 text-sm">
                      <p className="font-bold text-destructive">{t("🚨 Seek emergency care now", "🚨 तुरंत आपातकालीन देखभाल लें")}</p>
                      <p className="mt-1 text-muted-foreground">
                        {t(
                          "Call 108 / 112 or go to the nearest emergency room immediately.",
                          "तुरंत 108 / 112 पर कॉल करें या नज़दीकी आपातकालीन कक्ष में जाएं।",
                        )}
                      </p>
                    </div>
                  )}

                  <ResultList icon={HeartPulse} title={t("Possible explanations", "संभावित कारण")} items={result.possibleCauses} />
                  <ResultList icon={Home} title={t("Safe home care", "सुरक्षित घरेलू देखभाल")} items={result.homeCare} />
                  <ResultList icon={UserRound} title={t("See a doctor if", "डॉक्टर से मिलें अगर")} items={result.seeDoctor} />
                  <ResultList icon={ShieldAlert} title={t("Emergency warning signs", "आपातकालीन चेतावनी संकेत")} items={result.emergencySigns} />

                  <p className="text-xs text-muted-foreground">
                    {t(
                      "⚠️ This is general health information, not a medical diagnosis. Please consult a qualified doctor.",
                      "⚠️ यह सामान्य स्वास्थ्य जानकारी है, चिकित्सा निदान नहीं। कृपया किसी योग्य डॉक्टर से सलाह लें।",
                    )}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

function ResultList({
  icon: Icon,
  title,
  items,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: string[];
}) {
  if (!items || items.length === 0) return null;
  return (
    <div className="glass-card p-5">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </h3>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {items.map((it) => (
          <li key={it} className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
