import { useMemo, useState } from "react";
import { clearLogForDate, removeLogEntry, useLog, useSettings } from "../lib/store";
import { friendlyDate, localDate } from "../lib/carb";
import { ChevronLeft, ChevronRight, Trash } from "../components/icons";

function shift(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(y, m - 1, d + days);
  return localDate(dt);
}

export function LogScreen() {
  const log = useLog();
  const settings = useSettings();
  const today = localDate();
  const [date, setDate] = useState(today);

  const entries = useMemo(
    () =>
      log
        .filter((e) => e.date === date)
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    [log, date],
  );
  const total = entries.reduce((t, e) => t + e.carbs, 0);
  const target = settings.dailyTarget ?? null;

  const earliest = log.reduce((min, e) => (e.date < min ? e.date : min), today);
  const canGoBack = date > earliest && date > shift(today, -60);
  const canGoFwd = date < today;

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

      <div className="daygoal">
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
          <span className="eyebrow">Logged items</span>
          {entries.length > 0 && (
            <button
              className="link"
              onClick={() => {
                if (confirm(`Clear all items logged on ${friendlyDate(date).toLowerCase()}?`)) clearLogForDate(date);
              }}
            >
              Clear
            </button>
          )}
        </div>

        {entries.length === 0 ? (
          <div className="empty">
            {date === today ? "No items yet today. Add one from Home." : "Nothing logged that day."}
          </div>
        ) : (
          <div className="list">
            {entries.map((e) => (
              <div className="logitem" key={e.id}>
                <div className="logitem-main">
                  <div className="logitem-name">{e.name}</div>
                  <div className="logitem-meta">{e.detail}</div>
                </div>
                <div className="logitem-val">{e.carbs} g</div>
                <button className="del" aria-label={`Remove ${e.name}`} onClick={() => removeLogEntry(e.id)}>
                  <Trash />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="note">
        Each entry stores the food, the weight, the carb basis and the source, so a value can be
        checked later. Export everything from Settings.
      </p>
    </div>
  );
}
