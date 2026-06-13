import { motion } from "framer-motion";
import { CpuIcon, NoCloudIcon, LockIcon } from "./icons";

const ease = [0.2, 0.7, 0.2, 1] as const;

const POINTS = [
  {
    icon: CpuIcon,
    title: "Analysis runs on your device",
    body: "The model reads your camera frame right in the browser. Your face never travels over the network.",
  },
  {
    icon: NoCloudIcon,
    title: "No uploads, no database",
    body: "There's no server to send your image to. Nothing is stored, indexed, or tied to your identity.",
  },
  {
    icon: LockIcon,
    title: "Discarded the moment it's read",
    body: "Once your scores are calculated, the frame is dropped from memory. Close the tab and it's gone.",
  },
];

export default function Privacy() {
  return (
    <section className="section privacy" id="privacy">
      <div className="wrap privacy-inner">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
        >
          <span className="eyebrow">Privacy</span>
          <h2>Your face is yours. Full stop.</h2>
          <p>
            Skin data is some of the most personal there is. NURA was built so that the
            most intimate part of the product — your face — never has to leave the device
            you're holding. The intelligence comes to you, not the other way around.
          </p>
        </motion.div>

        <div className="privacy-points">
          {POINTS.map((p, i) => (
            <motion.div
              key={p.title}
              className="pp"
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease, delay: i * 0.1 }}
            >
              <span className="pp-ico">
                <p.icon size={24} />
              </span>
              <div>
                <h4>{p.title}</h4>
                <p>{p.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
