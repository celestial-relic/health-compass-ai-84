import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowRight,
  Stethoscope,
  MessageSquareHeart,
  FileText,
  Pill,
  Siren,
  Calculator,
  ShieldCheck,
  Sparkles,
  Quote,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MedAssist AI — AI Health Chat, Symptom Checker & Report Analyzer" },
      {
        name: "description",
        content:
          "MedAssist AI explains your symptoms and lab reports in simple language, tracks medicines and finds emergency help nearby. Educational health guidance in English and Hindi.",
      },
      { property: "og:title", content: "MedAssist AI — Your AI Health Companion" },
      {
        property: "og:description",
        content:
          "Symptom triage, lab report explanations, medicine reminders and emergency assistance powered by AI.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: MessageSquareHeart,
    title: "AI Health Chat",
    titleHi: "एआई हेल्थ चैट",
    body: "Ask anything in English or Hindi. Pick Gemini or ChatGPT as your engine and get calm, safe guidance.",
    bodyHi: "अंग्रेज़ी या हिंदी में कुछ भी पूछें। Gemini या ChatGPT चुनें और शांत, सुरक्षित मार्गदर्शन पाएं।",
  },
  {
    icon: Stethoscope,
    title: "Symptom Checker",
    titleHi: "लक्षण जाँचकर्ता",
    body: "Select symptoms and get a Low / Medium / High urgency read with home-care and red-flag signs.",
    bodyHi: "लक्षण चुनें और कम / मध्यम / उच्च गंभीरता का आकलन, घरेलू देखभाल और चेतावनी संकेत पाएं।",
  },
  {
    icon: FileText,
    title: "Lab Report Analyzer",
    titleHi: "लैब रिपोर्ट विश्लेषक",
    body: "Upload a PDF or photo of your report — abnormal values are highlighted and explained simply.",
    bodyHi: "अपनी रिपोर्ट की PDF या फोटो अपलोड करें — असामान्य मान चिह्नित और सरल भाषा में समझाए जाते हैं।",
  },
  {
    icon: Pill,
    title: "Medicine Reminders",
    titleHi: "दवा रिमाइंडर",
    body: "Schedule doses, get browser notifications and log every medicine as taken or missed.",
    bodyHi: "खुराक शेड्यूल करें, ब्राउज़र सूचनाएँ पाएं और हर दवा को लिया या छूटा दर्ज करें।",
  },
  {
    icon: Siren,
    title: "Emergency & Hospitals",
    titleHi: "आपातकाल और अस्पताल",
    body: "SOS button, live location, ambulance numbers and nearby hospitals matched to your emergency.",
    bodyHi: "एसओएस बटन, लाइव लोकेशन, एम्बुलेंस नंबर और आपकी आपात स्थिति के अनुसार पास के अस्पताल।",
  },
  {
    icon: Calculator,
    title: "Health Tools",
    titleHi: "हेल्थ टूल्स",
    body: "BMI, calories, water and sleep tracking with visual progress and personalised tips.",
    bodyHi: "बीएमआई, कैलोरी, पानी और नींद की ट्रैकिंग, प्रगति चार्ट और व्यक्तिगत सुझावों के साथ।",
  },
];

const TESTIMONIALS = [
  {
    name: "Ananya R.",
    nameHi: "अनन्या आर.",
    role: "Teacher, Pune",
    roleHi: "शिक्षिका, पुणे",
    quote:
      "It explained my thyroid report line by line. I finally walked into my doctor's clinic knowing what to ask.",
    quoteHi:
      "इसने मेरी थायरॉइड रिपोर्ट एक-एक लाइन समझाई। पहली बार मैं डॉक्टर के पास यह जानकर गई कि क्या पूछना है।",
  },
  {
    name: "Imran S.",
    nameHi: "इमरान एस.",
    role: "Driver, Hyderabad",
    roleHi: "ड्राइवर, हैदराबाद",
    quote:
      "Hindi mein jawab milta hai. Reminder ke wajah se maine ek bhi dose miss nahi ki is mahine.",
    quoteHi:
      "हिंदी में जवाब मिलता है। रिमाइंडर की वजह से इस महीने मैंने एक भी खुराक नहीं छोड़ी।",
  },
  {
    name: "Dr. Meera K.",
    nameHi: "डॉ. मीरा के.",
    role: "Family physician",
    roleHi: "पारिवारिक चिकित्सक",
    quote:
      "It never diagnoses or prescribes — it prepares patients. That's exactly the kind of tool I want them using.",
    quoteHi:
      "यह कभी निदान या दवा नहीं बताता — यह मरीज़ों को तैयार करता है। मैं यही चाहती हूँ कि वे इसका उपयोग करें।",
  },
];

