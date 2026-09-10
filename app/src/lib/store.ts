import { useSyncExternalStore } from "react";
import type { CustomFood, LogEntry, Settings } from "../types";
import { KEYS, readJSON, writeJSON, removeKey } from "./storage";

// ---- module state (single source of truth, mirrored to localStorage) ----

const DEFAULT_SETTINGS: Settings = {
  basis: "total",
  theme: "system",
  portionEntry: "grams",
};

/** The group of items being added together right now, so the weigh sheet / Home
 *  can show a running subtotal for one meal. Just references into `log`. Auto
 *  resets when the gap between adds is longer than this. */
const MEAL_GAP_MS = 3 * 60 * 60 * 1000;
interface Meal {
  id: string;
  ids: string[];
  touchedAt: string;
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

interface State {
  settings: Settings;
  log: LogEntry[];
  customFoods: CustomFood[];
  meal: Meal;
}

const emptyMeal = (): Meal => ({ id: uid(), ids: [], touchedAt: new Date(0).toISOString() });

let state: State = {
  settings: { ...DEFAULT_SETTINGS, ...readJSON<Partial<Settings>>(KEYS.settings, {}) },
  log: readJSON<LogEntry[]>(KEYS.log, []),
  customFoods: readJSON<CustomFood[]>(KEYS.customFoods, []),
  meal: readJSON<Meal>(KEYS.meal, emptyMeal()),
};
pruneMeal();

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
      meal: { ...emptyMeal(), ...readJSON<Partial<Meal>>(KEYS.meal, {}) },
    };
    pruneMeal();
    emit();
  });
}

// drop meal ids whose log entry is gone, and expire a stale meal
function pruneMeal() {
  const have = new Set(state.log.map((e) => e.id));
  const ids = state.meal.ids.filter((id) => have.has(id));
  const stale = Date.now() - Date.parse(state.meal.touchedAt) > MEAL_GAP_MS;
  const meal = stale || ids.length === 0 ? emptyMeal() : { ...state.meal, ids };
  if (meal !== state.meal) state.meal = meal;
}

function writeMeal() {
  if (state.meal.ids.length) writeJSON(KEYS.meal, state.meal);
  else removeKey(KEYS.meal);
}

// ---- mutations ----

export function updateSettings(patch: Partial<Settings>) {
  state = { ...state, settings: { ...state.settings, ...patch } };
  writeJSON(KEYS.settings, state.settings);
  emit();
}

export function addLogEntry(entry: LogEntry) {
  const now = Date.now();
  const cont = state.meal.ids.length > 0 && now - Date.parse(state.meal.touchedAt) <= MEAL_GAP_MS;
  const mealId = cont ? state.meal.id : uid();
  const stamped: LogEntry = { ...entry, mealId };
  const meal: Meal = {
    id: mealId,
    ids: [...(cont ? state.meal.ids : []), stamped.id],
    touchedAt: new Date(now).toISOString(),
  };
  state = { ...state, log: [stamped, ...state.log], meal };
  writeJSON(KEYS.log, state.log);
  writeMeal();
  // remember for quick-add
  const recent = readJSON<string[]>(KEYS.recent, []);
  const next = [entry.name, ...recent.filter((n) => n !== entry.name)].slice(0, 8);
  writeJSON(KEYS.recent, next);
  emit();
}

/** Swap an existing entry in place (used by the Log's edit flow). Does not touch
 *  the current meal or the recents list. */
export function replaceLogEntry(entry: LogEntry) {
  state = { ...state, log: state.log.map((e) => (e.id === entry.id ? entry : e)) };
  writeJSON(KEYS.log, state.log);
  emit();
}

export function removeLogEntry(id: string) {
  state = {
    ...state,
    log: state.log.filter((e) => e.id !== id),
    meal: { ...state.meal, ids: state.meal.ids.filter((m) => m !== id) },
  };
  writeJSON(KEYS.log, state.log);
  writeMeal();
  emit();
}

export function clearLogForDate(date: string) {
  state = { ...state, log: state.log.filter((e) => e.date !== date) };
  pruneMeal();
  writeJSON(KEYS.log, state.log);
  writeMeal();
  emit();
}

/** "Done" on the meal tray: keeps the logged items, just stops grouping them. */
export function endMeal() {
  state = { ...state, meal: emptyMeal() };
  removeKey(KEYS.meal);
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
    meal: emptyMeal(),
  };
  removeKey(KEYS.meal);
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

/** The items added together in the current meal, in the order added, with the total. */
export function useMeal(): { entries: LogEntry[]; total: number } {
  const meal = useSyncExternalStore(subscribe, () => state.meal);
  const log = useSyncExternalStore(subscribe, () => state.log);
  const byId = new Map(log.map((e) => [e.id, e]));
  const entries = meal.ids
    .map((id) => byId.get(id))
    .filter((e): e is LogEntry => !!e);
  const total = entries.reduce((t, e) => t + e.carbs, 0);
  return { entries, total };
}
