import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { Siren, MapPin, Phone, Loader2, Navigation, HeartPulse } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { STORE_KEYS, emptyProfile, useLocalStore, type HealthProfile } from "@/lib/store";
import { cn } from "@/lib/utils";

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
  { label: "All-in-one emergency", number: "112" },
  { label: "Ambulance", number: "108" },
  { label: "Police", number: "100" },
  { label: "Fire", number: "101" },
  { label: "Women helpline", number: "1091" },
  { label: "Poison control", number: "1066" },
];

const PROBLEMS = [
  { key: "emergency hospital", label: "General emergency" },
  { key: "cardiac hospital", label: "Heart attack / chest pain" },
  { key: "stroke center hospital", label: "Stroke" },
  { key: "trauma center", label: "Accident / heavy bleeding" },
  { key: "children hospital", label: "Child emergency" },
  { key: "maternity hospital", label: "Pregnancy" },
  { key: "24 hour pharmacy", label: "Medicines now" },
] as const;

const FIRST_AID = [
  {
    title: "Heart attack",
    steps: "Sit the person down, loosen tight clothing, call 108 immediately. If prescribed, they may take their own nitrate. Start CPR only if they stop breathing.",
  },
  {
    title: "Stroke (FAST)",
    steps: "Face drooping, Arm weakness, Speech trouble → Time to call 108. Note the time symptoms started. Give nothing to eat or drink.",
  },
  {
    title: "Heavy bleeding",
    steps: "Press firmly on the wound with a clean cloth, raise the limb above heart level and keep pressure until help arrives.",
  },
  {
    title: "Choking",
    steps: "Five firm back blows between the shoulder blades, then five abdominal thrusts. Repeat until the airway clears.",
  },
  {
    title: "Severe breathing difficulty",
    steps: "Sit upright and lean slightly forward, open windows, use a prescribed inhaler if available, and call 108.",
  },
  {
    title: "Burns",
    steps: "Cool under running water for 20 minutes. No ice, butter or toothpaste. Cover loosely with cling film.",
  },
];

function EmergencyPage() {
  const { value: profile } = useLocalStore<HealthProfile>(STORE_KEYS.profile, emptyProfile);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [problem, setProblem] = useState<string>("emergency hospital");

  function locate() {
    if (!("geolocation" in navigator)) {
      toast.error("Location isn't available in this browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
        toast.success("Location found — showing nearby help");
      },
      () => {
        setLocating(false);
        toast.error("Could not get your location. Allow location access and try again.");
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
          title="Emergency Assistance"
          subtitle="One tap to call for help, find the right hospital nearby and follow first-aid steps while you wait."
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
                <span className="text-xs font-semibold">Call 112</span>
              </motion.a>
              <p className="mt-4 text-xs text-muted-foreground">
                Tapping SOS dials the national emergency number on your phone.
              </p>
              {profile.emergencyPhone && (
                <a
                  href={`tel:${profile.emergencyPhone}`}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-semibold hover:bg-accent"
                >
                  <Phone className="h-4 w-4 text-primary" />
                  Call {profile.emergencyName || "emergency contact"}
                </a>
              )}
            </div>

            <div className="glass-card p-6">
              <h2 className="text-sm font-semibold">Emergency numbers (India)</h2>
              <ul className="mt-3 space-y-2">
                {NUMBERS.map((n) => (
                  <li key={n.number}>
                    <a
                      href={`tel:${n.number}`}
                      className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2 text-sm transition-colors hover:bg-accent"
                    >
                      <span>{n.label}</span>
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
                  <MapPin className="h-4 w-4 text-primary" /> Nearby help
                </h2>
                <button
                  onClick={locate}
                  className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-primary-foreground shadow-glow"
                >
                  {locating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Navigation className="h-3.5 w-3.5" />}
                  {coords ? "Update location" : "Use my location"}
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
                    {p.label}
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
                Open directions in Google Maps →
              </a>
              {coords && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Your location: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)} — share this with
                  the ambulance operator.
                </p>
              )}
            </section>

            <section className="glass-card p-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <HeartPulse className="h-4 w-4 text-primary" /> First-aid while help arrives
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {FIRST_AID.map((f) => (
                  <div key={f.title} className="rounded-2xl border border-border/60 p-4">
                    <p className="text-sm font-semibold">{f.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{f.steps}</p>
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
