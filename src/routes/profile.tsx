import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { User, Save, Trash2, Bell, Moon, Sun, Languages } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { useTheme } from "@/components/theme";
import { STORE_KEYS, emptyProfile, useLocalStore, type HealthProfile } from "@/lib/store";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile & Settings | MedAssist AI" },
      {
        name: "description",
        content:
          "Manage your medical profile — age, blood group, allergies, conditions and emergency contacts — plus theme, language and notification settings.",
      },
      { property: "og:title", content: "Profile & Settings | MedAssist AI" },
      {
        property: "og:description",
        content: "Your medical details, emergency contacts and app preferences.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { t, lang, setLang } = useI18n();
  const { value: profile, setValue, hydrated } = useLocalStore<HealthProfile>(
    STORE_KEYS.profile,
    emptyProfile,
  );
  const { theme, toggle } = useTheme();
  const [form, setForm] = useState<HealthProfile>(emptyProfile);
  const [notif, setNotif] = useState<string>("default");

  useEffect(() => {
    if (hydrated) setForm(profile);
  }, [hydrated, profile]);

  useEffect(() => {
    if (typeof Notification !== "undefined") setNotif(Notification.permission);
  }, []);

  const set = (k: keyof HealthProfile, v: string) => setForm({ ...form, [k]: v });

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (form.age && (Number(form.age) <= 0 || Number(form.age) > 120)) {
      toast.error(t("Please enter a valid age.", "कृपया एक मान्य उम्र दर्ज करें।"));
      return;
    }
    setValue(form);
    toast.success(t("Profile saved", "प्रोफ़ाइल सहेजी गई"));
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-10">
        <PageHeader
          icon={User}
          title={t("Profile & Settings", "प्रोफ़ाइल और सेटिंग्स")}
          subtitle={t(
            "Your details make AI answers more relevant — and give responders what they need in an emergency.",
            "आपका विवरण एआई के जवाबों को अधिक प्रासंगिक बनाता है — और आपातकाल में मददगारों को जरूरी जानकारी देता है।",
          )}
        />

        <form onSubmit={save} className="glass-card space-y-4 p-6">
          <h2 className="text-sm font-semibold">{t("Personal & medical details", "व्यक्तिगत और चिकित्सा विवरण")}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <F label={t("Full name", "पूरा नाम")}>
              <input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} />
            </F>
            <F label={t("Age", "उम्र")}>
              <input className="input" inputMode="numeric" value={form.age} onChange={(e) => set("age", e.target.value)} />
            </F>
            <F label={t("Gender", "लिंग")}>
              <select className="input" value={form.gender} onChange={(e) => set("gender", e.target.value)}>
                <option value="">{t("Select", "चुनें")}</option>
                <option value="male">{t("Male", "पुरुष")}</option>
                <option value="female">{t("Female", "महिला")}</option>
                <option value="other">{t("Other", "अन्य")}</option>
              </select>
            </F>
            <F label={t("Blood group", "रक्त समूह")}>
              <select className="input" value={form.bloodGroup} onChange={(e) => set("bloodGroup", e.target.value)}>
                <option value="">{t("Select", "चुनें")}</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </F>
            <F label={t("Height (cm)", "ऊंचाई (सेमी)")}>
              <input className="input" inputMode="numeric" value={form.height} onChange={(e) => set("height", e.target.value)} />
            </F>
            <F label={t("Weight (kg)", "वजन (किग्रा)")}>
              <input className="input" inputMode="numeric" value={form.weight} onChange={(e) => set("weight", e.target.value)} />
            </F>
          </div>
          <F label={t("Allergies", "एलर्जी")}>
            <input className="input" placeholder={t("Penicillin, dust…", "पेनिसिलिन, धूल…")} value={form.allergies} onChange={(e) => set("allergies", e.target.value)} />
          </F>
          <F label={t("Medical history / conditions", "चिकित्सा इतिहास / स्थितियाँ")}>
            <textarea className="input min-h-24" value={form.conditions} onChange={(e) => set("conditions", e.target.value)} />
          </F>
          <div className="grid gap-4 sm:grid-cols-2">
            <F label={t("Emergency contact name", "आपातकालीन संपर्क नाम")}>
              <input className="input" value={form.emergencyName} onChange={(e) => set("emergencyName", e.target.value)} />
            </F>
            <F label={t("Emergency contact phone", "आपातकालीन संपर्क फोन")}>
              <input className="input" inputMode="tel" value={form.emergencyPhone} onChange={(e) => set("emergencyPhone", e.target.value)} />
            </F>
          </div>
          <button className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow">
            <Save className="h-4 w-4" /> {t("Save profile", "प्रोफ़ाइल सहेजें")}
          </button>
        </form>

        <section className="glass-card mt-5 space-y-4 p-6">
          <h2 className="text-sm font-semibold">{t("Settings", "सेटिंग्स")}</h2>

          <div className="flex items-center justify-between rounded-xl border border-border/60 p-4">
            <span className="flex items-center gap-2 text-sm">
              {theme === "dark" ? <Moon className="h-4 w-4 text-primary" /> : <Sun className="h-4 w-4 text-primary" />}
              {t("Appearance", "थीम")}
            </span>
            <button onClick={toggle} className="rounded-full border border-border px-4 py-2 text-xs font-semibold hover:bg-accent">
              {t("Switch to", "बदलें")} {theme === "dark" ? t("light", "लाइट") : t("dark", "डार्क")} {t("mode", "मोड")}
            </button>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border/60 p-4">
            <span className="flex items-center gap-2 text-sm">
              <Languages className="h-4 w-4 text-primary" /> {t("Preferred language", "पसंदीदा भाषा")}
            </span>
            <select
              className="input w-40"
              value={lang}
              onChange={(e) => {
                const language = e.target.value as HealthProfile["language"];
                setLang(language);
                setForm({ ...form, language });
                setValue({ ...form, language });
                toast.success(t("Language preference saved", "भाषा प्राथमिकता सहेजी गई"));
              }}
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
            </select>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border/60 p-4">
            <span className="flex items-center gap-2 text-sm">
              <Bell className="h-4 w-4 text-primary" /> {t("Medicine notifications", "दवा सूचनाएं")}
              <span className="text-xs text-muted-foreground">({notif})</span>
            </span>
            <button
              onClick={async () => {
                if (typeof Notification === "undefined") {
                  toast.error(t("Notifications aren't supported here.", "यहाँ सूचनाएं समर्थित नहीं हैं।"));
                  return;
                }
                const p = await Notification.requestPermission();
                setNotif(p);
                toast[p === "granted" ? "success" : "error"](
                  p === "granted"
                    ? t("Notifications enabled", "सूचनाएं सक्षम हैं")
                    : t("Notifications blocked", "सूचनाएं अवरुद्ध हैं"),
                );
              }}
              className="rounded-full border border-border px-4 py-2 text-xs font-semibold hover:bg-accent"
            >
              {t("Enable", "सक्षम करें")}
            </button>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-destructive/40 bg-destructive/5 p-4">
            <span className="text-sm">
              {t("Delete all local data", "सभी स्थानीय डेटा हटाएं")}
              <span className="block text-xs text-muted-foreground">
                {t(
                  "Removes your profile, chats, reports and reminders from this device.",
                  "यह इस डिवाइस से आपकी प्रोफ़ाइल, चैट, रिपोर्ट और रिमाइंडर हटा देता है।",
                )}
              </span>
            </span>
            <button
              onClick={() => {
                Object.values(STORE_KEYS).forEach((k) => window.localStorage.removeItem(k));
                setForm(emptyProfile);
                setValue(emptyProfile);
                toast.success(t("All local data deleted", "सभी स्थानीय डेटा हटाया गया"));
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-destructive px-4 py-2 text-xs font-semibold text-destructive-foreground"
            >
              <Trash2 className="h-3.5 w-3.5" /> {t("Delete", "हटाएं")}
            </button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      {children}
    </label>
  );
}
