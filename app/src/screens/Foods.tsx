import { useMemo, useState } from "react";
import { useSearch } from "wouter";
import type { CustomFood, LogEntry, SearchHit } from "../types";
import { CATEGORIES, foodsByCategory, RESTAURANTS } from "../lib/search";
import { addLogEntry, removeCustomFood, useCustomFoods, useSettings } from "../lib/store";
import { useToast } from "../components/Toast";
import { FoodRow } from "../components/FoodRow";
import { WeighSheet } from "../components/WeighSheet";
import { AddFoodModal } from "../components/AddFoodModal";
import { ChevronRight, Trash } from "../components/icons";

type Tab = "foods" | "restaurants";

export function Foods() {
  const search = useSearch();
  const initialTab: Tab = new URLSearchParams(search).get("tab") === "restaurants" ? "restaurants" : "foods";
  const settings = useSettings();
  const customFoods = useCustomFoods();
  const toast = useToast();

  const [tab, setTab] = useState<Tab>(initialTab);
  const [cat, setCat] = useState<string>("All");
  const [openRestaurant, setOpenRestaurant] = useState<string | null>(null);
  const [picked, setPicked] = useState<SearchHit | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const foods = useMemo(() => foodsByCategory(cat), [cat]);

  function handleAdd(entry: LogEntry) {
    addLogEntry(entry);
    toast(`${entry.name} added · ${entry.carbs} g`);
    setPicked(null);
  }

  return (
    <div className="screen">
      <h1 className="screen-title">Food database</h1>

      <div className="mode-toggle" role="group" aria-label="Database section">
        <button aria-pressed={tab === "foods"} onClick={() => setTab("foods")}>
          Whole foods
        </button>
        <button aria-pressed={tab === "restaurants"} onClick={() => setTab("restaurants")}>
          Restaurants
        </button>
      </div>

      {tab === "foods" && (
        <>
          <div className="sec">
            <div className="sechead">
              <span className="eyebrow">
                {foods.length + customFoods.length} foods
              </span>
              <button className="link" onClick={() => setShowAdd(true)}>
                Add a food
              </button>
            </div>
            <div className="chips scroll">
              {["All", ...CATEGORIES].map((c) => (
                <button key={c} className="chip" aria-pressed={cat === c} onClick={() => setCat(c)}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="list" style={{ marginTop: 14 }}>
            {cat === "All" &&
              customFoods.map((f) => (
                <CustomRow key={f.id} food={f} basis={settings.basis} onPick={setPicked} />
              ))}
            {foods.map((f) => (
              <FoodRow
                key={f.id}
                hit={{ kind: "food", food: f }}
                basis={settings.basis}
                onPick={setPicked}
              />
            ))}
          </div>
        </>
      )}

      {tab === "restaurants" && (
        <div className="list" style={{ marginTop: 16 }}>
          {RESTAURANTS.map((r) => (
            <div key={r.slug}>
              <button
                className="btn-row"
                onClick={() => setOpenRestaurant(openRestaurant === r.slug ? null : r.slug)}
                style={{ minHeight: 56 }}
              >
                <span style={{ fontWeight: 700 }}>{r.name}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--ink-muted)", fontSize: 12 }}>
                  {r.items.length} items
                  <ChevronRight />
                </span>
              </button>
              {openRestaurant === r.slug && (
                <div className="list" style={{ marginTop: 8, marginBottom: 8 }}>
                  {r.note && <div className="set-explain">{r.note}</div>}
                  {r.items.map((item) => (
                    <FoodRow
                      key={item.id}
                      hit={{ kind: "restaurant", item }}
                      basis={settings.basis}
                      onPick={setPicked}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
          <p className="note" style={{ marginTop: 12 }}>
            Common items for {RESTAURANTS.length} chains, from each chain's own published US nutrition
            and tagged <b>Menu</b>. Most are a fresh pull of the chain's official figures on
            Nutritionix; a few local spots are compiled or estimated, as each one's note says. Menus
            change, so confirm any value you dose from.
          </p>
        </div>
      )}

      {showAdd && <AddFoodModal onClose={() => setShowAdd(false)} />}

      <WeighSheet hit={picked} onClose={() => setPicked(null)} onAdd={handleAdd} />
    </div>
  );
}

function CustomRow({
  food,
  basis,
  onPick,
}: {
  food: CustomFood;
  basis: "total" | "net";
  onPick: (h: SearchHit) => void;
}) {
  return (
    <div style={{ position: "relative" }}>
      <FoodRow hit={{ kind: "custom", food }} basis={basis} onPick={onPick} />
      <button
        className="del"
        aria-label={`Delete ${food.name}`}
        onClick={() => {
          if (confirm(`Delete "${food.name}"?`)) removeCustomFood(food.id);
        }}
        style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)" }}
      >
        <Trash />
      </button>
    </div>
  );
}
