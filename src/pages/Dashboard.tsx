import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function Dashboard() {
  const { user, logout, isGuest } = useAuth();

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Hello, {user?.name ?? "there"}</h1>
        <p className="login-subtitle">
          {isGuest
            ? "You are browsing as a guest."
            : `You&apos;re signed in as ${user?.email}.`}
        </p>
        <div className="login-form">
          {isGuest && (
            <div
              style={{
                background: "var(--cream-card)",
                border: "1px solid var(--line)",
                borderRadius: "12px",
                padding: "1rem",
                marginBottom: "1rem",
                fontSize: "0.92rem",
                color: "var(--ink-soft)",
                lineHeight: "1.5",
              }}
            >
              Create an account to save your skin analysis history and get
              personalized routines.
            </div>
          )}
          <p style={{ marginBottom: "1rem", color: "var(--ink-soft)" }}>
            Your skin and hair analysis history will appear here.
          </p>
          <Link to="/" className="login-btn" style={{ textAlign: "center" }}>
            Go to home
          </Link>
          {isGuest ? (
            <Link to="/register" className="login-btn">
              Create account
            </Link>
          ) : null}
          <button
            type="button"
            className="login-btn secondary"
            onClick={logout}
          >
            {isGuest ? "End session" : "Sign out"}
          </button>
        </div>
      </div>
    </div>
  );
}
