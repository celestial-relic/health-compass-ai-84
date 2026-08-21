import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Calculator, Droplets, Flame, Moon } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { STORE_KEYS, emptyProfile, pushActivity, useLocalStore, type HealthProfile } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

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

const ACTIVITY_LEVELS = [
  { value: "1.2", label: "Sedentary", labelHi: "निष्क्रिय" },
  { value: "1.375", label: "Lightly active", labelHi: "थोड़ा सक्रिय" },
  { value: "1.55", label: "Moderately active", labelHi: "मध्यम सक्रिय" },
  { value: "1.725", label: "Very active", labelHi: "अत्यधिक सक्रिय" },
];

function ToolsPage() {
  const { t } = useI18n();
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
      ? { label: t("—", "—"), tip: t("Enter your height and weight.", "अपनी ऊंचाई और वजन दर्ज करें।"), color: "bg-muted" }
      : bmi < 18.5
        ? {
            label: t("Underweight", "कम वजन"),
            tip: t(
              "Add calorie-dense, protein-rich foods like nuts, dals, eggs and milk. Ask a doctor if weight keeps dropping.",
              "मेवे, दाल, अंडे और दूध जैसे कैलोरी-युक्त, प्रोटीन-युक्त भोजन शामिल करें। यदि वजन लगातार घट रहा हो तो डॉक्टर से पूछें।",
            ),
            color: "bg-chart-3",
          }
        : bmi < 25
          ? {
              label: t("Healthy", "स्वस्थ"),
              tip: t(
                "Great range. Keep 30 minutes of daily movement and a balanced plate half-filled with vegetables.",
                "बेहतरीन सीमा। रोजाना 30 मिनट गतिविधि करें और थाली का आधा हिस्सा सब्जियों से भरा रखें।",
              ),
              color: "bg-success",
            }
          : bmi < 30
            ? {
                label: t("Overweight", "अधिक वजन"),
                tip: t(
                  "Small steady changes work best: cut sugary drinks, walk 8,000+ steps and prioritise sleep.",
                  "छोटे स्थिर बदलाव सबसे बेहतर काम करते हैं: मीठे पेय कम करें, 8,000+ कदम चलें और नींद को प्राथमिकता दें।",
                ),
                color: "bg-warning",
              }
            : {
                label: t("Obese", "मोटापा"),
                tip: t(
                  "Consider a check-up for blood sugar, blood pressure and lipids, and a supervised nutrition plan.",
                  "रक्त शर्करा, रक्तचाप और लिपिड की जांच और एक निगरानी वाली पोषण योजना पर विचार करें।",
                ),
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
          title={t("Health Tools", "स्वास्थ्य उपकरण")}
          subtitle={t("Quick calculators with tips you can actually act on today.", "त्वरित कैलकुलेटर जिनकी सलाह पर आप आज ही अमल कर सकते हैं।")}
        />

        <div className="grid gap-5 lg:grid-cols-2">
          <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
            <h2 className="text-sm font-semibold">{t("BMI Calculator", "बीएमआई कैलकुलेटर")}</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="text-sm">
                <span className="mb-1 block font-medium">{t("Height (cm)", "ऊंचाई (सेमी)")}</span>
                <input value={height} onChange={(e) => setHeight(e.target.value)} className="input" inputMode="numeric" />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium">{t("Weight (kg)", "वजन (किलो)")}</span>
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
              <Flame className="h-4 w-4 text-primary" /> {t("Daily Calorie Needs", "दैनिक कैलोरी आवश्यकता")}
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="text-sm">
                <span className="mb-1 block font-medium">{t("Age", "आयु")}</span>
                <input value={age} onChange={(e) => setAge(e.target.value)} className="input" inputMode="numeric" />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium">{t("Gender", "लिंग")}</span>
                <select value={gender} onChange={(e) => setGender(e.target.value)} className="input">
                  <option value="male">{t("Male", "पुरुष")}</option>
                  <option value="female">{t("Female", "महिला")}</option>
                </select>
              </label>
            </div>
            <label className="mt-3 block text-sm">
              <span className="mb-1 block font-medium">{t("Activity level", "गतिविधि स्तर")}</span>
              <select value={activity} onChange={(e) => setActivity(e.target.value)} className="input">
                {ACTIVITY_LEVELS.map((a) => (
                  <option key={a.value} value={a.value}>
                    {t(a.label, a.labelHi)}
                  </option>
                ))}
              </select>
            </label>
            <p className="mt-5 text-4xl font-bold">{Number.isFinite(calories) ? calories : "—"} kcal</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {t(
                "Maintenance estimate. For gradual weight loss aim ~500 kcal lower, and keep protein at roughly 1.2 g per kg body weight.",
                "यह एक अनुमान है। धीरे-धीरे वजन घटाने के लिए ~500 kcal कम लक्ष्य रखें, और प्रोटीन लगभग 1.2 ग्राम प्रति किलो शरीर के वजन के अनुसार रखें।",
              )}
            </p>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Droplets className="h-4 w-4 text-primary" /> {t("Water Intake", "पानी का सेवन")}
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">
              {t("Your goal:", "आपका लक्ष्य:")} <strong className="text-foreground">{waterGoal} {t("glasses", "गिलास")}</strong> {t("(250 ml each)", "(प्रत्येक 250 मिली)")}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {Array.from({ length: waterGoal }).map((_, i) => (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setWater(i + 1 === water ? i : i + 1)}
                  aria-label={t(`Set water to ${i + 1} glasses`, `पानी को ${i + 1} गिलास पर सेट करें`)}
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
                ? t("Goal reached — nice work! 💧", "लक्ष्य पूरा हुआ — शानदार काम! 💧")
                : t(
                    "Sip regularly instead of large amounts at once; add more in hot weather or after exercise.",
                    "एक बार में अधिक मात्रा के बजाय नियमित रूप से पानी पिएं; गर्म मौसम में या व्यायाम के बाद अधिक पिएं।",
                  )}
            </p>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card p-6"
          >
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Moon className="h-4 w-4 text-primary" /> {t("Sleep Tracker", "नींद ट्रैकर")}
            </h2>
            <div className="mt-4 flex gap-2">
              <input
                value={sleepInput}
                onChange={(e) => setSleepInput(e.target.value)}
                className="input"
                inputMode="decimal"
                aria-label={t("Hours slept last night", "पिछली रात सोने के घंटे")}
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
                {t("Log night", "रात दर्ज करें")}
              </button>
            </div>
            <div className="mt-5 flex h-28 items-end gap-1.5">
              {sleep.length === 0 && (
                <p className="text-sm text-muted-foreground">{t("Log a night to see your trend.", "अपने रुझान को देखने के लिए एक रात दर्ज करें।")}</p>
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
                ? t(
                    `Average ${avgSleep.toFixed(1)} h. ${avgSleep >= 7 ? "Right in the healthy adult range." : "Adults generally need 7–9 hours; try a fixed bedtime and no screens 45 min before."}`,
                    `औसत ${avgSleep.toFixed(1)} घंटे। ${avgSleep >= 7 ? "स्वस्थ वयस्क सीमा में सही है।" : "वयस्कों को आमतौर पर 7–9 घंटे चाहिए; एक निश्चित सोने का समय रखें और सोने से 45 मिनट पहले स्क्रीन से दूर रहें।"}`,
                  )
                : t("Adults generally need 7–9 hours of sleep.", "वयस्कों को आमतौर पर 7–9 घंटे की नींद चाहिए।")}
            </p>
          </motion.section>
        </div>
      </div>
    </AppShell>
  );
}
