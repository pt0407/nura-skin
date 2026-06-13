import { motion } from "framer-motion";
import { ArrowIcon } from "./icons";

const ease = [0.2, 0.7, 0.2, 1] as const;

export default function Footer() {
  return (
    <>
      <section className="cta">
        <div className="wrap">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.75, ease }}
          >
            <h2>Meet the skin you'd have on your best day.</h2>
            <p>
              One scan. A routine built around your real weak points. Private from the
              first frame to the last.
            </p>
            <a href="#scan" className="btn btn-dark">
              Scan my face <ArrowIcon size={18} />
            </a>
          </motion.div>
        </div>
      </section>

      <footer className="footer">
        <div className="wrap">
          <div className="footer-inner">
            <div>
              <div className="brand">NURA</div>
              <p className="footer-tag">
                Skin and hair care, guided by your face — and kept entirely on your device.
              </p>
            </div>
            <div className="footer-cols">
              <div className="footer-col">
                <h5>Product</h5>
                <a href="#scan">Face scan</a>
                <a href="#pillars">Features</a>
                <a href="#how">How it works</a>
              </div>
              <div className="footer-col">
                <h5>Trust</h5>
                <a href="#privacy">Privacy</a>
                <a href="#privacy">On-device AI</a>
                <a href="#privacy">No database</a>
              </div>
              <div className="footer-col">
                <h5>Company</h5>
                <a href="#top">About</a>
                <a href="#top">Journal</a>
                <a href="#top">Contact</a>
              </div>
            </div>
          </div>
          <div className="footer-base">
            <span>© {new Date().getFullYear()} NURA. All rights reserved.</span>
            <span className="disclaimer">
              NURA provides cosmetic guidance only and is not a medical device. It does not
              diagnose or treat any condition — see a dermatologist for medical concerns.
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
