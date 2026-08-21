import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { Siren, MapPin, Phone, Loader2, Navigation, HeartPulse } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { STORE_KEYS, emptyProfile, useLocalStore, type HealthProfile } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/emergency")({
  head: () => ({
    meta: [
      { title: "Emergency & Nearby Hospitals | MedAssist AI" },
      {
        name: "description",
        content:
          "SOS help: ambulance and emergency numbers, first-aid steps, live location and nearby hospitals matched to your emergency on Google Maps.",
      },
      { property: "og:title", content: "Emergency & Nearby Hospitals | MedAssist AI" },
      {
        property: "og:description",
        content: "Ambulance numbers, first aid and nearby hospitals based on your live location.",
      },
    ],
  }),
  component: EmergencyPage,
});

const NUMBERS = [
  { label: "All-in-one emergency", labelHi: "एक ही नंबर पर सभी आपातकालीन सेवाएं", number: "112" },
  { label: "Ambulance", labelHi: "एम्बुलेंस", number: "108" },
  { label: "Police", labelHi: "पुलिस", number: "100" },
  { label: "Fire", labelHi: "अग्निशमन", number: "101" },
  { label: "Women helpline", labelHi: "महिला हेल्पलाइन", number: "1091" },
  { label: "Poison control", labelHi: "विष नियंत्रण", number: "1066" },
];

const PROBLEMS = [
  { key: "emergency hospital", label: "General emergency", labelHi: "सामान्य आपातकाल" },
  { key: "cardiac hospital", label: "Heart attack / chest pain", labelHi: "दिल का दौरा / सीने में दर्द" },
  { key: "stroke center hospital", label: "Stroke", labelHi: "स्ट्रोक" },
  { key: "trauma center", label: "Accident / heavy bleeding", labelHi: "दुर्घटना / अत्यधिक रक्तस्राव" },
  { key: "children hospital", label: "Child emergency", labelHi: "बच्चों की आपातकालीन स्थिति" },
  { key: "maternity hospital", label: "Pregnancy", labelHi: "गर्भावस्था" },
  { key: "24 hour pharmacy", label: "Medicines now", labelHi: "अभी दवाइयाँ चाहिए" },
] as const;

const FIRST_AID = [
  {
    title: "Heart attack",
    titleHi: "दिल का दौरा",
    steps: "Sit the person down, loosen tight clothing, call 108 immediately. If prescribed, they may take their own nitrate. Start CPR only if they stop breathing.",
    stepsHi: "व्यक्ति को बैठाएं, तंग कपड़े ढीले करें, तुरंत 108 पर कॉल करें। यदि निर्धारित हो तो वे अपनी नाइट्रेट दवा ले सकते हैं। सांस रुकने पर ही सीपीआर शुरू करें।",
  },
  {
    title: "Stroke (FAST)",
    titleHi: "स्ट्रोक (FAST)",
    steps: "Face drooping, Arm weakness, Speech trouble → Time to call 108. Note the time symptoms started. Give nothing to eat or drink.",
    stepsHi: "चेहरा लटकना, बांह में कमजोरी, बोलने में परेशानी → तुरंत 108 पर कॉल करें। लक्षण शुरू होने का समय नोट करें। कुछ भी खाने-पीने को न दें।",
  },
  {
    title: "Heavy bleeding",
    titleHi: "अत्यधिक रक्तस्राव",
    steps: "Press firmly on the wound with a clean cloth, raise the limb above heart level and keep pressure until help arrives.",
    stepsHi: "घाव पर साफ कपड़े से मजबूती से दबाव डालें, अंग को हृदय के स्तर से ऊपर उठाएं और मदद आने तक दबाव बनाए रखें।",
  },
  {
    title: "Choking",
    titleHi: "दम घुटना",
    steps: "Five firm back blows between the shoulder blades, then five abdominal thrusts. Repeat until the airway clears.",
    stepsHi: "कंधों के बीच पांच मजबूत थपकियां दें, फिर पांच पेट पर धक्के दें। वायुमार्ग साफ होने तक दोहराएं।",
  },
  {
    title: "Severe breathing difficulty",
    titleHi: "सांस लेने में गंभीर कठिनाई",
    steps: "Sit upright and lean slightly forward, open windows, use a prescribed inhaler if available, and call 108.",
    stepsHi: "सीधे बैठें और थोड़ा आगे झुकें, खिड़कियां खोलें, यदि उपलब्ध हो तो निर्धारित इन्हेलर का उपयोग करें और 108 पर कॉल करें।",
  },
  {
    title: "Burns",
    titleHi: "जलना",
    steps: "Cool under running water for 20 minutes. No ice, butter or toothpaste. Cover loosely with cling film.",
    stepsHi: "20 मिनट तक बहते पानी के नीचे ठंडा करें। बर्फ, मक्खन या टूथपेस्ट न लगाएं। क्लिंग फिल्म से ढीला ढकें।",
  },
];

