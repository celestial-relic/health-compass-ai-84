import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Calculator, Droplets, Flame, Moon } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { STORE_KEYS, emptyProfile, pushActivity, useLocalStore, type HealthProfile } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tools")({
  head: () => ({
    meta: [
      { title: "Health Tools — BMI, Water, Calories, Sleep | MedAssist AI" },
      {
        name: "description",
        content:
          "Calculate BMI, daily calorie needs and water goals, and track sleep with visual progress and personalised health tips.",
      },
      { property: "og:title", content: "Health Tools | MedAssist AI" },
      {
        property: "og:description",
        content: "BMI, calorie, water and sleep tools with personalised tips.",
      },
    ],
  }),
  component: ToolsPage,
});

function ToolsPage() {
  const { value: profile } = useLocalStore<HealthProfile>(STORE_KEYS.profile, emptyProfile);
  const [height, setHeight] = useState(profile.height || "170");
  const [weight, setWeight] = useState(profile.weight || "70");
  const [age, setAge] = useState(profile.age || "30");
  const [gender, setGender] = useState(profile.gender || "male");
  const [activity, setActivity] = useState("1.375");
  const { value: water, setValue: setWater } = useLocalStore<number>(STORE_KEYS.water, 0);
  const { value: sleep, setValue: setSleep } = useLocalStore<number[]>(STORE_KEYS.sleep, []);
  const [sleepInput, setSleepInput] = useState("7");

  const bmi = useMemo(() => {
    const h = Number(height) / 100;
    const w = Number(weight);
    return h > 0 && w > 0 ? w / (h * h) : 0;
  }, [height, weight]);

  const bmiBand =
    bmi === 0
      ? { label: "—", tip: "Enter your height and weight.", color: "bg-muted" }
      : bmi < 18.5
        ? {
            label: "Underweight",
            tip: "Add calorie-dense, protein-rich foods like nuts, dals, eggs and milk. Ask a doctor if weight keeps dropping.",
            color: "bg-chart-3",
          }
        : bmi < 25
          ? {
              label: "Healthy",
              tip: "Great range. Keep 30 minutes of daily movement and a balanced plate half-filled with vegetables.",
              color: "bg-success",
            }
          : bmi < 30
            ? {
                label: "Overweight",
                tip: "Small steady changes work best: cut sugary drinks, walk 8,000+ steps and prioritise sleep.",
                color: "bg-warning",
              }
            : {
                label: "Obese",
                tip: "Consider a check-up for blood sugar, blood pressure and lipids, and a supervised nutrition plan.",
                color: "bg-destructive",
              };

  const bmr =
    gender === "female"
      ? 10 * Number(weight) + 6.25 * Number(height) - 5 * Number(age) - 161
      : 10 * Number(weight) + 6.25 * Number(height) - 5 * Number(age) + 5;
  const calories = Math.round(bmr * Number(activity));
  const waterGoal = Math.max(6, Math.round((Number(weight) * 35) / 250));
  const avgSleep = sleep.length ? sleep.reduce((a, b) => a + b, 0) / sleep.length : 0;

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <PageHeader
          icon={Calculator}
          title="Health Tools"
          subtitle="Quick calculators with tips you can actually act on today."
        />

        <div className="grid gap-5 lg:grid-cols-2">
          <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
            <h2 className="text-sm font-semibold">BMI Calculator</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="text-sm">
                <span className="mb-1 block font-medium">Height (cm)</span>
                <input value={height} onChange={(e) => setHeight(e.target.value)} className="input" inputMode="numeric" />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium">Weight (kg)</span>
                <input value={weight} onChange={(e) => setWeight(e.target.value)} className="input" inputMode="numeric" />
              </label>
            </div>
            <p className="mt-5 text-4xl font-bold">{bmi ? bmi.toFixed(1) : "—"}</p>
            <p className="text-sm font-semibold text-muted-foreground">{bmiBand.label}</p>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                animate={{ width: `${Math.min(100, (bmi / 40) * 100)}%` }}
                className={cn("h-full rounded-full", bmiBand.color)}
              />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{bmiBand.tip}</p>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass-card p-6"
          >
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Flame className="h-4 w-4 text-primary" /> Daily Calorie Needs
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="text-sm">
                <span className="mb-1 block font-medium">Age</span>
                <input value={age} onChange={(e) => setAge(e.target.value)} className="input" inputMode="numeric" />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium">Gender</span>
                <select value={gender} onChange={(e) => setGender(e.target.value)} className="input">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </label>
            </div>
            <label className="mt-3 block text-sm">
              <span className="mb-1 block font-medium">Activity level</span>
              <select value={activity} onChange={(e) => setActivity(e.target.value)} className="input">
                <option value="1.2">Sedentary</option>
                <option value="1.375">Lightly active</option>
                <option value="1.55">Moderately active</option>
                <option value="1.725">Very active</option>
              </select>
            </label>
            <p className="mt-5 text-4xl font-bold">{Number.isFinite(calories) ? calories : "—"} kcal</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Maintenance estimate. For gradual weight loss aim ~500 kcal lower, and keep protein at
              roughly 1.2 g per kg body weight.
            </p>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Droplets className="h-4 w-4 text-primary" /> Water Intake
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">
              Your goal: <strong className="text-foreground">{waterGoal} glasses</strong> (250 ml each)
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {Array.from({ length: waterGoal }).map((_, i) => (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setWater(i + 1 === water ? i : i + 1)}
                  aria-label={`Set water to ${i + 1} glasses`}
                  className={cn(
                    "h-9 w-7 rounded-md border border-border transition-colors",
                    i < water ? "bg-brand" : "bg-muted",
                  )}
                />
              ))}
            </div>
            <p className="mt-4 text-2xl font-bold">
              {water} / {waterGoal}
            </p>
            <p className="text-sm text-muted-foreground">
              {water >= waterGoal
                ? "Goal reached — nice work! 💧"
                : "Sip regularly instead of large amounts at once; add more in hot weather or after exercise."}
            </p>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card p-6"
          >
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Moon className="h-4 w-4 text-primary" /> Sleep Tracker
            </h2>
            <div className="mt-4 flex gap-2">
              <input
                value={sleepInput}
                onChange={(e) => setSleepInput(e.target.value)}
                className="input"
                inputMode="decimal"
                aria-label="Hours slept last night"
              />
              <button
                onClick={() => {
                  const h = Number(sleepInput);
                  if (!h || h <= 0 || h > 24) return;
                  setSleep((prev) => [...prev, h].slice(-14));
                  pushActivity({ type: "tool", title: "Sleep logged", detail: `${h} hours` });
                }}
                className="shrink-0 rounded-full bg-brand px-5 text-sm font-semibold text-primary-foreground shadow-glow"
              >
                Log night
              </button>
            </div>
            <div className="mt-5 flex h-28 items-end gap-1.5">
              {sleep.length === 0 && (
                <p className="text-sm text-muted-foreground">Log a night to see your trend.</p>
              )}
              {sleep.map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.min(100, (h / 10) * 100)}%` }}
                  className={cn("flex-1 rounded-t-md", h >= 7 ? "bg-success" : "bg-warning")}
                  title={`${h} h`}
                />
              ))}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {avgSleep
                ? `Average ${avgSleep.toFixed(1)} h. ${avgSleep >= 7 ? "Right in the healthy adult range." : "Adults generally need 7–9 hours; try a fixed bedtime and no screens 45 min before."}`
                : "Adults generally need 7–9 hours of sleep."}
            </p>
          </motion.section>
        </div>
      </div>
    </AppShell>
  );
}
