import { useState } from "react";
import type { LogEntry } from "../types";
import { roundCarb } from "../lib/carb";
import { localDate } from "../lib/carb";
import { addCustomFood, addLogEntry } from "../lib/store";
import { useToast } from "./Toast";
import { Plus, X } from "./icons";

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const FRACS = [1 / 3, 1 / 2, 1, 3 / 2, 2];
function fmtFrac(n: number): string {
  if (Math.abs(n - 1 / 3) < 0.01) return "⅓";
  if (Math.abs(n - 1 / 2) < 0.01) return "½";
  if (Math.abs(n - 3 / 2) < 0.01) return "1½";
  return String(n);
}

/**
 * Enter a nutrition label (serving size + carbs per serving). The app does the
 * math. Two outcomes:
 *   - "Add to meal": one-off, feeds the running meal total, saves no food.
 *   - "Save to my foods": stores a reusable custom food (and logs the portion).
 */
export function AddFoodModal({ onClose }: { onClose: () => void }) {
  const toast = useToast();

  const [name, setName] = useState("");
  const [servGrams, setServGrams] = useState("");
  const [servCarbs, setServCarbs] = useState("");
  const [mode, setMode] = useState<"frac" | "grams">("frac");
  const [frac, setFrac] = useState(1);
  const [eatGrams, setEatGrams] = useState("");
  const [servLabel, setServLabel] = useState("");

  const sGrams = parseFloat(servGrams);
  const sCarbs = parseFloat(servCarbs);
  const haveGrams = sGrams > 0;
  const haveCarbs = servCarbs !== "" && sCarbs >= 0;
  const factor = haveGrams && haveCarbs ? sCarbs / sGrams : null; // carb per gram
  const per100 = factor != null ? Math.round(factor * 100) : null;

  const eatingGrams =
    mode === "grams" ? (parseFloat(eatGrams) > 0 ? parseFloat(eatGrams) : null) : haveGrams ? sGrams * frac : null;

  // result: from grams if we have a factor, else fall back to (carbs per serving x fraction)
  const result =
    factor != null && eatingGrams != null
      ? roundCarb(factor * eatingGrams)
      : mode === "frac" && haveCarbs
        ? roundCarb(sCarbs * frac)
        : null;

  const portionText =
    mode === "grams"
      ? `${parseFloat(eatGrams) || 0} g`
      : `${fmtFrac(frac)} serving${eatingGrams != null ? ` (${Math.round(eatingGrams)} g)` : ""}`;

  const canUse = result != null;
  const canSave = factor != null && name.trim().length > 0;

  function logEntry(carbs: number, detail: string): LogEntry {
    return {
      id: uid(),
      timestamp: new Date().toISOString(),
      date: localDate(),
      kind: "quick",
      name: name.trim() || "Quick carb entry",
      detail,
      grams: eatingGrams != null ? Math.round(eatingGrams) : undefined,
      carbs,
      basis: "total",
      source: { type: "user-estimate" },
    };
  }

  function handleUse() {
    if (result == null) return;
    addLogEntry(logEntry(result, portionText));
    toast(`Added ${result} g to this meal`);
    onClose();
  }

  function handleSave() {
    if (factor == null || !name.trim()) return;
    addCustomFood({
      id: uid(),
      name: name.trim(),
      carbFactorTotal: Math.round(factor * 1000) / 1000,
      serving: servLabel.trim() ? { label: servLabel.trim(), grams: sGrams } : { label: "1 serving", grams: sGrams },
      createdAt: new Date().toISOString(),
    });
    if (result != null) {
      addLogEntry(logEntry(result, portionText));
      toast(`Saved "${name.trim()}" · added ${result} g`);
    } else {
      toast(`Saved "${name.trim()}" to your foods`);
    }
    onClose();
  }

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label="Add a food"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sechead">
          <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 19 }}>Add a food</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X />
          </button>
        </div>

        <p className="set-explain" style={{ marginTop: 2 }}>
          Type in the nutrition label. CarbTab does the math.
        </p>

        <div className="af-grid" style={{ marginTop: 12 }}>
          <label className="eyebrow" htmlFor="af-sg">
            Serving size
          </label>
          <div className="af-input">
            <input
              id="af-sg"
              type="number"
              inputMode="decimal"
              min={0}
              value={servGrams}
              onFocus={(e) => e.currentTarget.select()}
              onChange={(e) => setServGrams(e.target.value)}
              placeholder="30"
            />
            <span>g</span>
          </div>

          <label className="eyebrow" htmlFor="af-sc">
            Carbs in a serving
          </label>
          <div className="af-input">
            <input
              id="af-sc"
              type="number"
              inputMode="decimal"
              min={0}
              value={servCarbs}
              onFocus={(e) => e.currentTarget.select()}
              onChange={(e) => setServCarbs(e.target.value)}
              placeholder="22"
            />
            <span>g</span>
          </div>
        </div>

        {per100 != null && (
          <p className="af-note">that&apos;s {per100} g of carb per 100 g</p>
        )}

        <div className="set-group" style={{ marginTop: 14 }}>
          <span className="eyebrow">How much are you eating?</span>
          <div className="chips" style={{ marginTop: 8 }}>
            {FRACS.map((f) => (
              <button
                key={f}
                className="chip"
                aria-pressed={mode === "frac" && frac === f}
                onClick={() => {
                  setMode("frac");
                  setFrac(f);
                }}
              >
                {fmtFrac(f)}
              </button>
            ))}
            <span className="af-frac-label">of a serving</span>
          </div>
          <div className="af-input af-exact" style={{ marginTop: 10 }}>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={eatGrams}
              onFocus={(e) => {
                setMode("grams");
                e.currentTarget.select();
              }}
              onChange={(e) => {
                setMode("grams");
                setEatGrams(e.target.value);
              }}
              placeholder="or an exact weight"
              aria-label="Exact weight you are eating"
            />
            <span>g</span>
          </div>
        </div>

        <div className="result" style={{ marginTop: 14 }}>
          <span className="result-k">Carbs</span>
          <span className="result-v">
            {result == null ? "-" : result}
            <small> g</small>
          </span>
        </div>

        <button className="btn-primary" style={{ marginTop: 14 }} disabled={!canUse} onClick={handleUse}>
          <Plus />
          {result != null ? `Add ${result} g to this meal` : "Add to this meal"}
        </button>

        <div className="af-divider">save it for next time?</div>

        <div className="af-grid">
          <label className="eyebrow" htmlFor="af-name">
            Name
          </label>
          <div className="af-input af-text">
            <input
              id="af-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Grandma's granola"
            />
          </div>
          <label className="eyebrow" htmlFor="af-sl">
            Serving name
          </label>
          <div className="af-input af-text">
            <input
              id="af-sl"
              value={servLabel}
              onChange={(e) => setServLabel(e.target.value)}
              placeholder="1 scoop (optional)"
            />
          </div>
        </div>

        <button className="btn-ghost" style={{ marginTop: 12 }} disabled={!canSave} onClick={handleSave}>
          Save to my foods
        </button>
      </div>
    </div>
  );
}