function EmergencyPage() {
  const { t } = useI18n();
  const { value: profile } = useLocalStore<HealthProfile>(STORE_KEYS.profile, emptyProfile);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [problem, setProblem] = useState<string>("emergency hospital");

  function locate() {
    if (!("geolocation" in navigator)) {
      toast.error(t("Location isn't available in this browser.", "इस ब्राउज़र में लोकेशन उपलब्ध नहीं है।"));
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
        toast.success(t("Location found — showing nearby help", "स्थान मिल गया — आस-पास की मदद दिखाई जा रही है"));
      },
      () => {
        setLocating(false);
        toast.error(t("Could not get your location. Allow location access and try again.", "आपका स्थान प्राप्त नहीं हो सका। लोकेशन एक्सेस दें और फिर से कोशिश करें।"));
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  const mapSrc = coords
    ? `https://www.google.com/maps?q=${encodeURIComponent(problem)}&ll=${coords.lat},${coords.lng}&z=14&output=embed`
    : `https://www.google.com/maps?q=${encodeURIComponent(problem + " near me")}&z=12&output=embed`;

  const directionsUrl = coords
    ? `https://www.google.com/maps/search/${encodeURIComponent(problem)}/@${coords.lat},${coords.lng},14z`
    : `https://www.google.com/maps/search/${encodeURIComponent(problem + " near me")}`;

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <PageHeader
          icon={Siren}
          title={t("Emergency Assistance", "आपातकालीन सहायता")}
          subtitle={t(
            "One tap to call for help, find the right hospital nearby and follow first-aid steps while you wait.",
            "मदद के लिए एक टैप, नजदीकी सही अस्पताल खोजें और इंतजार करते समय प्राथमिक उपचार के चरणों का पालन करें।",
          )}
        />

        <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
          <div className="space-y-5">
            <div className="glass-card grid place-items-center p-6 text-center">
              <motion.a
                href="tel:112"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="animate-sos grid h-36 w-36 place-items-center rounded-full bg-destructive text-2xl font-extrabold text-destructive-foreground"
              >
                SOS
                <span className="text-xs font-semibold">{t("Call 112", "112 पर कॉल करें")}</span>
              </motion.a>
              <p className="mt-4 text-xs text-muted-foreground">
                {t(
                  "Tapping SOS dials the national emergency number on your phone.",
                  "SOS टैप करने से आपके फोन पर राष्ट्रीय आपातकालीन नंबर डायल हो जाता है।",
                )}
              </p>
              {profile.emergencyPhone && (
                <a
                  href={`tel:${profile.emergencyPhone}`}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-semibold hover:bg-accent"
                >
                  <Phone className="h-4 w-4 text-primary" />
                  {t("Call", "कॉल करें")} {profile.emergencyName || t("emergency contact", "आपातकालीन संपर्क")}
                </a>
              )}
            </div>

            <div className="glass-card p-6">
              <h2 className="text-sm font-semibold">{t("Emergency numbers (India)", "आपातकालीन नंबर (भारत)")}</h2>
              <ul className="mt-3 space-y-2">
                {NUMBERS.map((n) => (
                  <li key={n.number}>
                    <a
                      href={`tel:${n.number}`}
                      className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2 text-sm transition-colors hover:bg-accent"
                    >
                      <span>{t(n.label, n.labelHi)}</span>
                      <span className="font-bold text-primary">{n.number}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-5">
            <section className="glass-card p-6">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <MapPin className="h-4 w-4 text-primary" /> {t("Nearby help", "आस-पास मदद")}
                </h2>
                <button
                  onClick={locate}
                  className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-primary-foreground shadow-glow"
                >
                  {locating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Navigation className="h-3.5 w-3.5" />}
                  {coords ? t("Update location", "स्थान अपडेट करें") : t("Use my location", "मेरा स्थान उपयोग करें")}
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {PROBLEMS.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setProblem(p.key)}
                    className={cn(
                      "rounded-full border border-border px-3 py-1.5 text-xs font-semibold transition-colors",
                      problem === p.key ? "bg-brand text-primary-foreground" : "hover:bg-accent",
                    )}
                  >
                    {t(p.label, p.labelHi)}
                  </button>
                ))}
              </div>

              <div className="mt-4 overflow-hidden rounded-2xl border border-border">
                <iframe
                  title="Nearby hospitals map"
                  src={mapSrc}
                  className="h-[380px] w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                {t("Open directions in Google Maps →", "गूगल मैप्स में दिशा-निर्देश खोलें →")}
              </a>
              {coords && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {t("Your location:", "आपका स्थान:")} {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)} —{" "}
                  {t("share this with the ambulance operator.", "इसे एम्बुलेंस ऑपरेटर के साथ साझा करें।")}
                </p>
              )}
            </section>

            <section className="glass-card p-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <HeartPulse className="h-4 w-4 text-primary" /> {t("First-aid while help arrives", "मदद आने तक प्राथमिक उपचार")}
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {FIRST_AID.map((f) => (
                  <div key={f.title} className="rounded-2xl border border-border/60 p-4">
                    <p className="text-sm font-semibold">{t(f.title, f.titleHi)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{t(f.steps, f.stepsHi)}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
