import { useMemo, useState } from "react";
import type { LogEntry, SearchHit } from "../types";
import {
  clearLogForDate,
  removeLogEntry,
  replaceLogEntry,
  useCustomFoods,
  useLog,
  useSettings,
} from "../lib/store";
import { friendlyDate, friendlyTime, localDate } from "../lib/carb";
import { findFood, findRestaurantItem } from "../lib/search";
import { findBranded, useBranded } from "../lib/branded";
import { SourceTag } from "../components/SourceTag";
import { WeighSheet } from "../components/WeighSheet";
import { QuickEditSheet } from "../components/QuickEditSheet";
import { useToast } from "../components/Toast";
import { ChevronLeft, ChevronRight, Trash } from "../components/icons";

function shift(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(y, m - 1, d + days);
  return localDate(dt);
}

const GROUP_GAP_MS = 20 * 60 * 1000;

/** entries come in newest-first; group runs that share a meal, or (for older
 *  entries without a meal) that were logged within 20 minutes of each other. */
function groupEntries(entries: LogEntry[]): LogEntry[][] {
  const groups: LogEntry[][] = [];
  for (const e of entries) {
    const last = groups[groups.length - 1];
    const prev = last?.[last.length - 1];
    const sameMeal = prev && e.mealId && prev.mealId && e.mealId === prev.mealId;
    const closeInTime =
      prev &&
      !e.mealId &&
      !prev.mealId &&
      Date.parse(prev.timestamp) - Date.parse(e.timestamp) < GROUP_GAP_MS;
    if (last && (sameMeal || closeInTime)) last.push(e);
    else groups.push([e]);
  }
  return groups;
}

export function LogScreen() {
  const log = useLog();
  const settings = useSettings();
  const customFoods = useCustomFoods();
  const branded = useBranded();
  const toast = useToast();
  const today = localDate();
  const [date, setDate] = useState(today);
  const [editHit, setEditHit] = useState<{ hit: SearchHit; entry: LogEntry } | null>(null);
  const [quickEdit, setQuickEdit] = useState<LogEntry | null>(null);

  const entries = useMemo(
    () => log.filter((e) => e.date === date).sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    [log, date],
  );
  const groups = useMemo(() => groupEntries(entries), [entries]);
  const total = entries.reduce((t, e) => t + e.carbs, 0);
  const target = settings.dailyTarget ?? null;

  const earliest = log.reduce((min, e) => (e.date < min ? e.date : min), today);
  const canGoBack = date > earliest && date > shift(today, -60);
  const canGoFwd = date < today;

  function hitFor(e: LogEntry): SearchHit | null {
    if (!e.refId) return null;
    if (e.kind === "restaurant") {
      const item = findRestaurantItem(e.refId);
      return item ? { kind: "restaurant", item } : null;
    }
    if (e.kind === "custom") {
      const f = customFoods.find((c) => c.id === e.refId);
      return f ? { kind: "custom", food: f } : null;
    }
    if (e.kind === "food") {
      const f = e.refId.startsWith("br-") ? findBranded(e.refId) : findFood(e.refId);
      return f ? { kind: "food", food: f } : null;
    }
    return null;
  }
  // reference branded so the hook stays subscribed while a lookup may be pending
  void branded;

  function openEdit(e: LogEntry) {
    const hit = hitFor(e);
    if (hit) setEditHit({ hit, entry: e });
    else setQuickEdit(e);
  }

  return (
    <div className="screen">
      <h1 className="screen-title">Log</h1>

      <div className="day-nav">
        <button disabled={!canGoBack} onClick={() => setDate(shift(date, -1))} aria-label="Previous day">
          <ChevronLeft />
        </button>
        <span style={{ fontWeight: 600 }}>{friendlyDate(date)}</span>
        <button disabled={!canGoFwd} onClick={() => setDate(shift(date, 1))} aria-label="Next day">
          <ChevronRight />
        </button>
      </div>

      <div className={target ? "daygoal" : "daygoal daygoal-slim"}>
        <span className="eyebrow">Carbs {date === today ? "today" : "that day"}</span>
        <div className="big">
          {total} <span className="unit">g{target ? ` of ${target}` : ""}</span>
        </div>
        {target && (
          <div className="bar" style={{ marginTop: 12 }}>
            <i style={{ width: `${Math.min(100, Math.round((total / target) * 100))}%` }} />
          </div>
        )}
      </div>

      <div className="sec" style={{ marginTop: 0 }}>
        <div className="sechead">
          <span className="eyebrow">
            {entries.length === 0
              ? "Logged items"
              : `${entries.length} item${entries.length === 1 ? "" : "s"}`}
          </span>
          {entries.length > 0 && (
            <button
              className="link"
              onClick={() => {
                if (confirm(`Clear all items logged on ${friendlyDate(date).toLowerCase()}?`))
                  clearLogForDate(date);
              }}
            >
              Clear day
            </button>
          )}
        </div>

        {entries.length === 0 ? (
          <div className="empty">
            {date === today ? "Nothing logged yet today. Add something from Home." : "Nothing logged that day."}
          </div>
        ) : (
          <div className="loggroups">
            {groups.map((g, gi) => {
              const gTotal = g.reduce((t, e) => t + e.carbs, 0);
              const time = friendlyTime(g[g.length - 1].timestamp);
              const isMeal = g.length > 1;
              return (
                <div className={isMeal ? "loggroup meal" : "loggroup"} key={gi}>
                  {isMeal && (
                    <div className="loggroup-head">
                      <span>{time}</span>
                      <span className="loggroup-sub">
                        {g.length} items · <b>{gTotal} g</b>
                      </span>
                    </div>
                  )}
                  {g.map((e) => (
                    <div className="logrow" key={e.id}>
                      <button className="logrow-tap" onClick={() => openEdit(e)}>
                        {!isMeal && <span className="logrow-time">{time}</span>}
                        <span className="logrow-body">
                          <span className="logrow-name">{e.name}</span>
                          <span className="logrow-meta">
                            <SourceTag source={e.source} />
                            <span>{e.detail}</span>
                          </span>
                        </span>
                        <span className="logrow-val">{e.carbs} g</span>
                      </button>
                      <button
                        className="logrow-del"
                        aria-label={`Remove ${e.name}`}
                        onClick={() => removeLogEntry(e.id)}
                      >
                        <Trash />
                      </button>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="note">
        Tap an item to change the amount. Every entry keeps its food, weight, carb basis and source
        so the number can be checked later. Export from Settings.
      </p>

      {editHit && (
        <WeighSheet
          hit={editHit.hit}
          editEntry={editHit.entry}
          onSave={(en) => {
            replaceLogEntry(en);
            setEditHit(null);
            toast("Updated");
          }}
          onAdd={() => {}}
          onClose={() => setEditHit(null)}
        />
      )}
      {quickEdit && (
        <QuickEditSheet
          entry={quickEdit}
          onSave={(en) => {
            replaceLogEntry(en);
            setQuickEdit(null);
            toast("Updated");
          }}
          onRemove={(id) => {
            removeLogEntry(id);
            setQuickEdit(null);
          }}
          onClose={() => setQuickEdit(null)}
        />
      )}
    </div>
  );
}
