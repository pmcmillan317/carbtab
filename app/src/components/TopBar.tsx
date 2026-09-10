import { useSettings, updateSettings } from "../lib/store";
import { Logo } from "./Logo";
import { Moon, Sun } from "./icons";

export function TopBar() {
  const settings = useSettings();
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = settings.theme === "dark" || (settings.theme === "system" && systemDark);

  const toggle = () => updateSettings({ theme: isDark ? "light" : "dark" });

  return (
    <header className="topbar">
      <div className="brand">
        <Logo size={30} />
        <b>
          Carb<span style={{ color: "var(--brand)" }}>Tab</span>
        </b>
      </div>
      <button className="icon-btn" onClick={toggle} aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}>
        {isDark ? <Sun /> : <Moon />}
      </button>
    </header>
  );
}
