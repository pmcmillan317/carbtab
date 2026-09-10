import { endMeal, removeLogEntry, useMeal } from "../lib/store";
import { X } from "./icons";

/** Running subtotal for the group of items being added together right now.
 *  Shows on Home once the first item of a meal is logged. "Done" stops grouping;
 *  the items stay in the day log either way. `compact` collapses it to one line
 *  (used while a search is active so it doesn't push results down). */
export function MealTray({ compact = false }: { compact?: boolean }) {
  const { entries, total } = useMeal();
  if (entries.length < 1) return null;

  if (compact) {
    return (
      <section className="mealtray mealtray-compact" aria-label="Current meal">
        <span className="eyebrow">This meal</span>
        <strong>
          {total} <span className="u">g</span>
        </strong>
        <button className="link" onClick={endMeal}>
          Done
        </button>
      </section>
    );
  }

  return (
    <section className="mealtray" aria-label="Current meal">
      <div className="mealtray-head">
        <span className="eyebrow">This meal</span>
        <button className="link" onClick={endMeal}>
          Done
        </button>
      </div>
      <ul className="mealtray-list">
        {entries.map((e) => (
          <li key={e.id}>
            <button
              className="mealtray-x"
              aria-label={`Remove ${e.name}`}
              onClick={() => removeLogEntry(e.id)}
            >
              <X />
            </button>
            <span className="mealtray-name">{e.name}</span>
            <span className="mealtray-g">{e.carbs} g</span>
          </li>
        ))}
      </ul>
      <div className="mealtray-total">
        <span>Total{entries.length > 1 ? ` · ${entries.length} items` : ""}</span>
        <strong>
          {total} <span className="u">g</span>
        </strong>
      </div>
    </section>
  );
}
