import { useState } from "react";
import type { CustomFood } from "../types";
import { Plus, X } from "./icons";

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function AddFoodModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (food: CustomFood) => void;
}) {
  const [name, setName] = useState("");
  const [per100, setPer100] = useState("");
  const [servLabel, setServLabel] = useState("");
  const [servGrams, setServGrams] = useState("");

  const valid = name.trim().length > 0 && parseFloat(per100) >= 0 && per100 !== "";

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label="Add a custom food"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sechead">
          <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 19 }}>Add a food</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X />
          </button>
        </div>
        <div className="set-group" style={{ marginTop: 14 }}>
          <label className="eyebrow" htmlFor="af-name">
            Name
          </label>
          <input
            id="af-name"
            className="search-input"
            style={{ height: 50, boxShadow: "none" }}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Grandma's granola"
          />
          <label className="eyebrow" htmlFor="af-per100" style={{ marginTop: 8 }}>
            Carbs per 100 g
          </label>
          <input
            id="af-per100"
            className="search-input"
            style={{ height: 50, boxShadow: "none" }}
            type="number"
            inputMode="decimal"
            value={per100}
            onChange={(e) => setPer100(e.target.value)}
            placeholder="grams of carb in 100 g of the food"
          />
          <p className="set-explain" style={{ marginTop: 4 }}>
            Read this off the nutrition label: carbohydrate per 100 g. If the label only gives a
            serving, divide by the serving weight and multiply by 100.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 8, marginTop: 8 }}>
            <div>
              <label className="eyebrow" htmlFor="af-serv">
                Serving label (optional)
              </label>
              <input
                id="af-serv"
                className="search-input"
                style={{ height: 46, boxShadow: "none" }}
                value={servLabel}
                onChange={(e) => setServLabel(e.target.value)}
                placeholder="1 scoop"
              />
            </div>
            <div>
              <label className="eyebrow" htmlFor="af-servg">
                Grams
              </label>
              <input
                id="af-servg"
                className="search-input"
                style={{ height: 46, boxShadow: "none" }}
                type="number"
                inputMode="decimal"
                value={servGrams}
                onChange={(e) => setServGrams(e.target.value)}
                placeholder="40"
              />
            </div>
          </div>
        </div>
        <button
          className="btn-primary"
          style={{ marginTop: 16 }}
          disabled={!valid}
          onClick={() =>
            onSave({
              id: uid(),
              name: name.trim(),
              carbFactorTotal: Math.round((parseFloat(per100) / 100) * 1000) / 1000,
              serving:
                servLabel.trim() && parseFloat(servGrams) > 0
                  ? { label: servLabel.trim(), grams: parseFloat(servGrams) }
                  : undefined,
              createdAt: new Date().toISOString(),
            })
          }
        >
          <Plus />
          Save food
        </button>
      </div>
    </div>
  );
}
