import { useLocation } from "wouter";
import { Book, Database, Gear, Home } from "./icons";

const ITEMS = [
  { path: "/", label: "Home", Icon: Home },
  { path: "/log", label: "Log", Icon: Book },
  { path: "/foods", label: "Foods", Icon: Database },
  { path: "/settings", label: "Settings", Icon: Gear },
];

export function BottomNav() {
  const [loc, navigate] = useLocation();
  return (
    <nav className="nav" aria-label="Main">
      {ITEMS.map(({ path, label, Icon }) => {
        const active = path === "/" ? loc === "/" : loc.startsWith(path);
        return (
          <button
            key={path}
            aria-current={active ? "page" : undefined}
            onClick={() => navigate(path)}
          >
            <Icon />
            {label}
          </button>
        );
      })}
    </nav>
  );
}
