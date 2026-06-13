import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { analyzeFace, type AnalysisResult } from "../lib/analyze";
import { recommend, shopUrl, type Recommendation } from "../lib/products";
import {
  CameraIcon,
  CheckIcon,
  LockIcon,
  RefreshIcon,
  SparkIcon,
  ArrowIcon,
} from "./icons";

type Phase = "idle" | "live" | "scanning" | "done" | "error";

const STATUS_LINES = [
  "Locating facial landmarks…",
  "Sampling forehead & T-zone…",
  "Reading cheek hydration & redness…",
  "Measuring tone evenness…",
  "Scoring texture & radiance…",
  "Building your routine…",
];

export default function Scanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<HTMLImageElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<Phase>("idle");
  const [statusIdx, setStatusIdx] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [rx, setRx] = useState<Recommendation[]>([]);
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => () => stopStream(), [stopStream]);

  const startCamera = useCallback(async () => {
    setError(null);
    setResult(null);
    setCapturedUrl(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 1600 } },
        audio: false,
      });
      streamRef.current = stream;
      setPhase("live");
      // wait for the video element to mount
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      });
    } catch {
      setError(
        "We couldn't reach your camera. Check browser permissions, or upload a clear, well-lit selfie instead."
      );
      setPhase("error");
    }
  }, []);

  const runAnalysis = useCallback(
    async (source: HTMLVideoElement | HTMLImageElement) => {
      setPhase("scanning");
      setStatusIdx(0);
      const ticker = setInterval(
        () => setStatusIdx((i) => Math.min(i + 1, STATUS_LINES.length - 1)),
        420
      );
      // brief, deliberate delay so the scan animation reads as "analysis"
      const [res] = await Promise.all([
        analyzeFace(source),
        new Promise((r) => setTimeout(r, 2600)),
      ]);
      clearInterval(ticker);
      setResult(res);
      setRx(recommend(res));
      setPhase("done");
    },
    []
  );

  const capture = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    // freeze the current frame as an image for the "done" state
    const c = document.createElement("canvas");
    c.width = video.videoWidth || 640;
    c.height = video.videoHeight || 800;
    c.getContext("2d")!.drawImage(video, 0, 0, c.width, c.height);
    setCapturedUrl(c.toDataURL("image/jpeg", 0.9));
    await runAnalysis(video);
    stopStream();
  }, [runAnalysis, stopStream]);

  const onUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setError(null);
      const url = URL.createObjectURL(file);
      setCapturedUrl(url);
      stopStream();
      const img = new Image();
      img.onload = () => runAnalysis(img);
      img.onerror = () => {
        setError("That image couldn't be read. Try a different photo.");
        setPhase("error");
      };
      img.src = url;
      e.target.value = "";
    },
    [runAnalysis, stopStream]
  );

  const reset = useCallback(() => {
    stopStream();
    setResult(null);
    setRx([]);
    setCapturedUrl(null);
    setError(null);
    setPhase("idle");
  }, [stopStream]);

  return (
    <section className="section scanner" id="scan">
      <div className="wrap scan-shell">
        {/* ── Camera stage ── */}
        <div className="scan-stage">
          {phase === "live" && (
            <video ref={videoRef} playsInline muted autoPlay />
          )}

          {(phase === "scanning" || phase === "done") && capturedUrl && (
            <img ref={frameRef} className="frame" src={capturedUrl} alt="Captured frame" />
          )}

          {(phase === "idle" || phase === "error") && (
            <div className="scan-idle">
              <div className="ring">
                <CameraIcon size={30} />
              </div>
              <p>
                {phase === "error"
                  ? "Camera unavailable — upload a selfie to continue."
                  : "Your camera feed stays on this device. Nothing is uploaded, ever."}
              </p>
            </div>
          )}

          {phase === "live" && (
            <div className="scan-overlay">
              <div className="face-guide" />
            </div>
          )}

          {phase === "scanning" && (
            <div className="scan-overlay">
              <div className="scan-grid" />
              <div className="scan-line" />
            </div>
          )}

          {(phase === "live" || phase === "scanning") && (
            <div className="scan-status">
              <span className="scan-dot" />
              {phase === "live"
                ? "Center your face in the guide, then capture"
                : STATUS_LINES[statusIdx]}
            </div>
          )}

          {phase === "done" && (
            <motion.div
              className="scan-status"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <CheckIcon size={16} /> Analysis complete · processed on-device
            </motion.div>
          )}
        </div>

        {/* ── Side panel ── */}
        <div className="scan-panel">
          <AnimatePresence mode="wait">
            {phase !== "done" ? (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.4 }}
              >
                <span className="privacy-tag">
                  <LockIcon size={15} /> Private by design · 100% on-device
                </span>
                <h2>Scan your face.</h2>
                <p>
                  NURA reads your skin in real time using on-device computer vision. Your
                  camera frame is analyzed in the browser and discarded — it is never sent
                  to a server, never stored, never added to a database.
                </p>

                <div className="scan-controls">
                  {phase === "idle" || phase === "error" ? (
                    <button className="btn btn-dark" onClick={startCamera}>
                      <CameraIcon size={18} /> Start camera
                    </button>
                  ) : phase === "live" ? (
                    <button className="btn btn-dark" onClick={capture}>
                      <SparkIcon size={18} /> Capture & analyze
                    </button>
                  ) : (
                    <button className="btn btn-dark" disabled style={{ opacity: 0.7 }}>
                      Analyzing…
                    </button>
                  )}
                </div>

                <div className="scan-note">
                  No camera?{" "}
                  <span className="upload-link" onClick={() => fileRef.current?.click()}>
                    Upload a selfie
                  </span>{" "}
                  — it's processed the same private way.
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={onUpload}
                />

                {error && <div className="scan-error">{error}</div>}
              </motion.div>
            ) : (
              result && (
                <Results
                  key="results"
                  result={result}
                  rx={rx}
                  onReset={reset}
                  onUpload={() => fileRef.current?.click()}
                />
              )
            )}
          </AnimatePresence>
          {/* keep the file input mounted for the results view too */}
          {phase === "done" && (
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onUpload} />
          )}
        </div>
      </div>
    </section>
  );
}

