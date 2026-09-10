import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import type { LogEntry, SearchHit } from "../types";
import { addCustomFood, addLogEntry, getRecentNames, useCustomFoods, useSettings } from "../lib/store";
import { searchAll, FOODS, RESTAURANTS } from "../lib/search";
import { useToast } from "../components/Toast";
import { FoodRow } from "../components/FoodRow";
import { WeighSheet } from "../components/WeighSheet";
import { AddFoodModal } from "../components/AddFoodModal";
import { MealTray } from "../components/MealTray";
import { Plus, Search, Utensils, X } from "../components/icons";

const STAPLES = ["Banana", "White Rice, cooked", "White Bread Slice", "Oatmeal, cooked"];

export function Home() {
  const [, navigate] = useLocation();
  const settings = useSettings();
  const customFoods = useCustomFoods();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<SearchHit | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const results = useMemo(() => searchAll(q, customFoods), [q, customFoods]);
  const hasResults =
    results.custom.length + results.restaurant.length + results.food.length > 0;

  const quick = useMemo<SearchHit[]>(() => {
    const names = [...getRecentNames(), ...STAPLES];
    const seen = new Set<string>();
    const out: SearchHit[] = [];
    for (const n of names) {
      if (seen.has(n) || out.length >= 5) continue;
      seen.add(n);
      const f = FOODS.find((x) => x.name === n);
      if (f) {
        out.push({ kind: "food", food: f });
        continue;
      }
      for (const r of RESTAURANTS) {
        const item = r.items.find((i) => i.name === n);
        if (item) out.push({ kind: "restaurant", item });
      }
    }
    return out;
  }, [customFoods]);

  function handleAdd(entry: LogEntry) {
    addLogEntry(entry);
    toast(`${entry.name} added · ${entry.carbs} g`);
    setPicked(null);
    setQ("");
  }

  return (
    <div className="screen">
      <MealTray compact={!!q} />

      <div className="quicknav">
        <button onClick={() => navigate("/foods?tab=restaurants")}>
          <Utensils />
          <span>Restaurants</span>
        </button>
        <button onClick={() => setShowAdd(true)}>
          <Plus />
          <span>Add a food</span>
        </button>
      </div>

      <section className="ask">
        {!q && <h1>What are you eating?</h1>}
        <div className="searchwrap">
          <Search className="s" />
          <input
            className="search-input"
            type="search"
            inputMode="search"
            autoComplete="off"
            placeholder="Search a food, or a restaurant"
            aria-label="Search foods and restaurants"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {q && (
            <button className="clear-x" aria-label="Clear search" onClick={() => setQ("")}>
              <X />
            </button>
          )}
        </div>
      </section>

      {hasResults ? (
        <section className="sec">
          <div className="sechead">
            <span className="eyebrow">
              {results.custom.length + results.restaurant.length + results.food.length} matches
            </span>
            <button className="link" onClick={() => setQ("")}>
              Clear
            </button>
          </div>
          <div className="list">
            {results.custom.length > 0 && <div className="group-label">Your foods</div>}
            {results.custom.map((h) => (
              <FoodRow key={(h as any).food.id} hit={h} basis={settings.basis} onPick={setPicked} />
            ))}
            {results.food.length > 0 && <div className="group-label">Whole foods</div>}
            {results.food.map((h) => (
              <FoodRow key={(h as any).food.id} hit={h} basis={settings.basis} onPick={setPicked} />
            ))}
            {results.restaurant.length > 0 && <div className="group-label">Restaurants</div>}
            {results.restaurant.map((h) => (
              <FoodRow key={(h as any).item.id} hit={h} basis={settings.basis} onPick={setPicked} />
            ))}
          </div>
        </section>
      ) : q ? (
        <section className="sec">
          <div className="empty">
            No match for "{q}". Try a simpler word, or add it in Foods as a custom food.
          </div>
        </section>
      ) : (
        <section className="sec">
          <div className="sechead">
            <span className="eyebrow">Quick add</span>
          </div>
          <div className="list">
            {quick.map((h, i) => (
              <FoodRow key={i} hit={h} basis={settings.basis} onPick={setPicked} caption="tap to log" />
            ))}
          </div>
        </section>
      )}

      {!q && (
        <p className="note">
          <b>How it works.</b> Whole foods use a carbohydrate factor from USDA data, multiplied by the
          weight you enter. Restaurant items use the carbs for one published serving. Every value
          shows its source. Counting <b>{settings.basis}</b> carbs (change in Settings).
        </p>
      )}

      {showAdd && (
        <AddFoodModal
          onClose={() => setShowAdd(false)}
          onSave={(food) => {
            addCustomFood(food);
            toast(`Added "${food.name}"`);
            setShowAdd(false);
          }}
        />
      )}

      <WeighSheet hit={picked} onClose={() => setPicked(null)} onAdd={handleAdd} />
    </div>
  );
}
