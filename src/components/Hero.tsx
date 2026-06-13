import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowIcon } from "./icons";

const ease = [0.2, 0.7, 0.2, 1] as const;

// Served from Unsplash's image CDN (hotlink-friendly). The gradient below is a
// graceful fallback if the image ever fails to load.
const HERO_IMG =
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=1500&q=80";

export default function Hero() {
  const [imgOk, setImgOk] = useState(true);

  return (
    <header className="hero" id="top">
      <div className="hero-media">
        {imgOk && (
          <motion.img
            src={HERO_IMG}
            alt=""
            onError={() => setImgOk(false)}
            initial={{ scale: 1.12 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.8, ease }}
          />
        )}
        {!imgOk && <div className="hero-fallback" />}
      </div>
      <div className="hero-grad" />
      <div className="hero-grain" />

      <div className="wrap hero-content">
        <motion.p
          className="hero-eyebrow"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.15 }}
        >
          NURA
        </motion.p>

        <h1>
          {["Skin and hair care,", "guided by your face."].map((line, li) => (
            <span key={li} style={{ display: "block", overflow: "hidden" }}>
              <motion.span
                style={{ display: "inline-block" }}
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.95, ease, delay: 0.3 + li * 0.12 }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          className="hero-sub"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.62 }}
        >
          A clinical companion that scans your skin, learns your hair, and builds a
          routine that actually works. For everyone — and it never leaves your device.
        </motion.p>

        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.76 }}
        >
          <a href="#scan" className="btn btn-primary">
            Open the app <ArrowIcon size={18} />
          </a>
          <a href="#pillars" className="btn btn-ghost">
            Scroll to features
          </a>
        </motion.div>
      </div>

      <motion.div
        className="hero-scroll"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.3 }}
      >
        <span>Scroll</span>
        <span className="line" />
      </motion.div>
    </header>
  );
}
