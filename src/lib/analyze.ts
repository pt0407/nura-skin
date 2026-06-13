// ─────────────────────────────────────────────────────────────────────────────
//  NURA on-device skin analysis
//
//  Everything in this file runs in the browser, on a single captured frame.
//  No pixel ever leaves the device — there is no upload, no fetch, no database.
//  We locate the face, sample diagnostic zones (forehead, cheeks, under-eye,
//  T-zone, chin) and derive a set of dermatology-inspired metrics from the raw
//  pixels using classic computer-vision heuristics.
// ─────────────────────────────────────────────────────────────────────────────

export type MetricKey =
  | "hydration"
  | "evenness"
  | "clarity"
  | "texture"
  | "radiance"
  | "calmness";

export interface Metric {
  key: MetricKey;
  label: string;
  /** 0–100, higher is healthier */
  score: number;
  blurb: string;
}

export interface AnalysisResult {
  overall: number;
  metrics: Metric[];
  /** metric keys sorted worst-first */
  weakpoints: MetricKey[];
  skinTone: string;
  detectedFace: boolean;
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

// ── Face location ────────────────────────────────────────────────────────────
// Prefer the platform FaceDetector (Shape Detection API) when available.
// Otherwise fall back to a centered box that matches a face at arm's length.
async function locateFace(
  source: CanvasImageSource,
  width: number,
  height: number
): Promise<{ box: Box; detected: boolean }> {
  const AnyWin = window as unknown as {
    FaceDetector?: new (opts?: object) => {
      detect: (s: CanvasImageSource) => Promise<Array<{ boundingBox: DOMRectReadOnly }>>;
    };
  };
  if (AnyWin.FaceDetector) {
    try {
      const detector = new AnyWin.FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
      const faces = await detector.detect(source);
      if (faces && faces.length > 0) {
        const b = faces[0].boundingBox;
        return {
          box: { x: b.x, y: b.y, w: b.width, h: b.height },
          detected: true,
        };
      }
    } catch {
      /* fall through to heuristic */
    }
  }
  const w = width * 0.46;
  const h = height * 0.62;
  return {
    box: { x: (width - w) / 2, y: height * 0.14, w, h },
    detected: false,
  };
}

// ── Pixel sampling helpers ───────────────────────────────────────────────────
interface ZoneStats {
  lum: number; // mean luminance 0–255
  lumVar: number; // luminance variance (texture proxy)
  r: number;
  g: number;
  b: number;
  rednessIdx: number; // (r - mean(g,b)) normalized
  highlightRatio: number; // fraction of specular (oily) pixels
  count: number;
}

function sampleZone(data: Uint8ClampedArray, stride: number, box: Box): ZoneStats {
  const x0 = Math.max(0, Math.floor(box.x));
  const y0 = Math.max(0, Math.floor(box.y));
  const x1 = Math.floor(box.x + box.w);
  const y1 = Math.floor(box.y + box.h);

  let sumL = 0;
  let sumL2 = 0;
  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  let redCount = 0;
  let highlights = 0;
  let n = 0;

  for (let y = y0; y < y1; y += 2) {
    for (let x = x0; x < x1; x += 2) {
      const i = (y * stride + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      sumL += lum;
      sumL2 += lum * lum;
      sumR += r;
      sumG += g;
      sumB += b;
      const redness = r - (g + b) / 2;
      if (redness > 18) redCount++;
      // specular highlight: bright + low saturation
      const mx = Math.max(r, g, b);
      const mn = Math.min(r, g, b);
      const sat = mx === 0 ? 0 : (mx - mn) / mx;
      if (lum > 205 && sat < 0.22) highlights++;
      n++;
    }
  }

  if (n === 0) {
    return { lum: 0, lumVar: 0, r: 0, g: 0, b: 0, rednessIdx: 0, highlightRatio: 0, count: 0 };
  }
  const meanL = sumL / n;
  const variance = Math.max(0, sumL2 / n - meanL * meanL);
  const r = sumR / n;
  const g = sumG / n;
  const b = sumB / n;
  return {
    lum: meanL,
    lumVar: variance,
    r,
    g,
    b,
    rednessIdx: (r - (g + b) / 2) / 255,
    highlightRatio: highlights / n,
    count: n,
  };
}

function subBox(face: Box, fx: number, fy: number, fw: number, fh: number): Box {
  return {
    x: face.x + face.w * fx,
    y: face.y + face.h * fy,
    w: face.w * fw,
    h: face.h * fh,
  };
}

function toneName(r: number, g: number, b: number): string {
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const warmth = r - b; // warm vs cool
  const depth =
    lum > 200 ? "Fair" : lum > 165 ? "Light" : lum > 125 ? "Medium" : lum > 90 ? "Tan" : "Deep";
  const undertone = warmth > 28 ? "warm" : warmth < 8 ? "cool" : "neutral";
  return `${depth}, ${undertone} undertone`;
}

const METRIC_BLURBS: Record<MetricKey, [string, string]> = {
  // [strong, weak]
  hydration: [
    "Skin looks plump and well-hydrated.",
    "Signs of dryness and dehydration around key zones.",
  ],
  evenness: [
    "Tone reads even across the face.",
    "Visible unevenness and patchiness in tone.",
  ],
  clarity: [
    "Pores and surface look clear.",
    "Congestion and excess shine detected in the T-zone.",
  ],
  texture: [
    "Surface is smooth and refined.",
    "Rough patches and uneven texture detected.",
  ],
  radiance: [
    "Healthy, lit-from-within glow.",
    "Skin reads dull and could use more luminosity.",
  ],
  calmness: [
    "Low redness — skin looks calm.",
    "Redness and reactivity around the cheeks and nose.",
  ],
};

const METRIC_LABELS: Record<MetricKey, string> = {
  hydration: "Hydration",
  evenness: "Tone evenness",
  clarity: "Pore clarity",
  texture: "Texture",
  radiance: "Radiance",
  calmness: "Calmness",
};

function buildMetric(key: MetricKey, raw: number): Metric {
  const score = clamp(Math.round(raw));
  const [strong, weak] = METRIC_BLURBS[key];
  return {
    key,
    label: METRIC_LABELS[key],
    score,
    blurb: score >= 70 ? strong : weak,
  };
}

/**
 * Analyze a captured frame from a <video> or <canvas> / <img> source.
 * Returns a full skin report. Pure client-side.
 */
export async function analyzeFace(
  source: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement
): Promise<AnalysisResult> {
  const width =
    "videoWidth" in source && source.videoWidth
      ? source.videoWidth
      : (source as HTMLCanvasElement).width || (source as HTMLImageElement).naturalWidth || 640;
  const height =
    "videoHeight" in source && source.videoHeight
      ? source.videoHeight
      : (source as HTMLCanvasElement).height || (source as HTMLImageElement).naturalHeight || 480;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(source, 0, 0, width, height);

  const { box: face, detected } = await locateFace(canvas, width, height);
  const { data } = ctx.getImageData(0, 0, width, height);
  const stride = width;

  // Diagnostic zones expressed as fractions of the face box.
  const forehead = sampleZone(data, stride, subBox(face, 0.22, 0.04, 0.56, 0.16));
  const leftCheek = sampleZone(data, stride, subBox(face, 0.1, 0.5, 0.24, 0.22));
  const rightCheek = sampleZone(data, stride, subBox(face, 0.66, 0.5, 0.24, 0.22));
  const nose = sampleZone(data, stride, subBox(face, 0.4, 0.4, 0.2, 0.22));
  const underEyeL = sampleZone(data, stride, subBox(face, 0.16, 0.42, 0.2, 0.08));
  const underEyeR = sampleZone(data, stride, subBox(face, 0.64, 0.42, 0.2, 0.08));
  const chin = sampleZone(data, stride, subBox(face, 0.34, 0.82, 0.32, 0.14));

  const cheeks = avgStats([leftCheek, rightCheek]);
  const underEye = avgStats([underEyeL, underEyeR]);
  const all = avgStats([forehead, leftCheek, rightCheek, nose, chin]);

  // ── Derive metrics ─────────────────────────────────────────────────────────
  // Hydration: smoother (low local variance) + balanced brightness reads hydrated.
  const dryness = cheeks.lumVar / 900 + Math.max(0, (cheeks.lum - 200) / 120);
  const hydration = 100 - clamp(dryness * 46, 0, 78);

  // Evenness: lower spread of mean luminance between zones = more even.
  const zoneLums = [forehead.lum, leftCheek.lum, rightCheek.lum, nose.lum, chin.lum];
  const spread = stdev(zoneLums);
  const underEyeDelta = Math.max(0, cheeks.lum - underEye.lum); // dark circles
  const evenness = 100 - clamp(spread * 1.7 + underEyeDelta * 0.6, 0, 80);

  // Clarity: oily T-zone (forehead + nose highlights) reduces clarity.
  const tzoneOil = (forehead.highlightRatio + nose.highlightRatio) / 2;
  const clarity = 100 - clamp(tzoneOil * 520, 0, 82);

  // Texture: high-frequency variance across the whole face = rougher.
  const texture = 100 - clamp((all.lumVar / 1000) * 40, 0, 76);

  // Radiance: mid-bright, well-lit skin glows; very dark or flat reads dull.
  const glow = 100 - Math.abs(all.lum - 172) * 0.5 - Math.max(0, (30 - spread)) * 0;
  const radiance = clamp(glow, 12, 96);

  // Calmness: redness in cheeks + nose lowers calmness.
  const redness = (cheeks.rednessIdx + nose.rednessIdx) / 2;
  const calmness = 100 - clamp(redness * 360, 0, 80);

  const metrics: Metric[] = [
    buildMetric("hydration", hydration),
    buildMetric("evenness", evenness),
    buildMetric("clarity", clarity),
    buildMetric("texture", texture),
    buildMetric("radiance", radiance),
    buildMetric("calmness", calmness),
  ];

  const overall = Math.round(metrics.reduce((s, m) => s + m.score, 0) / metrics.length);
  const weakpoints = [...metrics]
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((m) => m.key);

  return {
    overall,
    metrics,
    weakpoints,
    skinTone: toneName(all.r, all.g, all.b),
    detectedFace: detected,
  };
}

// ── small stat helpers ───────────────────────────────────────────────────────
function avgStats(zones: ZoneStats[]): ZoneStats {
  const valid = zones.filter((z) => z.count > 0);
  const n = valid.length || 1;
  const sum = valid.reduce(
    (a, z) => ({
      lum: a.lum + z.lum,
      lumVar: a.lumVar + z.lumVar,
      r: a.r + z.r,
      g: a.g + z.g,
      b: a.b + z.b,
      rednessIdx: a.rednessIdx + z.rednessIdx,
      highlightRatio: a.highlightRatio + z.highlightRatio,
      count: a.count + z.count,
    }),
    { lum: 0, lumVar: 0, r: 0, g: 0, b: 0, rednessIdx: 0, highlightRatio: 0, count: 0 }
  );
  return {
    lum: sum.lum / n,
    lumVar: sum.lumVar / n,
    r: sum.r / n,
    g: sum.g / n,
    b: sum.b / n,
    rednessIdx: sum.rednessIdx / n,
    highlightRatio: sum.highlightRatio / n,
    count: sum.count,
  };
}

function stdev(arr: number[]): number {
  const m = arr.reduce((a, b) => a + b, 0) / arr.length;
  const v = arr.reduce((a, b) => a + (b - m) * (b - m), 0) / arr.length;
  return Math.sqrt(v);
}
