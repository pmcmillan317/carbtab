import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import "./index.css";

registerSW({ immediate: true });

// Ask the browser not to evict our local data (iOS Safari clears storage for
// low-engagement sites after ~7 days; installed PWAs and "persisted" storage
// are exempt). Best-effort, silent.
navigator.storage?.persist?.().catch(() => {});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
