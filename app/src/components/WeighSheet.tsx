import { useEffect, useState } from "react";
import type { CustomFood, Food, LogEntry, SearchHit } from "../types";
import { carbsFromWeight, localDate, restaurantCarbs, roundCarb, weightFromCarbs } from "../lib/carb";
import { updateSettings, useMeal, useSettings } from "../lib/store";
import { SourceTag } from "./SourceTag";
import { Plus } from "./icons";

type Mode = "weigh" | "solve";
type Unit = "serving" | "grams";

const QTY_STEPS = [0.5, 1, 1.5, 2, 3];
const GRAM_PRESETS = [30, 50, 100];

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function fmtQty(n: number): string {
  const whole = Math.floor(n);
  const half = n - whole === 0.5;
  if (whole === 0) return "½";
  return whole + (half ? "½" : "");
}

export function WeighSheet({
  hit,
  onClose,
  onAdd,
  editEntry,
  onSave,
}: {
  hit: SearchHit | null;
  onClose: () => void;
  onAdd: (entry: LogEntry) => void;
  /** when set, the sheet is editing an existing log entry, not adding one */
  editEntry?: LogEntry | null;
  onSave?: (entry: LogEntry) => void;
}) {
  const settings = useSettings();
  const basis = settings.basis;
  const meal = useMeal();
  const [mode, setMode] = useState<Mode>("weigh");
  const [unit, setUnit] = useState<Unit>("grams");
  const [qty, setQty] = useState(1);
  const [grams, setGrams] = useState("100");
  const [budget, setBudget] = useState("30");

  const food: (Food | CustomFood) | null = hit && hit.kind !== "restaurant" ? hit.food : null;
  const isRestaurant = hit?.kind === "restaurant";
  const serving = food?.serving;

  useEffect(() => {
    if (!hit || hit.kind === "restaurant") return;
    setMode("weigh");
    setQty(1);
    const s = hit.food.serving?.grams;
    if (editEntry?.grams != null) {
      setUnit("grams");
      setGrams(String(editEntry.grams));
    } else {
      // open on whichever entry the person used last; grams by default
      setUnit(s && settings.portionEntry === "serving" ? "serving" : "grams");
      setGrams(String(s ?? 100));
    }
    // deps intentionally limited to `hit`: changing the remembered
    // preference should not re-open the sheet's entry state
  }, [hit]);

  function pickUnit(u: Unit) {
    setUnit(u);
    updateSettings({ portionEntry: u });
  }

  if (!hit) {
    return (
      <>
        <div className="scrim" onClick={onClose} />
        <div className="sheet" aria-hidden="true" />
      </>
    );
  }

  const budgetNum = parseFloat(budget) || 0;
  const effectiveGrams =
    unit === "serving" && serving ? Math.round(qty * serving.grams) : parseFloat(grams) || 0;

  const netFellBackToTotal =
    basis === "net" &&
    (isRestaurant ? hit.item.carbsNet == null : (food as Food | CustomFood)?.carbFactorNet == null);

  let resultCarbs = 0;
  let solvedGrams = 0;
  if (isRestaurant) {
    resultCarbs = restaurantCarbs(hit.item, basis);
  } else if (food) {
    resultCarbs = carbsFromWeight(food, effectiveGrams, basis);
    solvedGrams = weightFromCarbs(food, budgetNum, basis);
  }

  const name = isRestaurant ? hit.item.name : (food as Food | CustomFood).name;

  function portionDetail(): string {
    if (unit === "serving" && serving) {
      if (qty === 1) return `${serving.label} (${effectiveGrams} g)`;
      const base = /^1\s/.test(serving.label) ? serving.label.slice(2) : `× ${serving.label}`;
      return `${fmtQty(qty)} ${base} (${effectiveGrams} g)`;
    }
    return `${effectiveGrams} g`;
  }

  function handleAdd() {
    if (!hit) return;
    const date = editEntry?.date ?? localDate();
    const id = editEntry?.id ?? uid();
    const timestamp = editEntry?.timestamp ?? new Date().toISOString();
    const mealId = editEntry?.mealId;
    const loggedBasis = netFellBackToTotal ? "total" : basis;
    let entry: LogEntry;
    if (hit.kind === "restaurant") {
      entry = {
        id,
        timestamp,
        date,
        mealId,
        kind: "restaurant",
        refId: hit.item.id,
        name: hit.item.name,
        detail: `${hit.item.restaurant} · ${hit.item.serving}`,
        carbs: resultCarbs,
        basis: loggedBasis,
        source: hit.item.source,
      };
    } else {
      const f = hit.food;
      const solving = mode === "solve";
      entry = {
        id,
        timestamp,
        date,
        mealId,
        kind: hit.kind,
        refId: f.id,
        name: f.name,
        detail: solving ? `${solvedGrams} g` : portionDetail(),
        grams: solving ? solvedGrams : effectiveGrams,
        carbs: solving ? roundCarb(budgetNum) : resultCarbs,
        basis: loggedBasis,
        source: hit.kind === "custom" ? { type: "user-estimate" } : (f as Food).source,
      };
    }
    if (editEntry && onSave) onSave(entry);
    else onAdd(entry);
  }

  return (
    <>
      <div className="scrim show" onClick={onClose} />
      <div className="sheet show" role="dialog" aria-modal="true" aria-label={name}>
        <div className="grab" />
        <div className="sheet-name">{name}</div>
        <div className="sheet-meta">
          {isRestaurant ? (
            <>
              <SourceTag source={hit.item.source} confidence={hit.item.confidence} />
              <span>
                {hit.item.restaurant} · {hit.item.serving}
              </span>
            </>
          ) : (
            <>
              <SourceTag
                source={hit.kind === "custom" ? undefined : (food as Food).source}
                confidence={hit.kind === "custom" ? undefined : (food as Food).confidence}
              />
              <span>{(food as Food).category ?? "Custom food"}</span>
            </>
          )}
        </div>

        {isRestaurant && hit.item.confidence === "low" && (
          <p className="set-explain" style={{ color: "var(--caution)" }}>
            Not yet verified against current official nutrition. Check the restaurant's published
            figure before relying on it for dosing.
          </p>
        )}
        {isRestaurant && hit.item.confidence === "medium" && (
          <p className="set-explain">
            {hit.item.restaurant}
            {/s$/i.test(hit.item.restaurant) ? "'" : "'s"} own published nutrition
            {/^\d{2}\/\d{2}\/\d{4}$/.test(hit.item.updatedAt)
              ? `, last updated ${hit.item.updatedAt}`
              : ""}
            . Not re-checked item by item; confirm against the current menu for anything you dose
            from.
          </p>
        )}

        {!isRestaurant && hit.kind === "food" && (food as Food).confidence === "low" && (
          <p className="set-explain" style={{ color: "var(--caution)" }}>
            {(food as Food).source?.note ??
              "Unverified value. Treat it as a rough estimate and check it before you dose."}
          </p>
        )}

        {!isRestaurant && (
          <div className="mode-toggle" role="group" aria-label="Calculator mode">
            <button aria-pressed={mode === "weigh"} onClick={() => setMode("weigh")}>
              Portion to carbs
            </button>
            <button aria-pressed={mode === "solve"} onClick={() => setMode("solve")}>
              Carbs to weight
            </button>
          </div>
        )}

        {!isRestaurant && mode === "weigh" && (
          <>
            {serving && (
              <div className="unit-toggle" role="group" aria-label="Enter portion as">
                <button className="chip" aria-pressed={unit === "grams"} onClick={() => pickUnit("grams")}>
                  By weight
                </button>
                <button className="chip" aria-pressed={unit === "serving"} onClick={() => pickUnit("serving")}>
                  By serving
                </button>
              </div>
            )}

            {serving && unit === "serving" ? (
              <>
                <div className="qty-label">How many</div>
                <div className="chips">
                  {QTY_STEPS.map((n) => (
                    <button key={n} className="chip" aria-pressed={qty === n} onClick={() => setQty(n)}>
                      {fmtQty(n)}
                    </button>
                  ))}
                </div>
                <p className="qty-hint">
                  {serving.label}, {serving.grams} g each &nbsp;·&nbsp; total {effectiveGrams} g
                </p>
              </>
            ) : (
              <>
                <div className="field-wrap">
                  <label htmlFor="ws-grams">Weight</label>
                  <input
                    id="ws-grams"
                    className="field-big"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    value={grams}
                    onFocus={(e) => e.currentTarget.select()}
                    onChange={(e) => setGrams(e.target.value)}
                  />
                  <span className="field-unit">grams</span>
                </div>
                <div className="chips">
                  {GRAM_PRESETS.map((g) => (
                    <button key={g} className="chip" aria-pressed={grams === String(g)} onClick={() => setGrams(String(g))}>
                      {g} g
                    </button>
                  ))}
                  {serving && (
                    <button
                      className="chip"
                      aria-pressed={grams === String(serving.grams)}
                      onClick={() => setGrams(String(serving.grams))}
                    >
                      1 serving · {serving.grams} g
                    </button>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {!isRestaurant && mode === "solve" && (
          <div className="field-wrap">
            <label htmlFor="ws-budget">Carb budget</label>
            <input
              id="ws-budget"
              className="field-big"
              type="number"
              inputMode="decimal"
              min={0}
              value={budget}
              onFocus={(e) => e.currentTarget.select()}
              onChange={(e) => setBudget(e.target.value)}
            />
            <span className="field-unit">g carbs</span>
          </div>
        )}

        <div className={mode === "solve" && !isRestaurant ? "result solve" : "result"}>
          {mode === "solve" && !isRestaurant ? (
            <>
              <span className="result-k">You can eat</span>
              <span className="result-v">
                {solvedGrams}
                <small> g</small>
              </span>
            </>
          ) : (
            <>
              <span className="result-k">Carbs · {netFellBackToTotal ? "total" : basis}</span>
              <span className="result-v">
                {resultCarbs}
                <small> g</small>
              </span>
            </>
          )}
        </div>

        {netFellBackToTotal && mode !== "solve" && (
          <p className="set-explain">No fiber value for this one yet, so this is total carbs.</p>
        )}

        {mode !== "solve" && !editEntry && meal.entries.length > 0 && (
          <p className="meal-running">
            Meal so far {meal.total} g <span aria-hidden="true">→</span>{" "}
            <b>{meal.total + resultCarbs} g</b> with this
          </p>
        )}

        <button className="btn-primary" onClick={handleAdd}>
          {!editEntry && <Plus />}
          {editEntry ? "Save changes" : meal.entries.length > 0 ? "Add to meal" : "Add"}
        </button>
        <button className="btn-ghost" onClick={onClose}>
          {editEntry ? "Cancel" : "Close"}
        </button>
      </div>
    </>
  );
}
