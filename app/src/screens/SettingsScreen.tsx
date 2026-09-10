import { useRef, useState } from "react";
import { APP_NAME } from "../lib/brand";
import { exportData, importData, updateSettings, useSettings } from "../lib/store";
import { STORAGE_OK } from "../lib/storage";
import { DisclaimerText } from "../components/Disclaimer";
import { useToast } from "../components/Toast";
import { Download, Info, Upload } from "../components/icons";

const TARGETS = [120, 150, 175, 200, 250];

export function SettingsScreen() {
  const settings = useSettings();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  function doExport() {
    const blob = new Blob([JSON.stringify(exportData(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `carbtab-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function doImport(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        importData(data);
        toast("Backup restored");
      } catch {
        toast("That file could not be read");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="screen">
      <h1 className="screen-title">Settings</h1>

      <section className="sec" style={{ marginTop: 8 }}>
        <div className="sechead">
          <span className="eyebrow">Count carbs as</span>
        </div>
        <div className="chips">
          <button className="chip" aria-pressed={settings.basis === "total"} onClick={() => updateSettings({ basis: "total" })}>
            Total carbs
          </button>
          <button className="chip" aria-pressed={settings.basis === "net"} onClick={() => updateSettings({ basis: "net" })}>
            Net carbs
          </button>
        </div>
        <p className="set-explain">
          Total carbohydrate is what most care teams teach first. Net carbs (total minus fiber) is
          available for the common whole foods; anything without a fiber value yet falls back to
          total, and the weigh sheet says which one it used.
        </p>
      </section>

      <section className="sec">
        <div className="sechead">
          <span className="eyebrow">Daily carb target</span>
        </div>
        <div className="chips">
          <button
            className="chip"
            aria-pressed={settings.dailyTarget == null}
            onClick={() => updateSettings({ dailyTarget: undefined })}
          >
            Off
          </button>
          {TARGETS.map((g) => (
            <button
              key={g}
              className="chip"
              aria-pressed={settings.dailyTarget === g}
              onClick={() => updateSettings({ dailyTarget: g })}
            >
              {g} g
            </button>
          ))}
        </div>
        <p className="set-explain">
          Off by default. Turn this on only if your care team gave you a daily carb number to stay
          near, which is common with gestational diabetes. If you count carbs to match insulin, leave
          it off; the day still adds up on Home and in the Log.
        </p>
      </section>

      <section className="sec">
        <div className="sechead">
          <span className="eyebrow">Appearance</span>
        </div>
        <div className="chips">
          {(["system", "light", "dark"] as const).map((t) => (
            <button
              key={t}
              className="chip"
              aria-pressed={settings.theme === t}
              onClick={() => updateSettings({ theme: t })}
            >
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </section>

      <section className="sec">
        <div className="sechead">
          <span className="eyebrow">Your data</span>
        </div>
        <div className="set-group">
          <button className="btn-row" onClick={doExport}>
            <span>Export a backup</span>
            <Download />
          </button>
          <button className="btn-row" onClick={() => fileRef.current?.click()}>
            <span>Restore from a backup</span>
            <Upload />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => e.target.files?.[0] && doImport(e.target.files[0])}
          />
        </div>
        <p className="set-explain">
          {STORAGE_OK
            ? "Your log, foods and settings live on this device only. Export regularly if the data matters to you."
            : "This browser is blocking local storage, so nothing is being saved between visits. Export after each session."}
        </p>
      </section>

      <section className="sec">
        <div className="sechead">
          <span className="eyebrow">About</span>
        </div>
        <button className="btn-row" onClick={() => setShowDisclaimer(true)}>
          <span>Medical disclaimer</span>
          <Info />
        </button>
      </section>

      <p className="note">
        <b>Not medical advice.</b> {APP_NAME} estimates carbohydrate for information and logging. It
        does not calculate insulin doses. Talk to a diabetes clinician before changing how you count
        or dose.
      </p>

      {showDisclaimer && (
        <div className="modal-scrim" onClick={() => setShowDisclaimer(false)}>
          <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h2>Medical disclaimer</h2>
            <DisclaimerText />
            <button className="btn-primary" onClick={() => setShowDisclaimer(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
