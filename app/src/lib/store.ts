import { useSyncExternalStore } from "react";
import type { CustomFood, LogEntry, Settings } from "../types";
import { KEYS, readJSON, writeJSON } from "./storage";

// ---- module state (single source of truth, mirrored to localStorage) ----

const DEFAULT_SETTINGS: Settings = {
  basis: "total",
  theme: "system",
  portionEntry: "grams",
};

interface State {
  settings: Settings;
  log: LogEntry[];
  customFoods: CustomFood[];
}

let state: State = {
  settings: { ...DEFAULT_SETTINGS, ...readJSON<Partial<Settings>>(KEYS.settings, {}) },
  log: readJSON<LogEntry[]>(KEYS.log, []),
  customFoods: readJSON<CustomFood[]>(KEYS.customFoods, []),
};

const listeners = new Set<() => void>();
function emit() {
  for (const l of listeners) l();
}
function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// keep in sync across tabs
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (!e.key || !e.key.startsWith("carbtab:")) return;
    state = {
      settings: { ...DEFAULT_SETTINGS, ...readJSON<Partial<Settings>>(KEYS.settings, {}) },
      log: readJSON<LogEntry[]>(KEYS.log, []),
      customFoods: readJSON<CustomFood[]>(KEYS.customFoods, []),
    };
    emit();
  });
}

// ---- mutations ----

export function updateSettings(patch: Partial<Settings>) {
  state = { ...state, settings: { ...state.settings, ...patch } };
  writeJSON(KEYS.settings, state.settings);
  emit();
}

export function addLogEntry(entry: LogEntry) {
  state = { ...state, log: [entry, ...state.log] };
  writeJSON(KEYS.log, state.log);
  // remember for quick-add
  const recent = readJSON<string[]>(KEYS.recent, []);
  const next = [entry.name, ...recent.filter((n) => n !== entry.name)].slice(0, 8);
  writeJSON(KEYS.recent, next);
  emit();
}

export function removeLogEntry(id: string) {
  state = { ...state, log: state.log.filter((e) => e.id !== id) };
  writeJSON(KEYS.log, state.log);
  emit();
}

export function clearLogForDate(date: string) {
  state = { ...state, log: state.log.filter((e) => e.date !== date) };
  writeJSON(KEYS.log, state.log);
  emit();
}

export function addCustomFood(food: CustomFood) {
  state = { ...state, customFoods: [food, ...state.customFoods] };
  writeJSON(KEYS.customFoods, state.customFoods);
  emit();
}

export function removeCustomFood(id: string) {
  state = { ...state, customFoods: state.customFoods.filter((f) => f.id !== id) };
  writeJSON(KEYS.customFoods, state.customFoods);
  emit();
}

export function getRecentNames(): string[] {
  return readJSON<string[]>(KEYS.recent, []);
}

export function importData(data: { settings?: Settings; log?: LogEntry[]; customFoods?: CustomFood[] }) {
  state = {
    settings: { ...DEFAULT_SETTINGS, ...(data.settings || {}) },
    log: Array.isArray(data.log) ? data.log : state.log,
    customFoods: Array.isArray(data.customFoods) ? data.customFoods : state.customFoods,
  };
  writeJSON(KEYS.settings, state.settings);
  writeJSON(KEYS.log, state.log);
  writeJSON(KEYS.customFoods, state.customFoods);
  emit();
}

export function exportData() {
  return {
    app: "CarbTab",
    version: 1,
    exportedAt: new Date().toISOString(),
    settings: state.settings,
    log: state.log,
    customFoods: state.customFoods,
  };
}

// ---- hooks ----

export function useSettings(): Settings {
  return useSyncExternalStore(subscribe, () => state.settings);
}
export function useLog(): LogEntry[] {
  return useSyncExternalStore(subscribe, () => state.log);
}
export function useCustomFoods(): CustomFood[] {
  return useSyncExternalStore(subscribe, () => state.customFoods);
}
