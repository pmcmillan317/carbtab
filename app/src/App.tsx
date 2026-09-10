import { useEffect } from "react";
import { Route, Switch } from "wouter";
import { useSettings } from "./lib/store";
import { ToastProvider } from "./components/Toast";
import { TopBar } from "./components/TopBar";
import { BottomNav } from "./components/BottomNav";
import { FirstRun } from "./components/Disclaimer";
import { Home } from "./screens/Home";
import { LogScreen } from "./screens/LogScreen";
import { Foods } from "./screens/Foods";
import { SettingsScreen } from "./screens/SettingsScreen";

function useThemeAttr() {
  const { theme } = useSettings();
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
  }, [theme]);
}

export default function App() {
  useThemeAttr();

  return (
    <ToastProvider>
      <div className="app">
        <TopBar />
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/log" component={LogScreen} />
          <Route path="/foods" component={Foods} />
          <Route path="/settings" component={SettingsScreen} />
          <Route>
            <Home />
          </Route>
        </Switch>
      </div>
      <div className="disclaimer-line">Estimates for information only, not medical advice</div>
      <BottomNav />
      <FirstRun />
    </ToastProvider>
  );
}
