import { localDate } from "../lib/carb";
import { useLog, useSettings } from "../lib/store";

export function todayTotal(log: { date: string; carbs: number }[], date = localDate()) {
  return log.filter((e) => e.date === date).reduce((t, e) => t + e.carbs, 0);
}

export function TodayBand() {
  const log = useLog();
  const settings = useSettings();
  const total = todayTotal(log);
  const target = settings.dailyTarget ?? null;
  const count = log.filter((e) => e.date === localDate()).length;
  const dateLabel = new Date().toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <section className="today" aria-label="Carbs logged today">
      <div className="today-row">
        <span className="eyebrow">Today</span>
        <span className="eyebrow">{dateLabel}</span>
      </div>
      <div className="today-total">
        {total} <span className="u">g carbs{target ? ` of ${target}` : ""}</span>
      </div>
      <div className="today-sub">
        {count === 0
          ? "Nothing logged yet."
          : `${count} item${count === 1 ? "" : "s"} logged.`}
      </div>
      {target && (
        <div className="bar">
          <i style={{ width: `${Math.min(100, Math.round((total / target) * 100))}%` }} />
        </div>
      )}
    </section>
  );
}
