import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [onHero, setOnHero] = useState(true);
  const { user, logout, isGuest } = useAuth();
  const location = useLocation();
  const isAuthPage = ["/login", "/register", "/dashboard"].includes(location.pathname);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setOnHero(y < window.innerHeight - 90 && !isAuthPage);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isAuthPage]);

  return (
    <nav className={`nav${scrolled ? " scrolled" : ""}${onHero && !isAuthPage ? " on-hero" : ""}`}>
      <div className="wrap nav-inner">
        <Link to="/" className="brand">
          NURA
        </Link>
        {!isAuthPage && (
          <div className="nav-links">
            <a href="#pillars">What it does</a>
            <a href="#how">How it works</a>
            <a href="#scan">Face scan</a>
            <a href="#privacy">Privacy</a>
          </div>
        )}
        <div className="nav-actions">
          {user ? (
            <>
              <Link to="/dashboard" className="nav-user">
                {isGuest ? "Guest" : user.name}
              </Link>
              <button className="nav-cta" onClick={logout}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-login">
                Sign in
              </Link>
              <Link to="/login" className="nav-cta">
                Open the app
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
