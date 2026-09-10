// Local-first persistence. Every accessor is guarded: a thrown localStorage
// (private mode, disabled storage, some webviews) degrades to defaults / no-op.

const NS = "carbtab:";

let mem: Record<string, string> = {};
let ls: Storage | null = null;
try {
  ls = window.localStorage;
  // probe
  const k = NS + "__probe";
  ls.setItem(k, "1");
  ls.removeItem(k);
} catch {
  ls = null;
}

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = ls ? ls.getItem(NS + key) : mem[NS + key];
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): void {
  try {
    const raw = JSON.stringify(value);
    if (ls) ls.setItem(NS + key, raw);
    else mem[NS + key] = raw;
  } catch {
    /* out of space or blocked: keep going */
  }
}

export function removeKey(key: string): void {
  try {
    if (ls) ls.removeItem(NS + key);
    else delete mem[NS + key];
  } catch {
    /* no-op */
  }
}

export const STORAGE_OK = ls != null;

export const KEYS = {
  settings: "settings",
  log: "log",
  customFoods: "customFoods",
  recent: "recent",
} as const;
