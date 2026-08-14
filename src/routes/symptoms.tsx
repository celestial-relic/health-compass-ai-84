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
  "Fever",
  "Cough",
  "Headache",
  "Sore throat",
  "Vomiting",
  "Fatigue",
  "Chest pain",
  "Breathing difficulty",
  "Body pain",
  "Stomach pain",
  "Dizziness",
  "Rash",
];

const RISK_STYLES: Record<SymptomResult["risk"], string> = {
  Low: "bg-success/15 text-success border-success/40",
  Medium: "bg-warning/15 text-warning border-warning/40",
  High: "bg-destructive/15 text-destructive border-destructive/40",
};

function SymptomsPage() {
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
      toast.error("Pick at least one symptom.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await analyze({
        data: {
          engine: "gemini",
          symptoms: all.slice(0, 20),
          notes,
          age: profile.age,
          gender: profile.gender,
        },
      });
      setResult(res);
      pushActivity({
        type: "symptom",
        title: `Symptom check — ${res.risk} risk`,
        detail: all.join(", ").slice(0, 90),
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-10">
        <PageHeader
          icon={Stethoscope}
          title="Symptom Checker"
          subtitle="Tell MedAssist AI what you're feeling. You'll get an urgency level, likely explanations and clear next steps."
        />

        <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
          <section className="glass-card p-6">
            <h2 className="text-sm font-semibold">Select your symptoms</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {COMMON.map((s) => (
                <button
                  key={s}
                  onClick={() => toggle(s)}
                  aria-pressed={selected.includes(s)}
                  className={cn(
                    "rounded-full border border-border px-3.5 py-1.5 text-sm transition-all",
                    selected.includes(s)
                      ? "bg-brand text-primary-foreground shadow-glow"
                      : "hover:bg-accent",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>

            <label className="mt-6 block text-sm font-medium" htmlFor="custom">
              Other symptoms (comma separated)
            </label>
            <input
              id="custom"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="e.g. chills, loss of appetite"
              className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />

            <label className="mt-4 block text-sm font-medium" htmlFor="notes">
              How long, how severe, anything else?
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
              {loading ? "Analyzing…" : "Analyze symptoms"}
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
                        <p className="text-xs font-semibold tracking-wide uppercase">Urgency</p>
                        <p className="text-2xl font-bold">{result.risk} risk</p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-foreground">{result.summary}</p>
                  </div>

                  {result.risk === "High" && (
                    <div className="animate-sos rounded-2xl border border-destructive/50 bg-destructive/10 p-5 text-sm">
                      <p className="font-bold text-destructive">🚨 Seek emergency care now</p>
                      <p className="mt-1 text-muted-foreground">
                        Call 108 / 112 or go to the nearest emergency room immediately.
                      </p>
                    </div>
                  )}

                  <ResultList icon={HeartPulse} title="Possible explanations" items={result.possibleCauses} />
                  <ResultList icon={Home} title="Safe home care" items={result.homeCare} />
                  <ResultList icon={UserRound} title="See a doctor if" items={result.seeDoctor} />
                  <ResultList icon={ShieldAlert} title="Emergency warning signs" items={result.emergencySigns} />

                  <p className="text-xs text-muted-foreground">
                    ⚠️ This is general health information, not a medical diagnosis. Please consult a
                    qualified doctor.
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
