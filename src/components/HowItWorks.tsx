import { motion } from "framer-motion";

const ease = [0.2, 0.7, 0.2, 1] as const;

const STEPS = [
  {
    title: "Scan",
    body: "Open the camera and hold still for a moment. NURA finds your face and reads each zone — forehead, cheeks, under-eye, T-zone.",
  },
  {
    title: "Understand",
    body: "On-device models translate raw pixels into six dermatology-inspired scores and surface the weak points worth fixing first.",
  },
  {
    title: "Act",
    body: "Get a focused four-step routine matched to those weak points, with the right active in the right order — morning and night.",
  },
];

export default function HowItWorks() {
  return (
    <section className="section how" id="how">
      <div className="wrap">
        <motion.div
          className="section-head"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
        >
          <span className="eyebrow">How it works</span>
          <h2>Three steps, start to ritual.</h2>
          <p>No questionnaires guessing at your skin. The analysis starts from your actual face.</p>
        </motion.div>

        <div className="steps">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              className="step"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.65, ease, delay: i * 0.12 }}
            >
              <div className="step-num">0{i + 1}</div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
