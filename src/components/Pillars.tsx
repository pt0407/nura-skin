import { motion } from "framer-motion";
import { SunIcon, ScanIcon, DropIcon, LeafIcon } from "./icons";

const ease = [0.2, 0.7, 0.2, 1] as const;

const PILLARS = [
  {
    icon: SunIcon,
    title: "Daily routines",
    body: "A morning and evening ritual tuned to your skin and your weather — adjusted as your skin changes.",
  },
  {
    icon: ScanIcon,
    title: "AI face scan",
    body: "Point your camera and get a clinical read on hydration, tone, texture and redness in seconds.",
  },
  {
    icon: DropIcon,
    title: "Smart product matches",
    body: "Recommendations mapped to your real weak points — not a brand's bestseller list.",
  },
  {
    icon: LeafIcon,
    title: "Hair, too",
    body: "Scalp and strand guidance built into the same ritual, so nothing about you is an afterthought.",
  },
];

export default function Pillars() {
  return (
    <section className="section" id="pillars">
      <div className="wrap">
        <motion.div
          className="section-head"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
        >
          <span className="eyebrow">What NURA does</span>
          <h2>Four pillars. One ritual.</h2>
          <p>
            Everything works from a single understanding of your face — so each
            recommendation reinforces the last, instead of pulling you in ten directions.
          </p>
        </motion.div>

        <div className="pillars-grid">
          {PILLARS.map((p, i) => (
            <motion.article
              key={p.title}
              className="pillar"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.65, ease, delay: i * 0.09 }}
            >
              <span className="pillar-index">0{i + 1}</span>
              <div className="pillar-icon">
                <p.icon size={22} />
              </div>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
