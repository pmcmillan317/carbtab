import { useEffect, useRef, useState } from "react";
import { lookupBarcode, type BarcodeResult } from "../lib/barcode";
import { X } from "./icons";

type Phase = "starting" | "scanning" | "looking-up" | "denied" | "error";

type ScanControls = {
  stop: () => void;
  switchTorch?: (on: boolean) => Promise<void>;
};

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
  const [hint, setHint] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [torchAvail, setTorchAvail] = useState(false);
  const [errText, setErrText] = useState("");
  const doneRef = useRef(false);
  const controlsRef = useRef<ScanControls | null>(null);

  useEffect(() => {
    let controls: ScanControls | undefined;
    let hintTimer: ReturnType<typeof setTimeout>;
    let watchdog: ReturnType<typeof setInterval>;

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
        ]);
        // Scan more rows per frame and try rotations - the difference between
        // "won't read unless perfectly level" and actually usable by hand.
        hints.set(DecodeHintType.TRY_HARDER, true);

        const reader = new BrowserMultiFormatReader(hints, {
          delayBetweenScanAttempts: 120,
          delayBetweenScanSuccess: 400,
        });
        if (!videoRef.current) return;
        setPhase("scanning");

        controls = (await reader.decodeFromConstraints(
          {
            video: {
              facingMode: { ideal: "environment" },
              // iOS hands back 640x480 by default, too coarse to decode a UPC
              // at arm's length. Ask for 1080p and let it settle lower.
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
          },
          videoRef.current,
          (result, err) => {
            if (result && !doneRef.current) {
              doneRef.current = true;
              controls?.stop();
              void resolve(result.getText());
              return;
            }
            // NotFound / Checksum / Format on a frame is normal - only surface
            // the unexpected ones.
            if (err && err.name && !/NotFound|Checksum|Format/.test(err.name)) {
              setErrText(err.message || String(err));
            }
          },
        )) as ScanControls;
        controlsRef.current = controls;
        if (typeof controls.switchTorch === "function") setTorchAvail(true);

        // Best effort: nudge continuous autofocus on, ignore if unsupported.
        try {
          const v = videoRef.current;
          const track = (v?.srcObject as MediaStream | null)?.getVideoTracks?.()[0];
          const caps = track?.getCapabilities?.() as { focusMode?: string[] } | undefined;
          if (track && caps?.focusMode?.includes("continuous")) {
            await track.applyConstraints({ advanced: [{ focusMode: "continuous" } as unknown as MediaTrackConstraintSet] });
          }
        } catch {
          /* not supported - carry on */
        }

        // "Nothing is happening" help after a few seconds of no hit.
        hintTimer = setTimeout(() => {
          if (!doneRef.current) setHint(true);
        }, 6000);

        // If the video never produces frames, decoding can't work - say so
        // instead of leaving the user pointing at a dead feed.
        let zeroFrames = 0;
        watchdog = setInterval(() => {
          const v = videoRef.current;
          if (doneRef.current || !v) return;
          if (v.videoWidth > 0) {
            zeroFrames = 0;
            return;
          }
          if (++zeroFrames >= 5) {
            clearInterval(watchdog);
            try {
              controls?.stop();
            } catch {
              /* already stopped */
            }
            setErrText((t) => t || "The camera turned on but sent no video.");
            setPhase("error");
          }
        }, 800);
      } catch (e: unknown) {
        const name = (e as { name?: string })?.name;
        setPhase(name === "NotAllowedError" || name === "SecurityError" ? "denied" : "error");
      }
    })();

    return () => {
      doneRef.current = true;
      clearTimeout(hintTimer);
      clearInterval(watchdog);
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

  async function toggleTorch() {
    const c = controlsRef.current;
    if (!c?.switchTorch) return;
    try {
      await c.switchTorch(!torchOn);
      setTorchOn((v) => !v);
    } catch {
      /* torch refused - leave the button, no state change */
    }
  }

  const message: Record<Phase, string> = {
    starting: "Starting the camera…",
    scanning: "Center the whole barcode in the box",
    "looking-up": "Looking it up…",
    denied: "",
    error: "",
  };

  const showCamera = phase !== "denied" && phase !== "error";

  return (
    <div className="scanner">
      <div className="scanner-bar">
        <span>Scan a barcode</span>
        <button className="icon-btn" onClick={onClose} aria-label="Close scanner">
          <X />
        </button>
      </div>

      {showCamera ? (
        <div className="scanner-view">
          <video ref={videoRef} playsInline muted autoPlay className="scanner-video" />
          <div className="scanner-reticle" aria-hidden="true" />
          {torchAvail && phase === "scanning" && (
            <button
              className={`scanner-torch${torchOn ? " on" : ""}`}
              onClick={toggleTorch}
              aria-pressed={torchOn}
            >
              {torchOn ? "Light on" : "Light"}
            </button>
          )}
          <div className="scanner-msg">
            <p>
              {phase === "looking-up" && <span className="spin" />}
              {message[phase]}
            </p>
            {hint && phase === "scanning" && (
              <p className="scanner-hint">
                Hold it about a hand's width away, steady and well lit. If it still
                won't catch, type the number below.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="scanner-fallback">
          <p>
            {phase === "denied"
              ? "CarbTab needs camera access to scan. Allow it in your browser settings, or type the barcode number below."
              : "Couldn't get a picture from the camera on this device. Type the barcode number instead."}
          </p>
          {errText && <p className="scanner-err">{errText}</p>}
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
