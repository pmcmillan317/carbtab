import { useEffect, useRef, useState } from "react";
import type QuaggaStatic from "@ericblade/quagga2";
import { lookupBarcode, type BarcodeResult } from "../lib/barcode";
import { X } from "./icons";

type Phase = "starting" | "scanning" | "looking-up" | "denied" | "error";

/**
 * Barcode scanner. Opens the back camera and reads a UPC/EAN with Quagga2
 * (loaded on demand so it isn't in the main bundle), then resolves it via
 * lib/barcode.
 *  - found  -> onResult(food)
 *  - not found or camera unavailable -> onNotFound(code | null)
 *
 * Was ZXing (a QR-code library ported to JS) through 2026-09-12; swapped for
 * Quagga2, which is built specifically for continuous 1D-barcode reading off
 * a live camera feed (it locates barcode-shaped regions in the frame before
 * trying to decode them, instead of blindly scanning fixed rows). ZXing's
 * live decode kept returning zero results on a real phone even at 1080p with
 * TRY_HARDER enabled and a barcode squarely in frame - see the on-screen
 * diagnostics below if this needs debugging again.
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
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<Phase>("starting");
  const [manual, setManual] = useState("");
  const [hint, setHint] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [torchAvail, setTorchAvail] = useState(false);
  const [errText, setErrText] = useState("");
  const [diag, setDiag] = useState("");
  const doneRef = useRef(false);
  const attemptsRef = useRef(0);
  const locatedRef = useRef(0);
  const quaggaRef = useRef<typeof QuaggaStatic | null>(null);

  useEffect(() => {
    let hintTimer: ReturnType<typeof setTimeout>;
    let diagTimer: ReturnType<typeof setInterval>;
    let cancelled = false;
    let Quagga: typeof QuaggaStatic | null = null;

    // Fires for every frame Quagga looks at, success or not - this is what
    // lets the diagnostics line below say "the scanner is genuinely trying
    // and failing" instead of "nothing is happening at all". data.boxes are
    // the barcode-shaped regions the locator found before attempting to
    // decode them, so a rising "located" count with attempts stuck at 0
    // decodes tells you it's SEEING the barcode but not reading it, which is
    // a different bug than not seeing it at all.
    const onProcessed = (data: { boxes?: unknown[] } | undefined) => {
      attemptsRef.current++;
      if (data?.boxes?.length) locatedRef.current++;
    };
    const onDetected = (data: { codeResult?: { code?: string | null } } | undefined) => {
      const code = data?.codeResult?.code;
      if (code && !doneRef.current) {
        doneRef.current = true;
        void resolve(code);
      }
    };

    (async () => {
      try {
        const mod = await import("@ericblade/quagga2");
        Quagga = mod.default;
        quaggaRef.current = Quagga;
        if (cancelled || !containerRef.current) return;

        Quagga.onProcessed(onProcessed);
        Quagga.onDetected(onDetected);

        await Quagga.init({
          inputStream: {
            type: "LiveStream",
            target: containerRef.current,
            constraints: {
              facingMode: { ideal: "environment" },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          },
          decoder: { readers: ["upc_reader", "upc_e_reader", "ean_reader", "ean_8_reader"] },
          locate: true,
          numOfWorkers: navigator.hardwareConcurrency ? Math.min(navigator.hardwareConcurrency, 4) : 2,
          canvas: { createOverlay: false },
        });
        if (cancelled) {
          void Quagga.stop();
          return;
        }

        Quagga.start();
        setPhase("scanning");
        // "torch" is a real, widely-supported MediaTrackCapability but isn't
        // in TypeScript's DOM lib types yet.
        const caps = Quagga.CameraAccess.getActiveTrack()?.getCapabilities?.() as
          | (MediaTrackCapabilities & { torch?: boolean })
          | undefined;
        setTorchAvail(!!caps?.torch);

        hintTimer = setTimeout(() => {
          if (!doneRef.current) setHint(true);
        }, 6000);

        // Diagnostics + a stall watchdog: if the frame-processed count never
        // moves, the camera turned on but Quagga never got a frame to look
        // at, which is a different (and worse) bug than "can't read this
        // particular barcode".
        let lastAttempts = 0;
        let staleTicks = 0;
        diagTimer = setInterval(() => {
          if (doneRef.current) return;
          const settings = Quagga?.CameraAccess.getActiveTrack()?.getSettings();
          setDiag(
            `${settings?.width ?? "?"}x${settings?.height ?? "?"} · ${settings?.facingMode ?? "facing?"} · ` +
              `attempts ${attemptsRef.current} · located ${locatedRef.current}`,
          );
          if (attemptsRef.current > lastAttempts) {
            lastAttempts = attemptsRef.current;
            staleTicks = 0;
            return;
          }
          if (++staleTicks >= 5) {
            clearInterval(diagTimer);
            setErrText((t) => t || "The camera turned on but never processed a frame.");
            setPhase("error");
            if (Quagga) void Quagga.stop();
          }
        }, 800);
      } catch (e: unknown) {
        const name = (e as { name?: string })?.name;
        setPhase(name === "NotAllowedError" || name === "SecurityError" ? "denied" : "error");
      }
    })();

    return () => {
      cancelled = true;
      doneRef.current = true;
      clearTimeout(hintTimer);
      clearInterval(diagTimer);
      if (Quagga) {
        try {
          Quagga.offProcessed(onProcessed);
          Quagga.offDetected(onDetected);
          void Quagga.stop();
        } catch {
          /* already stopped */
        }
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
    const Quagga = quaggaRef.current;
    if (!Quagga) return;
    try {
      if (torchOn) await Quagga.CameraAccess.disableTorch();
      else await Quagga.CameraAccess.enableTorch();
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
        <div className="scanner-view" ref={containerRef}>
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
          {diag && <p className="scanner-diag">{diag}</p>}
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
