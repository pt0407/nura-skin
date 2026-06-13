import { useEffect, useState } from "react";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [onHero, setOnHero] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setOnHero(y < window.innerHeight - 90);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`nav${scrolled ? " scrolled" : ""}${onHero ? " on-hero" : ""}`}>
      <div className="wrap nav-inner">
        <a href="#top" className="brand">
          NURA
        </a>
        <div className="nav-links">
          <a href="#pillars">What it does</a>
          <a href="#how">How it works</a>
          <a href="#scan">Face scan</a>
          <a href="#privacy">Privacy</a>
        </div>
        <a href="#scan" className="nav-cta">
          Open the app
        </a>
      </div>
    </nav>
  );
}
