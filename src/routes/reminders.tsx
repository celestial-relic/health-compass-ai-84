import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Pill, Plus, Trash2, Check, X, BellRing } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { STORE_KEYS, pushActivity, uid, useLocalStore, type Reminder } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reminders")({
  head: () => ({
    meta: [
      { title: "Medicine Reminders | MedAssist AI" },
      {
        name: "description",
        content:
          "Schedule medicines with dosage, frequency and reminder times. Get browser notifications and log every dose as taken or missed.",
      },
      { property: "og:title", content: "Medicine Reminders | MedAssist AI" },
      {
        property: "og:description",
        content: "Never miss a dose — schedule, track and log your medicines.",
      },
    ],
  }),
  component: RemindersPage,
});

const today = () => new Date().toISOString().slice(0, 10);

const blank = {
  name: "",
  dosage: "",
  frequency: "Once daily",
  startDate: today(),
  endDate: "",
  time: "09:00",
};

function RemindersPage() {
  const { value: reminders, setValue } = useLocalStore<Reminder[]>(STORE_KEYS.reminders, []);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState<string | null>(null);

  // Browser notifications when a dose is due (checked every 30s).
  useEffect(() => {
    if (typeof Notification === "undefined") return;
    const fired = new Set<string>();
    const timer = window.setInterval(() => {
      const now = new Date();
      const hhmm = now.toTimeString().slice(0, 5);
      for (const r of reminders) {
        const key = `${r.id}-${today()}-${r.time}`;
        if (r.time === hhmm && !fired.has(key)) {
          fired.add(key);
          if (Notification.permission === "granted") {
            new Notification("💊 Time for your medicine", {
              body: `${r.name} — ${r.dosage}`,
            });
          }
          toast.info(`Time for ${r.name} (${r.dosage})`);
        }
      }
    }, 30_000);
    return () => window.clearInterval(timer);
  }, [reminders]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.dosage.trim()) {
      toast.error("Medicine name and dosage are required.");
      return;
    }
    if (form.endDate && form.endDate < form.startDate) {
      toast.error("End date cannot be before the start date.");
      return;
    }
    if (editing) {
      setValue((prev) => prev.map((r) => (r.id === editing ? { ...r, ...form } : r)));
      toast.success("Reminder updated");
      setEditing(null);
    } else {
      setValue((prev) => [...prev, { id: uid(), log: {}, ...form }]);
      pushActivity({ type: "reminder", title: `Added ${form.name}`, detail: `${form.dosage} at ${form.time}` });
      toast.success("Reminder added");
      if (typeof Notification !== "undefined" && Notification.permission === "default") {
        void Notification.requestPermission();
      }
    }
    setForm(blank);
  }

  function mark(id: string, status: "taken" | "missed") {
    setValue((prev) =>
      prev.map((r) => (r.id === id ? { ...r, log: { ...r.log, [today()]: status } } : r)),
    );
    toast.success(status === "taken" ? "Marked as taken" : "Marked as missed");
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-10">
        <PageHeader
          icon={Pill}
          title="Medicine Reminders"
          subtitle="Add your medicines once — MedAssist AI keeps the schedule and nudges you at the right time."
        />

        <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
          <form onSubmit={submit} className="glass-card h-fit space-y-3 p-6">
            <h2 className="text-sm font-semibold">{editing ? "Edit medicine" : "Add medicine"}</h2>
            <Field label="Medicine name">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input"
                placeholder="Paracetamol"
              />
            </Field>
            <Field label="Dosage">
              <input
                value={form.dosage}
                onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                className="input"
                placeholder="500 mg, 1 tablet"
              />
            </Field>
            <Field label="Frequency">
              <select
                value={form.frequency}
                onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                className="input"
              >
                {["Once daily", "Twice daily", "Three times daily", "Weekly", "As needed"].map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start date">
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="input"
                />
              </Field>
              <Field label="End date">
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="input"
                />
              </Field>
            </div>
            <Field label="Reminder time">
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="input"
              />
            </Field>
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow">
              <Plus className="h-4 w-4" /> {editing ? "Save changes" : "Add reminder"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setForm(blank);
                }}
                className="w-full rounded-full border border-border py-2 text-xs font-semibold"
              >
                Cancel edit
              </button>
            )}
          </form>

          <section className="space-y-3">
            {reminders.length === 0 && (
              <div className="glass-card grid place-items-center p-12 text-center text-sm text-muted-foreground">
                <BellRing className="mb-3 h-8 w-8 text-primary" />
                No medicines scheduled yet.
              </div>
            )}
            <AnimatePresence>
              {reminders.map((r) => {
                const status = r.log[today()];
                return (
                  <motion.article
                    key={r.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="glass-card flex flex-wrap items-center gap-4 p-5"
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-primary">
                      <Pill className="h-5 w-5" />
                    </span>
                    <div className="min-w-[160px] flex-1">
                      <p className="font-semibold">{r.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.dosage} • {r.frequency} • {r.time}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {r.startDate} → {r.endDate || "ongoing"}
                      </p>
                    </div>
                    {status && (
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-semibold",
                          status === "taken"
                            ? "bg-success/15 text-success"
                            : "bg-destructive/15 text-destructive",
                        )}
                      >
                        {status}
                      </span>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => mark(r.id, "taken")}
                        aria-label="Mark taken"
                        className="grid h-9 w-9 place-items-center rounded-full border border-border hover:bg-success/15"
                      >
                        <Check className="h-4 w-4 text-success" />
                      </button>
                      <button
                        onClick={() => mark(r.id, "missed")}
                        aria-label="Mark missed"
                        className="grid h-9 w-9 place-items-center rounded-full border border-border hover:bg-warning/15"
                      >
                        <X className="h-4 w-4 text-warning" />
                      </button>
                      <button
                        onClick={() => {
                          setEditing(r.id);
                          setForm({
                            name: r.name,
                            dosage: r.dosage,
                            frequency: r.frequency,
                            startDate: r.startDate,
                            endDate: r.endDate,
                            time: r.time,
                          });
                        }}
                        className="rounded-full border border-border px-3 text-xs font-semibold hover:bg-accent"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setValue((prev) => prev.filter((x) => x.id !== r.id));
                          toast.success("Reminder deleted");
                        }}
                        aria-label="Delete"
                        className="grid h-9 w-9 place-items-center rounded-full border border-border hover:bg-destructive/15"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </button>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      {children}
    </label>
  );
}
