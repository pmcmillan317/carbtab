import { useEffect, useRef, useState } from "react";
import { lookupBarcode, type BarcodeResult } from "../lib/barcode";
import { X } from "./icons";

type Phase = "starting" | "scanning" | "looking-up" | "denied" | "error";

/**
 * Barcode scanner. Opens the back camera, reads a UPC/EAN with ZXing (loaded on
 * demand so it isn't in the main bundle), then resolves it via lib/barcode.
 *  - found  -> onResult(food)
 *  - not found or camera unavailable -> onNotFound(code | null)
 */
export function Scanner({
  onResult,
  onNotFound,
  onClose,
}: {
  onResult: (r: BarcodeResult) => void;
  onNotFound: (code: string | null) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<Phase>("starting");
  const [manual, setManual] = useState("");
  const doneRef = useRef(false);

  useEffect(() => {
    let controls: { stop: () => void } | undefined;
    (async () => {
      try {
        const [{ BrowserMultiFormatReader }, { DecodeHintType, BarcodeFormat }] = await Promise.all([
          import("@zxing/browser"),
          import("@zxing/library"),
        ]);
        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [
          BarcodeFormat.EAN_13,
          BarcodeFormat.UPC_A,
          BarcodeFormat.EAN_8,
          BarcodeFormat.UPC_E,
          BarcodeFormat.CODE_128,
        ]);
        const reader = new BrowserMultiFormatReader(hints, { delayBetweenScanAttempts: 200 });
        if (!videoRef.current) return;
        setPhase("scanning");
        controls = await reader.decodeFromConstraints(
          { video: { facingMode: { ideal: "environment" } } },
          videoRef.current,
          (result) => {
            if (result && !doneRef.current) {
              doneRef.current = true;
              controls?.stop();
              void resolve(result.getText());
            }
          },
        );
      } catch (e: unknown) {
        const name = (e as { name?: string })?.name;
        setPhase(name === "NotAllowedError" || name === "SecurityError" ? "denied" : "error");
      }
    })();
    return () => {
      doneRef.current = true;
      try {
        controls?.stop();
      } catch {
        /* nothing to stop */
      }
    };
  }, []);

  async function resolve(code: string) {
    setPhase("looking-up");
    const res = await lookupBarcode(code);
    if (res) onResult(res);
    else onNotFound(code);
  }

  const message: Record<Phase, string> = {
    starting: "Starting the camera…",
    scanning: "Point the camera at the barcode",
    "looking-up": "Looking it up…",
    denied: "",
    error: "",
  };

  return (
    <div className="scanner">
      <div className="scanner-bar">
        <span>Scan a barcode</span>
        <button className="icon-btn" onClick={onClose} aria-label="Close scanner">
          <X />
        </button>
      </div>

      {phase !== "denied" && phase !== "error" ? (
        <div className="scanner-view">
          <video ref={videoRef} playsInline muted className="scanner-video" />
          <div className="scanner-reticle" aria-hidden="true" />
          <p className="scanner-msg">
            {phase === "looking-up" && <span className="spin" />}
            {message[phase]}
          </p>
        </div>
      ) : (
        <div className="scanner-fallback">
          <p>
            {phase === "denied"
              ? "CarbTab needs camera access to scan. Allow it in your browser settings, or type the barcode number below."
              : "Couldn't start the camera on this device. Type the barcode number instead."}
          </p>
        </div>
      )}

      <form
        className="scanner-manual"
        onSubmit={(e) => {
          e.preventDefault();
          const c = manual.replace(/\D/g, "");
          if (c.length >= 6) void resolve(c);
        }}
      >
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9 ]*"
          value={manual}
          onChange={(e) => setManual(e.target.value)}
          placeholder="Enter the barcode number"
          aria-label="Barcode number"
        />
        <button type="submit" className="btn-primary" disabled={manual.replace(/\D/g, "").length < 6}>
          Look up
        </button>
      </form>

      <button className="btn-ghost scanner-cancel" onClick={onClose}>
        Cancel
      </button>
    </div>
  );
}
