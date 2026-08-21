import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Activity,
  MessageSquareHeart,
  Stethoscope,
  Pill,
  FileText,
  History,
  Calculator,
  Siren,
  User,
  Droplets,
  Clock,
} from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import {
  STORE_KEYS,
  emptyProfile,
  useLocalStore,
  type ActivityItem,
  type HealthProfile,
  type Reminder,
  type ReportRecord,
} from "@/lib/store";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard | MedAssist AI" },
      {
        name: "description",
        content:
          "Your personal health dashboard: medicine reminders, recent reports, AI conversations and a live health summary.",
      },
      { property: "og:title", content: "Dashboard | MedAssist AI" },
      {
        property: "og:description",
        content: "Reminders, reports, AI chats and health summary in one place.",
      },
    ],
  }),
  component: Dashboard,
});

const CARDS = [
  { to: "/chat", label: "AI Medical Chat", labelHi: "एआई मेडिकल चैट", icon: MessageSquareHeart, hint: "Ask in EN / हिंदी", hintHi: "अंग्रेज़ी / हिंदी में पूछें" },
  { to: "/symptoms", label: "Symptom Checker", labelHi: "लक्षण जाँचकर्ता", icon: Stethoscope, hint: "Risk triage", hintHi: "जोखिम आकलन" },
  { to: "/reports", label: "Lab Report Analyzer", labelHi: "लैब रिपोर्ट विश्लेषक", icon: FileText, hint: "PDF / photo", hintHi: "पीडीएफ / फोटो" },
  { to: "/reminders", label: "Medicine Reminder", labelHi: "दवा रिमाइंडर", icon: Pill, hint: "Never miss a dose", hintHi: "कोई खुराक न छूटे" },
  { to: "/history", label: "Health History", labelHi: "स्वास्थ्य इतिहास", icon: History, hint: "Full timeline", hintHi: "पूरी टाइमलाइन" },
  { to: "/tools", label: "Health Tools", labelHi: "हेल्थ टूल्स", icon: Calculator, hint: "BMI • water • sleep", hintHi: "बीएमआई • पानी • नींद" },
  { to: "/emergency", label: "Emergency & Hospitals", labelHi: "आपातकाल और अस्पताल", icon: Siren, hint: "SOS + maps", hintHi: "एसओएस + नक्शा" },
  { to: "/profile", label: "Profile & Settings", labelHi: "प्रोफ़ाइल और सेटिंग्स", icon: User, hint: "Your medical data", hintHi: "आपका मेडिकल डेटा" },
] as const;

function Dashboard() {
  const { t } = useI18n();
  const { value: reminders } = useLocalStore<Reminder[]>(STORE_KEYS.reminders, []);
  const { value: reports } = useLocalStore<ReportRecord[]>(STORE_KEYS.reports, []);
  const { value: activity } = useLocalStore<ActivityItem[]>(STORE_KEYS.activity, []);
  const { value: profile } = useLocalStore<HealthProfile>(STORE_KEYS.profile, emptyProfile);
  const { value: water } = useLocalStore<number>(STORE_KEYS.water, 0);

  const h = Number(profile.height);
  const w = Number(profile.weight);
  const bmi = h > 0 && w > 0 ? w / (h / 100) ** 2 : null;

  const upcoming = [...reminders]
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(0, 4);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-10">
        <PageHeader
          icon={Activity}
          title={
            profile.name
              ? t(`Hello, ${profile.name}`, `नमस्ते, ${profile.name}`)
              : t("Your health dashboard", "आपका स्वास्थ्य डैशबोर्ड")
          }
          subtitle={t(
            "Everything MedAssist AI knows about your health, in one calm view.",
            "MedAssist AI आपकी सेहत के बारे में जो जानता है, सब एक शांत जगह पर।",
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((c, i) => (
            <motion.div
              key={c.to}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -5 }}
            >
              <Link to={c.to} className="glass-card block p-5 transition-shadow hover:shadow-glow">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-primary">
                  <c.icon className="h-5 w-5" />
                </span>
                <p className="mt-3 font-semibold">{t(c.label, c.labelHi)}</p>
                <p className="text-xs text-muted-foreground">{t(c.hint, c.hintHi)}</p>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <section className="glass-card p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="h-4 w-4 text-primary" /> {t("Upcoming medicines", "आगामी दवाएँ")}
            </h2>
            {upcoming.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                {t("No reminders yet.", "अभी कोई रिमाइंडर नहीं है।")}{" "}
                <Link to="/reminders" className="text-primary underline">
                  {t("Add one", "एक जोड़ें")}
                </Link>
                .
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {upcoming.map((r) => (
                  <li key={r.id} className="flex items-center justify-between text-sm">
                    <span>
                      <span className="font-medium">{r.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {r.dosage} • {r.frequency}
                      </span>
                    </span>
                    <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
                      {r.time}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="glass-card p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <FileText className="h-4 w-4 text-primary" /> {t("Recent reports", "हाल की रिपोर्ट")}
            </h2>
            {reports.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                {t("No reports analyzed yet.", "अभी कोई रिपोर्ट विश्लेषित नहीं हुई।")}{" "}
                <Link to="/reports" className="text-primary underline">
                  {t("Upload one", "एक अपलोड करें")}
                </Link>
                .
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {reports.slice(0, 4).map((r) => (
                  <li key={r.id} className="text-sm">
                    <span className="font-medium">{r.fileName}</span>
                    <span className="block text-xs text-muted-foreground">
                      {new Date(r.createdAt).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="glass-card p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Droplets className="h-4 w-4 text-primary" /> {t("Health summary", "स्वास्थ्य सारांश")}
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t("BMI", "बीएमआई")}</dt>
                <dd className="font-semibold">{bmi ? bmi.toFixed(1) : "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t("Blood group", "ब्लड ग्रुप")}</dt>
                <dd className="font-semibold">{profile.bloodGroup || "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t("Allergies", "एलर्जी")}</dt>
                <dd className="max-w-[55%] truncate font-semibold">{profile.allergies || "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t("Water today", "आज पानी")}</dt>
                <dd className="font-semibold">
                  {water} {t("glasses", "गिलास")}
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <section className="glass-card mt-5 p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <History className="h-4 w-4 text-primary" /> {t("Recent activity", "हाल की गतिविधि")}
          </h2>
          {activity.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              {t(
                "Your AI conversations and health actions will appear here.",
                "आपकी एआई बातचीत और स्वास्थ्य गतिविधियाँ यहाँ दिखेंगी।",
              )}
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-border/60">
              {activity.slice(0, 6).map((a) => (
                <li key={a.id} className="flex items-start justify-between gap-4 py-3 text-sm">
                  <span>
                    <span className="font-medium">{a.title}</span>
                    <span className="block text-xs text-muted-foreground">{a.detail}</span>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(a.createdAt).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}