function Landing() {
  const { t } = useI18n();

  return (
    <AppShell>
      <section className="relative overflow-hidden bg-hero">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-semibold text-muted-foreground"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />{" "}
              {t("Gemini & ChatGPT powered", "Gemini और ChatGPT द्वारा संचालित")}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mt-5 text-4xl leading-[1.05] font-extrabold sm:text-6xl"
            >
              {t("Understand your health,", "अपनी सेहत को समझें,")}{" "}
              <span className="text-brand">
                {t("before you panic.", "घबराने से पहले।")}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg"
            >
              {t(
                "MedAssist AI turns confusing symptoms and lab reports into plain language, keeps your medicines on schedule, and gets you emergency help fast — in English or Hindi.",
                "MedAssist AI उलझे हुए लक्षणों और लैब रिपोर्ट्स को सरल भाषा में बदलता है, आपकी दवाओं का समय संभालता है और आपात स्थिति में तुरंत मदद दिलाता है — अंग्रेज़ी या हिंदी में।",
              )}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link
                to="/dashboard"
                className="group inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5"
              >
                {t("Get Started", "शुरू करें")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/chat"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold transition-colors hover:bg-accent"
              >
                {t("Try the AI chat", "एआई चैट आज़माएँ")}
              </Link>
            </motion.div>

            <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-success" />
              {t(
                "Educational guidance only — never a diagnosis or prescription.",
                "केवल शैक्षिक मार्गदर्शन — यह निदान या दवा का पर्चा नहीं है।",
              )}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="relative"
          >
            <div className="animate-float glass-card p-6">
              <div className="flex items-center gap-3 border-b border-border/60 pb-4">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-primary-foreground">
                  <MessageSquareHeart className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">MedAssist AI</p>
                  <p className="text-xs text-success">● {t("online", "ऑनलाइन")}</p>
                </div>
              </div>
              <div className="space-y-3 pt-4 text-sm">
                <p className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-sm bg-brand px-4 py-2 text-primary-foreground">
                  2 din se bukhar aur sar dard hai
                </p>
                <p className="w-fit max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-4 py-2">
                  Yeh aam taur par viral fever ho sakta hai. Aaram karein, paani zyada piyein…
                </p>
                <div className="flex items-center gap-2 rounded-xl border border-warning/40 bg-warning/10 px-3 py-2 text-xs">
                  <Siren className="h-4 w-4 text-warning" />
                  Red flags: saans lene mein takleef, seene mein dard
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20">
        <h2 className="text-center text-3xl font-bold">
          {t("Everything your health needs, in one app", "आपकी सेहत की हर ज़रूरत, एक ही ऐप में")}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-muted-foreground">
          {t(
            "Ten connected tools that work together — your chats, reports and reminders all feed one health timeline.",
            "दस आपस में जुड़े टूल्स — आपकी चैट, रिपोर्ट और रिमाइंडर सब मिलकर एक ही हेल्थ टाइमलाइन बनाते हैं।",
          )}
        </p>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -6 }}
              className="glass-card p-6"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-primary">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{t(f.title, f.titleHi)}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t(f.body, f.bodyHi)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="border-y border-border/60 bg-muted/40 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-center text-3xl font-bold">
            {t("Trusted by everyday patients", "रोज़मर्रा के मरीज़ों का भरोसा")}
          </h2>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((item, i) => (
              <motion.figure
                key={item.name}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card p-6"
              >
                <Quote className="h-6 w-6 text-primary/60" />
                <blockquote className="mt-3 text-sm leading-relaxed">{t(item.quote, item.quoteHi)}</blockquote>
                <figcaption className="mt-4 text-sm font-semibold">
                  {t(item.name, item.nameHi)}
                  <span className="block text-xs font-normal text-muted-foreground">
                    {t(item.role, item.roleHi)}
                  </span>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-24 text-center">
        <h2 className="text-3xl font-bold sm:text-4xl">
          {t("Start with one question", "एक सवाल से शुरुआत करें")}
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-sm text-muted-foreground">
          {t(
            "No setup, no forms. Open the dashboard and your health companion is ready.",
            "कोई सेटअप नहीं, कोई फॉर्म नहीं। डैशबोर्ड खोलें और आपका हेल्थ साथी तैयार है।",
          )}
        </p>
        <Link
          to="/dashboard"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5"
        >
          {t("Get Started", "शुरू करें")} <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </AppShell>
  );
}
