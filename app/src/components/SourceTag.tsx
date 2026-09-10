import type { Source } from "../types";

export function SourceTag({ source, confidence }: { source?: Source; confidence?: string }) {
  if (!source) return <span className="src custom">Custom</span>;
  if (source.type === "USDA")
    return confidence === "low" ? (
      <span className="src unverified">Unverified</span>
    ) : (
      <span className="src usda">USDA</span>
    );
  if (source.type === "manufacturer-label")
    return confidence === "low" ? (
      <span className="src unverified">Community</span>
    ) : (
      <span className="src official">Label</span>
    );
  if (source.type === "user-estimate") return <span className="src custom">Custom</span>;
  // official-restaurant
  if (confidence === "low") return <span className="src unverified">Unverified</span>;
  if (confidence === "high") return <span className="src official">Official</span>;
  return <span className="src menu">Menu</span>;
}
