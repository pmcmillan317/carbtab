import { useEffect, useRef, useState } from "react";
import { APP_NAME } from "../lib/brand";
import { exportData, importData, updateSettings, useSettings } from "../lib/store";
import { STORAGE_OK, readJSON, writeJSON } from "../lib/storage";
import { DisclaimerText } from "../components/Disclaimer";
import { useToast } from "../components/Toast";
import { Download, Info, Upload } from "../components/icons";

const TARGETS = [120, 150, 175, 200, 250];

function daysAgo(iso: string): string {
  const d = Math.floor((Date.now() - Date.parse(iso)) / 864e5);
  if (d <= 0) return "today";
  if (d === 1) return "yesterday";
  return `${d} days ago`;
}

export function SettingsScreen() {
  const settings = useSettings();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(() =>
    readJSON<string | null>("lastBackup", null)
  );
  const [persisted, setPersisted] = useState<boolean | null>(null);

  useEffect(() => {
    navigator.storage?.persisted?.().then(setPersisted).catch(() => setPersisted(null));
  }, []);

  async function doExport() {
    const json = JSON.stringify(exportData(), null, 2);
    const fname = `carbtab-backup-${new Date().toISOString().slice(0, 10)}.json`;
    const file = new File([json], fname, { type: "application/json" });
    // Web Share is the reliable path on iOS (Save to Files / AirDrop / Mail).
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "CarbTab backup" });
        markBackedUp();
        return;
      }
    } catch {
      /* user cancelled the share sheet, or it failed — fall through to download */
    }
    try {
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = fname;
      a.click();
      URL.revokeObjectURL(url);
      markBackedUp();
    } catch {
      toast("Could not create the backup file on this device");
    }
  }

  function markBackedUp() {
    const now = new Date().toISOString();
    writeJSON("lastBackup", now);
    setLastBackup(now);
    toast("Backup created");
  }

  function doImport(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        importData(data);
        const now = new Date().toISOString();
        writeJSON("lastBackup", now);
        setLastBackup(now);
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
          it off; the Log still totals each day either way.
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
            ? "Your log, foods and settings live on this device only — there is no server copy."
            : "This browser is blocking local storage, so nothing is being saved between visits. Export after each session."}
          {STORAGE_OK && lastBackup ? (
            <>
              {" "}Last backup {daysAgo(lastBackup)}.
              {Date.now() - Date.parse(lastBackup) > 21 * 864e5 && (
                <b style={{ color: "var(--caution)" }}> Time for a fresh one.</b>
              )}
            </>
          ) : STORAGE_OK ? (
            <b style={{ color: "var(--caution)" }}> No backup yet — make one now.</b>
          ) : null}
          {STORAGE_OK && persisted === false && (
            <>
              {" "}To keep the browser from clearing this data, add CarbTab to your Home Screen and
              open it from there.
            </>
          )}
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
