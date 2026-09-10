import { useState } from "react";
import type { LogEntry } from "../types";
import { roundCarb } from "../lib/carb";

/** Minimal editor for a log entry that can't be re-weighed (a "quick" carb
 *  entry, or one whose food is no longer in the database). Name + carb number. */
export function QuickEditSheet({
  entry,
  onSave,
  onRemove,
  onClose,
}: {
  entry: LogEntry;
  onSave: (e: LogEntry) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(entry.name);
  const [carbs, setCarbs] = useState(String(entry.carbs));
  const n = parseFloat(carbs);
  const valid = name.trim().length > 0 && carbs !== "" && n >= 0;

  return (
    <>
      <div className="scrim show" onClick={onClose} />
      <div className="sheet show" role="dialog" aria-modal="true" aria-label={`Edit ${entry.name}`}>
        <div className="grab" />
        <div className="sheet-name">Edit entry</div>

        <div className="af-grid" style={{ marginTop: 14 }}>
          <label className="eyebrow" htmlFor="qe-name">
            Name
          </label>
          <div className="af-input af-text">
            <input id="qe-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <label className="eyebrow" htmlFor="qe-carbs">
            Carbs
          </label>
          <div className="af-input">
            <input
              id="qe-carbs"
              type="number"
              inputMode="decimal"
              min={0}
              value={carbs}
              onFocus={(e) => e.currentTarget.select()}
              onChange={(e) => setCarbs(e.target.value)}
            />
            <span>g</span>
          </div>
        </div>

        <button
          className="btn-primary"
          style={{ marginTop: 16 }}
          disabled={!valid}
          onClick={() => onSave({ ...entry, name: name.trim(), carbs: roundCarb(n) })}
        >
          Save changes
        </button>
        <button
          className="btn-ghost"
          style={{ color: "var(--caution)" }}
          onClick={() => onRemove(entry.id)}
        >
          Remove from the day
        </button>
      </div>
    </>
  );
}
