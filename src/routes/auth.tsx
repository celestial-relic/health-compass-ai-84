import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HeartPulse, Loader2, Mail, Lock, KeyRound, ArrowLeft, Languages } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in | MedAssist AI" },
      {
        name: "description",
        content:
          "Sign in to MedAssist AI with email or Google, reset your password with a one-time code, and pick English or Hindi.",
      },
      { property: "og:title", content: "Sign in | MedAssist AI" },
      {
        property: "og:description",
        content: "Secure login with Google or email, OTP password reset, English and Hindi.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";

function AuthPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const { t, lang, setLang } = useI18n();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  // OTP reset flow
  const [otpStage, setOtpStage] = useState<"email" | "code" | "password">("email");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (!loading && session) navigate({ to: "/dashboard", replace: true });
  }, [loading, session, navigate]);

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error(t("Password must be at least 6 characters.", "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।"));
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (!data.session) {
          toast.success(
            t("Check your email to confirm your account.", "अपना खाता सत्यापित करने के लिए ईमेल देखें।"),
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success(t("Welcome back!", "वापस स्वागत है!"));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("Something went wrong.", "कुछ गलत हो गया।"));
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error(t("Google sign-in failed.", "गूगल साइन-इन विफल रहा।"));
        return;
      }
      if (result.redirected) return;
    } finally {
      setBusy(false);
    }
  }

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false },
      });
      if (error) throw error;
      setOtpStage("code");
      toast.success(t("We sent a 6-digit code to your email.", "हमने आपके ईमेल पर 6 अंकों का कोड भेजा है।"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("Could not send code.", "कोड नहीं भेजा जा सका।"));
    } finally {
      setBusy(false);
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token: code.trim(), type: "email" });
      if (error) throw error;
      setOtpStage("password");
      toast.success(t("Code verified. Set a new password.", "कोड सत्यापित। नया पासवर्ड सेट करें।"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("Invalid code.", "अमान्य कोड।"));
    } finally {
      setBusy(false);
    }
  }

  async function saveNewPassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error(t("Password must be at least 6 characters.", "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।"));
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success(t("Password updated.", "पासवर्ड अपडेट हो गया।"));
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("Update failed.", "अपडेट विफल।"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-aurora opacity-60" aria-hidden />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card relative w-full max-w-md p-8"
      >
        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-primary-foreground shadow-glow">
              <HeartPulse className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-bold">
              MedAssist <span className="text-brand">AI</span>
            </span>
          </Link>
          <button
            onClick={() => setLang(lang === "hi" ? "en" : "hi")}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-accent"
          >
            <Languages className="h-3.5 w-3.5" />
            {lang === "hi" ? "English" : "हिंदी"}
          </button>
        </div>

        <h1 className="text-2xl font-bold">
          {mode === "forgot"
            ? t("Reset your password", "अपना पासवर्ड रीसेट करें")
            : mode === "signup"
              ? t("Create your account", "अपना खाता बनाएं")
              : t("Welcome back", "वापस स्वागत है")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "forgot"
            ? t(
                "We'll email you a one-time code to verify it's you.",
                "हम आपकी पहचान सत्यापित करने के लिए एक बार का कोड ईमेल करेंगे।",
              )
            : t(
                "Your AI health companion — chat, triage, reports and reminders.",
                "आपका एआई स्वास्थ्य साथी — चैट, जांच, रिपोर्ट और रिमाइंडर।",
              )}
        </p>

        <AnimatePresence mode="wait">
          {mode !== "forgot" ? (
            <motion.div
              key="auth"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              className="mt-6 space-y-4"
            >
              <button
                onClick={handleGoogle}
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold transition-colors hover:bg-accent disabled:opacity-60"
              >
                <GoogleIcon />
                {t("Continue with Google", "गूगल से जारी रखें")}
              </button>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                {t("or use email", "या ईमेल का उपयोग करें")}
                <span className="h-px flex-1 bg-border" />
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-3">
                <Field icon={Mail}>
                  <input
                    className="input pl-10"
                    type="email"
                    required
                    placeholder={t("Email address", "ईमेल पता")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Field>
                <Field icon={Lock}>
                  <input
                    className="input pl-10"
                    type="password"
                    required
                    placeholder={t("Password", "पासवर्ड")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Field>
                <button
                  disabled={busy}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
                >
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                  {mode === "signup" ? t("Create account", "खाता बनाएं") : t("Sign in", "साइन इन")}
                </button>
              </form>

              <div className="flex items-center justify-between text-xs">
                <button
                  onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
                  className="font-semibold text-primary hover:underline"
                >
                  {mode === "signup"
                    ? t("Already have an account? Sign in", "पहले से खाता है? साइन इन करें")
                    : t("New here? Create an account", "नए हैं? खाता बनाएं")}
                </button>
                <button
                  onClick={() => {
                    setMode("forgot");
                    setOtpStage("email");
                  }}
                  className="text-muted-foreground hover:underline"
                >
                  {t("Forgot password?", "पासवर्ड भूल गए?")}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="forgot"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              className="mt-6 space-y-4"
            >
              {otpStage === "email" && (
                <form onSubmit={sendOtp} className="space-y-3">
                  <Field icon={Mail}>
                    <input
                      className="input pl-10"
                      type="email"
                      required
                      placeholder={t("Your account email", "आपके खाते का ईमेल")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Field>
                  <SubmitBtn busy={busy} label={t("Send OTP code", "ओटीपी कोड भेजें")} />
                </form>
              )}

              {otpStage === "code" && (
                <form onSubmit={verifyOtp} className="space-y-3">
                  <Field icon={KeyRound}>
                    <input
                      className="input pl-10 tracking-[0.4em]"
                      inputMode="numeric"
                      maxLength={8}
                      required
                      placeholder={t("6-digit code", "6 अंकों का कोड")}
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                    />
                  </Field>
                  <SubmitBtn busy={busy} label={t("Verify code", "कोड सत्यापित करें")} />
                  <button
                    type="button"
                    onClick={() => setOtpStage("email")}
                    className="w-full text-xs text-muted-foreground hover:underline"
                  >
                    {t("Resend to a different email", "किसी अन्य ईमेल पर भेजें")}
                  </button>
                </form>
              )}

              {otpStage === "password" && (
                <form onSubmit={saveNewPassword} className="space-y-3">
                  <Field icon={Lock}>
                    <input
                      className="input pl-10"
                      type="password"
                      required
                      placeholder={t("New password", "नया पासवर्ड")}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </Field>
                  <SubmitBtn busy={busy} label={t("Save new password", "नया पासवर्ड सहेजें")} />
                </form>
              )}

              <button
                onClick={() => setMode("signin")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> {t("Back to sign in", "साइन इन पर वापस")}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          {t(
            "MedAssist AI gives educational health information only — never a diagnosis.",
            "MedAssist AI केवल शैक्षिक स्वास्थ्य जानकारी देता है — कभी निदान नहीं।",
          )}
        </p>
      </motion.div>
    </div>
  );
}

function Field({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: ReactNodeLike;
}) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      {children}
    </div>
  );
}

type ReactNodeLike = React.ReactNode;

function SubmitBtn({ busy, label }: { busy: boolean; label: string }) {
  return (
    <button
      disabled={busy}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
    >
      {busy && <Loader2 className="h-4 w-4 animate-spin" />}
      {label}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.27-4.74 3.27-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.76c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97.5 12 .5A11 11 0 0 0 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.14 6.16-4.14Z"
      />
    </svg>
  );
}
