// CarbTab logo. A folder tab: the shape of the word, holding two logged lines
// (the running tab). Self-coloured so it reads the same in light and dark.

const TILE = "#5C9A1E"; // deep brand green, white pops on it
const CARD = "#FFFFFF";
const LINE = "#7CB92C"; // brand-bright, the logged entries

export function Logo({ size = 32, rounded = true }: { size?: number; rounded?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="CarbTab"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="32" height="32" rx={rounded ? 8 : 0} fill={TILE} />
      {/* folder body + tab, two overlapping rounded rects that read as one shape */}
      <rect x="6.5" y="12" width="19" height="14" rx="2.5" fill={CARD} />
      <rect x="6.5" y="7.5" width="9.5" height="7.5" rx="2.1" fill={CARD} />
      {/* the running tab: two entry lines */}
      <rect x="10" y="16.2" width="12" height="2.7" rx="1.35" fill={LINE} />
      <rect x="10" y="20.7" width="7.4" height="2.7" rx="1.35" fill={LINE} />
    </svg>
  );
}
