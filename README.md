# NURA — skin & hair care, guided by your face

A clinical-feeling skincare companion for people who take their skin seriously.
NURA scans your face, identifies your skin's weak points with on-device AI, and
builds a focused routine matched to what your skin actually needs.

**Your face never leaves your device.** The camera frame is analyzed entirely in
the browser and discarded — there is no upload, no server, and no database.

🔗 **Live site:** _(deployed on Vercel — see below)_

![NURA hero](https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=1200&q=80)

## How the analysis works

Everything runs client-side in [`src/lib/analyze.ts`](src/lib/analyze.ts):

1. **Capture** a single frame from the webcam (or an uploaded selfie).
2. **Locate the face** using the platform `FaceDetector` (Shape Detection API)
   when available, with a centered-box fallback.
3. **Sample diagnostic zones** — forehead, cheeks, under-eye, T-zone, nose, chin.
4. **Derive six dermatology-inspired scores** from raw pixels using classic
   computer-vision heuristics:
   - **Hydration** — surface smoothness / local luminance variance
   - **Tone evenness** — luminance spread across zones + under-eye darkness
   - **Pore clarity** — specular-highlight (oil/shine) ratio in the T-zone
   - **Texture** — high-frequency variance across the face
   - **Radiance** — overall luminance balance
   - **Calmness** — redness index in cheeks and nose
5. **Match a routine** from a tagged product catalog
   ([`src/lib/products.ts`](src/lib/products.ts)) to your three weakest scores,
   always finishing with SPF.

No pixel is ever transmitted off the device.

## Tech

- **Vite + React + TypeScript**
- **Framer Motion** for scroll reveals, the scanning animation, and the
  animated score ring / metric bars
- On-device image analysis via the Canvas API (no model download, no backend)
- Fully static — deploys anywhere

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build    # production build to dist/
npm run preview  # preview the production build
```

> Camera access requires a secure context (`https://` or `localhost`).

## Deploy

This is a static Vite app. On Vercel, import the repo and it auto-detects the
framework — build command `npm run build`, output directory `dist`. No
environment variables are required.

## Disclaimer

NURA provides cosmetic guidance only. It is **not a medical device** and does
not diagnose or treat any condition. For medical concerns, see a dermatologist.
