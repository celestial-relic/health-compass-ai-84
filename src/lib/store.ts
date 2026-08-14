import { useCallback, useEffect, useState } from "react";

/**
 * Tiny hydration-safe persistence layer.
 * Data lives in localStorage so the app is fully usable without a backend account.
 */
export function useLocalStore<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {
      /* ignore corrupt entries */
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full / disabled */
    }
  }, [key, value, hydrated]);

  const reset = useCallback(() => setValue(initial), [initial]);

  return { value, setValue, hydrated, reset } as const;
}

export const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
};

export type Reminder = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string;
  time: string;
  log: Record<string, "taken" | "missed">;
};

export type ReportRecord = {
  id: string;
  fileName: string;
  createdAt: number;
  summary: string;
};

export type HealthProfile = {
  name: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  bloodGroup: string;
  allergies: string;
  conditions: string;
  emergencyName: string;
  emergencyPhone: string;
  language: "en" | "hi";
};

export const emptyProfile: HealthProfile = {
  name: "",
  age: "",
  gender: "",
  height: "",
  weight: "",
  bloodGroup: "",
  allergies: "",
  conditions: "",
  emergencyName: "",
  emergencyPhone: "",
  language: "en",
};

export type ActivityItem = {
  id: string;
  type: "chat" | "report" | "reminder" | "symptom" | "tool";
  title: string;
  detail: string;
  createdAt: number;
};

export const STORE_KEYS = {
  chats: "medassist.chats",
  reminders: "medassist.reminders",
  reports: "medassist.reports",
  profile: "medassist.profile",
  activity: "medassist.activity",
  water: "medassist.water",
  sleep: "medassist.sleep",
} as const;

export function pushActivity(item: Omit<ActivityItem, "id" | "createdAt">) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORE_KEYS.activity);
    const list: ActivityItem[] = raw ? JSON.parse(raw) : [];
    list.unshift({ ...item, id: uid(), createdAt: Date.now() });
    window.localStorage.setItem(STORE_KEYS.activity, JSON.stringify(list.slice(0, 200)));
  } catch {
    /* ignore */
  }
}
