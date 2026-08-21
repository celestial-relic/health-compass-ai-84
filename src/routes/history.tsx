import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { History, Search, MessageSquareHeart, FileText, Pill, Stethoscope, Calculator } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { STORE_KEYS, useLocalStore, type ActivityItem } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Health History | MedAssist AI" },
      {
        name: "description",
        content:
          "A chronological timeline of your AI chats, analyzed reports, symptom checks, medicines and health tool activity — searchable and filterable.",
      },
      { property: "og:title", content: "Health History | MedAssist AI" },
      {
        property: "og:description",
        content: "Search and filter every health action you've taken in MedAssist AI.",
      },
    ],
  }),
  component: HistoryPage,
});

const FILTERS = [
  { key: "all", label: "All", labelHi: "सभी", icon: History },
  { key: "chat", label: "AI chats", labelHi: "एआई चैट", icon: MessageSquareHeart },
  { key: "symptom", label: "Symptom checks", labelHi: "लक्षण जांच", icon: Stethoscope },
  { key: "report", label: "Reports", labelHi: "रिपोर्ट", icon: FileText },
  { key: "reminder", label: "Medicines", labelHi: "दवाइयाँ", icon: Pill },
  { key: "tool", label: "Health tools", labelHi: "स्वास्थ्य उपकरण", icon: Calculator },
] as const;

function HistoryPage() {
  const { t } = useI18n();
  const { value: activity } = useLocalStore<ActivityItem[]>(STORE_KEYS.activity, []);
  const [filter, setFilter] = useState<string>("all");
  const [query, setQuery] = useState("");

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return activity
      .filter((a) => (filter === "all" ? true : a.type === filter))
      .filter((a) => (q ? `${a.title} ${a.detail}`.toLowerCase().includes(q) : true))
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [activity, filter, query]);

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-10">
        <PageHeader
          icon={History}
          title={t("Health History", "स्वास्थ्य इतिहास")}
          subtitle={t("Everything you've done in MedAssist AI, newest first.", "MedAssist AI में आपने जो कुछ भी किया है, सबसे नया पहले।")}
        />

        <div className="glass-card mb-5 p-5">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("Search your history…", "अपना इतिहास खोजें…")}
              aria-label={t("Search history", "इतिहास खोजें")}
              className="h-11 w-full rounded-full border border-input bg-background pr-4 pl-9 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold transition-colors",
                  filter === f.key ? "bg-brand text-primary-foreground" : "hover:bg-accent",
                )}
              >
                <f.icon className="h-3.5 w-3.5" />
                {t(f.label, f.labelHi)}
              </button>
            ))}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="glass-card grid place-items-center p-14 text-center text-sm text-muted-foreground">
            {t(
              "Nothing here yet — start a chat, check symptoms or upload a report.",
              "यहाँ अभी कुछ नहीं है — चैट शुरू करें, लक्षण जांचें या रिपोर्ट अपलोड करें।",
            )}
          </div>
        ) : (
          <ol className="relative space-y-3 border-l border-border pl-6">
            {items.map((a, i) => (
              <motion.li
                key={a.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.4) }}
                className="glass-card relative p-4"
              >
                <span className="absolute top-6 -left-[31px] h-3 w-3 rounded-full bg-brand ring-4 ring-background" />
                <p className="text-sm font-semibold">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.detail}</p>
                <time className="mt-1 block text-[11px] text-muted-foreground">
                  {new Date(a.createdAt).toLocaleString()}
                </time>
              </motion.li>
            ))}
          </ol>
        )}
      </div>
    </AppShell>
  );
}
