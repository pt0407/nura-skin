import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth";

interface Stats {
  totalUsers: number;
  emailUsers: number;
  googleUsers: number;
  guestUsers: number;
  visitsToday: number;
  visitsWeek: number;
  visitsMonth: number;
  dailyVisits: { date: string; total: number }[];
}

interface AdminUser {
  email: string;
  name: string;
  auth_provider: string;
  is_admin: boolean;
  created_at: string;
}

export default function Admin() {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"overview" | "users">("overview");

  const API_URL = import.meta.env.VITE_API_URL || "";
  const token = localStorage.getItem("nura_token");

  useEffect(() => {
    if (!isAdmin) {
      setError("Admin access required.");
      setLoading(false);
      return;
    }
    fetch(`${API_URL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setStats(data);
        }
      })
      .catch(() => setError("Failed to load stats."))
      .finally(() => setLoading(false));

    fetch(`${API_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.users) setUsers(data.users);
      })
      .catch(() => {});
  }, [isAdmin, API_URL, token]);

  if (loading) {
    return (
      <div className="login-page">
        <div className="login-card" style={{ textAlign: "center", padding: "4rem" }}>
          <p style={{ color: "var(--ink-soft)" }}>Loading admin panel…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="login-page">
        <div className="login-card">
          <h1 className="login-title">Access Denied</h1>
          <p className="login-subtitle">{error}</p>
          <Link to="/" className="login-btn" style={{ textAlign: "center", marginTop: "1rem" }}>
            Go home
          </Link>
        </div>
      </div>
    );
  }

  const maxDaily = stats?.dailyVisits?.length
    ? Math.max(...stats.dailyVisits.map((d) => d.total))
    : 1;

  return (
    <div className="login-page" style={{ padding: "100px 24px 40px", alignItems: "flex-start" }}>
      <div style={{ width: "100%", maxWidth: "960px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h1 className="login-title" style={{ margin: 0 }}>
            Admin Panel
          </h1>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              className={`admin-tab${tab === "overview" ? " active" : ""}`}
              onClick={() => setTab("overview")}
            >
              Overview
            </button>
            <button
              className={`admin-tab${tab === "users" ? " active" : ""}`}
              onClick={() => setTab("users")}
            >
              Users
            </button>
          </div>
        </div>

        {tab === "overview" && stats && (
          <>
            <div className="admin-grid">
              <div className="admin-card">
                <p className="admin-label">Total Users</p>
                <p className="admin-value">{stats.totalUsers}</p>
              </div>
              <div className="admin-card">
                <p className="admin-label">Email</p>
                <p className="admin-value">{stats.emailUsers}</p>
              </div>
              <div className="admin-card">
                <p className="admin-label">Google</p>
                <p className="admin-value">{stats.googleUsers}</p>
              </div>
              <div className="admin-card">
                <p className="admin-label">Guests</p>
                <p className="admin-value">{stats.guestUsers}</p>
              </div>
              <div className="admin-card">
                <p className="admin-label">Visits Today</p>
                <p className="admin-value">{stats.visitsToday}</p>
              </div>
              <div className="admin-card">
                <p className="admin-label">Visits (7d)</p>
                <p className="admin-value">{stats.visitsWeek}</p>
              </div>
              <div className="admin-card">
                <p className="admin-label">Visits (30d)</p>
                <p className="admin-value">{stats.visitsMonth}</p>
              </div>
            </div>

            {stats.dailyVisits.length > 0 && (
              <div className="admin-chart-card">
                <p className="admin-label" style={{ marginBottom: "1rem" }}>
                  Daily Visits (Last 7 Days)
                </p>
                <div className="admin-chart">
                  {stats.dailyVisits.map((d) => (
                    <div key={d.date} className="admin-chart-col">
                      <div
                        className="admin-chart-bar"
                        style={{
                          height: `${(d.total / maxDaily) * 100}%`,
                        }}
                        title={`${d.date}: ${d.total} visits`}
                      />
                      <span className="admin-chart-label">
                        {new Date(d.date).toLocaleDateString("en-US", {
                          weekday: "short",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {tab === "users" && (
          <div className="admin-table-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Provider</th>
                  <th>Admin</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.email}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`admin-badge ${u.auth_provider}`}>
                        {u.auth_provider}
                      </span>
                    </td>
                    <td>{u.is_admin ? "Yes" : "No"}</td>
                    <td>
                      {u.created_at
                        ? new Date(u.created_at).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
