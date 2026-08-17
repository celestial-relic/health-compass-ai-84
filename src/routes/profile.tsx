import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { User, Save, Trash2, Bell, Moon, Sun, Languages } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { useTheme } from "@/components/theme";
import { STORE_KEYS, emptyProfile, useLocalStore, type HealthProfile } from "@/lib/store";

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
      toast.error("Please enter a valid age.");
      return;
    }
    setValue(form);
    toast.success("Profile saved");
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-10">
        <PageHeader
          icon={User}
          title="Profile & Settings"
          subtitle="Your details make AI answers more relevant — and give responders what they need in an emergency."
        />

        <form onSubmit={save} className="glass-card space-y-4 p-6">
          <h2 className="text-sm font-semibold">Personal & medical details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <F label="Full name">
              <input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} />
            </F>
            <F label="Age">
              <input className="input" inputMode="numeric" value={form.age} onChange={(e) => set("age", e.target.value)} />
            </F>
            <F label="Gender">
              <select className="input" value={form.gender} onChange={(e) => set("gender", e.target.value)}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </F>
            <F label="Blood group">
              <select className="input" value={form.bloodGroup} onChange={(e) => set("bloodGroup", e.target.value)}>
                <option value="">Select</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </F>
            <F label="Height (cm)">
              <input className="input" inputMode="numeric" value={form.height} onChange={(e) => set("height", e.target.value)} />
            </F>
            <F label="Weight (kg)">
              <input className="input" inputMode="numeric" value={form.weight} onChange={(e) => set("weight", e.target.value)} />
            </F>
          </div>
          <F label="Allergies">
            <input className="input" placeholder="Penicillin, dust…" value={form.allergies} onChange={(e) => set("allergies", e.target.value)} />
          </F>
          <F label="Medical history / conditions">
            <textarea className="input min-h-24" value={form.conditions} onChange={(e) => set("conditions", e.target.value)} />
          </F>
          <div className="grid gap-4 sm:grid-cols-2">
            <F label="Emergency contact name">
              <input className="input" value={form.emergencyName} onChange={(e) => set("emergencyName", e.target.value)} />
            </F>
            <F label="Emergency contact phone">
              <input className="input" inputMode="tel" value={form.emergencyPhone} onChange={(e) => set("emergencyPhone", e.target.value)} />
            </F>
          </div>
          <button className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow">
            <Save className="h-4 w-4" /> Save profile
          </button>
        </form>

        <section className="glass-card mt-5 space-y-4 p-6">
          <h2 className="text-sm font-semibold">Settings</h2>

          <div className="flex items-center justify-between rounded-xl border border-border/60 p-4">
            <span className="flex items-center gap-2 text-sm">
              {theme === "dark" ? <Moon className="h-4 w-4 text-primary" /> : <Sun className="h-4 w-4 text-primary" />}
              Appearance
            </span>
            <button onClick={toggle} className="rounded-full border border-border px-4 py-2 text-xs font-semibold hover:bg-accent">
              Switch to {theme === "dark" ? "light" : "dark"} mode
            </button>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border/60 p-4">
            <span className="flex items-center gap-2 text-sm">
              <Languages className="h-4 w-4 text-primary" /> Preferred language
            </span>
            <select
              className="input w-40"
              value={form.language}
              onChange={(e) => {
                const language = e.target.value as HealthProfile["language"];
                setForm({ ...form, language });
                setValue({ ...form, language });
                toast.success("Language preference saved");
              }}
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
            </select>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border/60 p-4">
            <span className="flex items-center gap-2 text-sm">
              <Bell className="h-4 w-4 text-primary" /> Medicine notifications
              <span className="text-xs text-muted-foreground">({notif})</span>
            </span>
            <button
              onClick={async () => {
                if (typeof Notification === "undefined") {
                  toast.error("Notifications aren't supported here.");
                  return;
                }
                const p = await Notification.requestPermission();
                setNotif(p);
                toast[p === "granted" ? "success" : "error"](
                  p === "granted" ? "Notifications enabled" : "Notifications blocked",
                );
              }}
              className="rounded-full border border-border px-4 py-2 text-xs font-semibold hover:bg-accent"
            >
              Enable
            </button>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-destructive/40 bg-destructive/5 p-4">
            <span className="text-sm">
              Delete all local data
              <span className="block text-xs text-muted-foreground">
                Removes your profile, chats, reports and reminders from this device.
              </span>
            </span>
            <button
              onClick={() => {
                Object.values(STORE_KEYS).forEach((k) => window.localStorage.removeItem(k));
                setForm(emptyProfile);
                setValue(emptyProfile);
                toast.success("All local data deleted");
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-destructive px-4 py-2 text-xs font-semibold text-destructive-foreground"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
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
