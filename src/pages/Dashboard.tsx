import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Hello, {user?.name ?? "there"}</h1>
        <p className="login-subtitle">
          You&apos;re signed in as {user?.email}.
        </p>
        <div className="login-form">
          <p style={{ marginBottom: "1rem", color: "var(--text-2)" }}>
            Your skin and hair analysis history will appear here.
          </p>
          <Link to="/" className="login-btn" style={{ textAlign: "center" }}>
            Go to home
          </Link>
          <button
            type="button"
            className="login-btn secondary"
            onClick={logout}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
