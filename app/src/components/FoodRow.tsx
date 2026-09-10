import type { CarbBasis, SearchHit } from "../types";
import { densityLabel, restaurantCarbs, servingCarbs } from "../lib/carb";
import { SourceTag } from "./SourceTag";

export function FoodRow({
  hit,
  basis,
  onPick,
  caption,
}: {
  hit: SearchHit;
  basis: CarbBasis;
  onPick: (hit: SearchHit) => void;
  caption?: string;
}) {
  let name: string;
  let metaLeft: React.ReactNode;
  let metaRight: string;
  let value: React.ReactNode;
  let cap: string;

  if (hit.kind === "restaurant") {
    const item = hit.item;
    name = item.name;
    metaLeft = <SourceTag source={item.source} confidence={item.confidence} />;
    metaRight = `${item.restaurant} · ${item.serving}`;
    value = (
      <>
        {restaurantCarbs(item, basis)}
        <small> g</small>
      </>
    );
    cap = caption ?? "per serving";
  } else if (hit.kind === "custom") {
    const f = hit.food;
    name = f.name;
    metaLeft = <SourceTag />;
    metaRight = densityLabel(f, basis);
    const per = f.serving?.grams
      ? Math.round((basis === "net" && f.carbFactorNet != null ? f.carbFactorNet : f.carbFactorTotal) * f.serving.grams)
      : Math.round((basis === "net" && f.carbFactorNet != null ? f.carbFactorNet : f.carbFactorTotal) * 100);
    value = (
      <>
        {per}
        <small> g</small>
      </>
    );
    cap = caption ?? (f.serving ? f.serving.label : "per 100 g");
  } else {
    const f = hit.food;
    name = f.name;
    metaLeft = <SourceTag source={f.source} confidence={f.confidence} />;
    metaRight = densityLabel(f, basis);
    const sc = servingCarbs(f, basis);
    value = sc ? (
      <>
        {sc.carbs}
        <small> g</small>
      </>
    ) : (
      <>
        {Math.round((basis === "net" && f.carbFactorNet != null ? f.carbFactorNet : f.carbFactorTotal) * 100)}
        <small> g</small>
      </>
    );
    cap = caption ?? (sc ? sc.label : "per 100 g");
  }

  return (
    <button className="frow" onClick={() => onPick(hit)}>
      <span className="frow-main">
        <span className="frow-name">{name}</span>
        <span className="frow-meta">
          {metaLeft}
          <span>{metaRight}</span>
        </span>
      </span>
      <span className="frow-right">
        <span className="frow-val">{value}</span>
        <span className="frow-cap">{cap}</span>
      </span>
    </button>
  );
}
