import { Link, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState, type ReactNode } from "react";
import {
  Activity,
  HeartPulse,
  Menu,
  Moon,
  Search,
  Sun,
  X,
  MessageSquareHeart,
  Stethoscope,
  Pill,
  FileText,
  History,
  Calculator,
  Siren,
  User,
} from "lucide-react";
import { useTheme } from "@/components/theme";
import { MagnifierCursor } from "@/components/MagnifierCursor";
import { cn } from "@/lib/utils";

export const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: Activity },
  { to: "/chat", label: "AI Chat", icon: MessageSquareHeart },
  { to: "/symptoms", label: "Symptoms", icon: Stethoscope },
  { to: "/reminders", label: "Medicines", icon: Pill },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/tools", label: "Health Tools", icon: Calculator },
  { to: "/emergency", label: "Emergency", icon: Siren },
  { to: "/history", label: "History", icon: History },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { theme, toggle } = useTheme();
  const [magnifier, setMagnifier] = useState(false);
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background">
      <MagnifierCursor active={magnifier} />

      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-primary-foreground shadow-glow">
              <HeartPulse className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">
              MedAssist <span className="text-brand">AI</span>
            </span>
          </Link>

          <nav className="ml-6 hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                  path === item.to && "bg-accent text-accent-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setMagnifier((m) => !m)}
              aria-pressed={magnifier}
              aria-label="Toggle magnifier cursor"
              title="Magnifier cursor"
              className={cn(
                "grid h-9 w-9 place-items-center rounded-full border border-border transition-colors hover:bg-accent",
                magnifier && "bg-brand text-primary-foreground",
              )}
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              onClick={toggle}
              aria-label="Toggle dark mode"
              className="grid h-9 w-9 place-items-center rounded-full border border-border transition-colors hover:bg-accent"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setOpen((o) => !o)}
              aria-label="Menu"
              className="grid h-9 w-9 place-items-center rounded-full border border-border lg:hidden"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-border/60 lg:hidden"
            >
              <div className="grid grid-cols-2 gap-2 p-4">
                {NAV.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-xl border border-border/60 px-3 py-2 text-sm"
                  >
                    <item.icon className="h-4 w-4 text-primary" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <motion.main
        key={path}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        {children}
      </motion.main>

      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        MedAssist AI provides educational health information only — never a medical diagnosis.
        Always consult a qualified doctor. In an emergency call 108 / 112.
      </footer>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
}: {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="mb-8 flex items-start gap-4">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand text-primary-foreground shadow-glow">
        <Icon className="h-6 w-6" />
      </span>
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}
