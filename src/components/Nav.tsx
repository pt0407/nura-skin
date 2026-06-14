import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [onHero, setOnHero] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout, isGuest, isAdmin, engaged } = useAuth();
  const location = useLocation();
  const isAuthPage = ["/login", "/register", "/dashboard", "/admin"].includes(location.pathname);

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

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

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
            <div className="nav-profile" ref={menuRef}>
              <button
                className="nav-user"
                onClick={() => setMenuOpen((o) => !o)}
                type="button"
              >
                {isGuest ? "Guest" : user.name}
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ marginLeft: "6px", opacity: 0.6, transform: menuOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {menuOpen && (
                <div className="nav-dropdown">
                  <Link to="/dashboard" className="nav-dropdown-item" onClick={() => setMenuOpen(false)}>
                    Dashboard
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="nav-dropdown-item" onClick={() => setMenuOpen(false)}>
                      Admin Panel
                    </Link>
                  )}
                  <button className="nav-dropdown-item" onClick={() => { logout(); setMenuOpen(false); }} type="button">
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="nav-login">
                Sign in
              </Link>
              <Link to="/login" className="nav-cta">
                {engaged ? "Open the app" : "Sign up"}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
