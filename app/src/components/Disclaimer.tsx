import { APP_NAME } from "../lib/brand";
import { updateSettings, useSettings } from "../lib/store";
import { Warning } from "./icons";

export function DisclaimerText() {
  return (
    <>
      <p>
        {APP_NAME} helps you estimate and log grams of carbohydrate. It is an information and
        tracking tool, not a medical device, and it does not tell you how much insulin to take.
      </p>
      <p>
        Carbohydrate values are estimates. Whole-food values come from USDA data; restaurant values
        come from published nutrition information. Actual amounts vary by preparation, portion and
        brand.
      </p>
      <p>Always follow the carb-counting and dosing plan from your own diabetes care team.</p>
    </>
  );
}

export function FirstRun() {
  const settings = useSettings();
  if (settings.disclaimerAcceptedAt) return null;

  return (
    <div className="modal-scrim">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="fr-title">
        <div className="modal-icon">
          <Warning />
        </div>
        <h2 id="fr-title">Before you start</h2>
        <DisclaimerText />
        <button
          className="btn-primary"
          onClick={() => updateSettings({ disclaimerAcceptedAt: new Date().toISOString() })}
        >
          I understand
        </button>
      </div>
    </div>
  );
}