/* ── Results view ── */
function Results({
  result,
  rx,
  onReset,
  onUpload,
}: {
  result: AnalysisResult;
  rx: Recommendation[];
  onReset: () => void;
  onUpload: () => void;
}) {
  const [shownScore, setShownScore] = useState(0);
  const R = 52;
  const C = 2 * Math.PI * R;

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const dur = 1100;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setShownScore(Math.round(eased * result.overall));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [result.overall]);

  const grade =
    result.overall >= 78
      ? "Glowing"
      : result.overall >= 64
      ? "Healthy, with room to refine"
      : result.overall >= 50
      ? "A few clear priorities"
      : "Let's build from the basics";

  return (
    <motion.div
      className="results"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.45 }}
    >
      <div className="score-head">
        <div className="score-ring">
          <svg width="116" height="116">
            <circle cx="58" cy="58" r={R} stroke="#e1ddd0" strokeWidth="9" fill="none" />
            <motion.circle
              cx="58"
              cy="58"
              r={R}
              stroke="#3c5043"
              strokeWidth="9"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={C}
              initial={{ strokeDashoffset: C }}
              animate={{ strokeDashoffset: C - (result.overall / 100) * C }}
              transition={{ duration: 1.1, ease: [0.2, 0.7, 0.2, 1] }}
            />
          </svg>
          <div className="val">
            <span className="num">{shownScore}</span>
            <span className="lbl">Skin score</span>
          </div>
        </div>
        <div>
          <h3>{grade}</h3>
          <p>
            {result.skinTone}
            {result.detectedFace ? " · face detected" : ""}. Here's where to focus.
          </p>
        </div>
      </div>

      <div className="metric-list">
        {result.metrics.map((m, i) => {
          const weak = result.weakpoints.includes(m.key);
          return (
            <div key={m.key} className={`metric${weak ? " weak" : ""}`}>
              <span className="m-label">
                {m.label} {weak && <span className="weak-tag">· focus</span>}
              </span>
              <span className="m-val">{m.score}</span>
              <div className="m-bar">
                <motion.div
                  className="m-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${m.score}%` }}
                  transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1], delay: 0.2 + i * 0.07 }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="routine">
        <h4>Your matched routine</h4>
        <div className="rx">
          {rx.map((p, i) => (
            <motion.a
              key={p.name}
              className="rx-item"
              href={shopUrl(p)}
              target="_blank"
              rel="noopener noreferrer"
              title={`Shop ${p.type.toLowerCase()} — opens a retailer search`}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
            >
              <span className="rx-swatch" style={{ background: p.tint }} />
              <div className="rx-body">
                <div className="rx-brand">{p.brand}</div>
                <div className="rx-name">{p.name}</div>
                <div className="rx-reason">
                  {p.type} · {p.reason}
                </div>
              </div>
              <div className="rx-meta">
                <span className="rx-price">{p.price}</span>
                <span className="rx-step">{p.step}</span>
              </div>
              <span className="rx-go" aria-hidden="true">
                <ArrowIcon size={15} />
              </span>
            </motion.a>
          ))}
        </div>
        <p className="affiliate-note">
          NURA may earn a commission on purchases made through these links, at no
          extra cost to you. Picks are matched to your scan — never paid placements.
        </p>
      </div>

      <div className="results-actions">
        <button className="btn btn-dark" onClick={onReset}>
          <RefreshIcon size={17} /> Scan again
        </button>
        <button className="link-btn" onClick={onUpload}>
          Try a different photo <ArrowIcon size={15} />
        </button>
      </div>
    </motion.div>
  );
}
