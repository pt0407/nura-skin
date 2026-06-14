import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Pool } = pg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "../server/users.json");
const JWT_SECRET = process.env.JWT_SECRET || "nura_dev_secret_change_me";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    })
  : null;

async function initDb() {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      email TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      password_hash TEXT,
      auth_provider TEXT DEFAULT 'email',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  try {
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'email'`);
    await pool.query(`ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL`);
  } catch {
    // columns may already exist
  }
}

async function readDb() {
  if (pool) {
    const { rows } = await pool.query("SELECT email, name, password_hash, auth_provider FROM users");
    const map = {};
    for (const r of rows) map[r.email] = { name: r.name, passwordHash: r.password_hash, authProvider: r.auth_provider };
    return map;
  }
  if (!existsSync(DB_PATH)) return {};
  const raw = await readFile(DB_PATH, "utf-8");
  try { return JSON.parse(raw); } catch { return {}; }
}

async function writeDb(db) {
  if (pool) return;
  await writeFile(DB_PATH, JSON.stringify(db, null, 2));
}

async function createUser(email, name, passwordHash, authProvider = "email") {
  if (pool) {
    await pool.query(
      "INSERT INTO users (email, name, password_hash, auth_provider) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO UPDATE SET name = $2",
      [email, name, passwordHash, authProvider]
    );
  } else {
    const db = await readDb();
    db[email] = { name, email, passwordHash, authProvider };
    await writeDb(db);
  }
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

function verifyToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = auth.slice(7);
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

function getBaseUrl(req) {
  const host = req.headers.host || "localhost:3001";
  const proto = req.headers["x-forwarded-proto"] || (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/auth/google", (req, res) => {
  if (!GOOGLE_CLIENT_ID) {
    return res.status(503).json({ error: "Google OAuth not configured" });
  }
  const base = getBaseUrl(req);
  const redirectUri = `${base}/api/auth/google/callback`;
  const state = Buffer.from(JSON.stringify({ redirect: `${base}/dashboard` })).toString("base64url");
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", GOOGLE_CLIENT_ID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("access_type", "online");
  url.searchParams.set("prompt", "consent");
  res.redirect(url.toString());
});

app.get("/api/auth/google/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).json({ error: "Missing code" });

  const base = getBaseUrl(req);
  const redirectUri = `${base}/api/auth/google/callback`;

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      return res.status(400).json({ error: "Failed to exchange code" });
    }

    const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await profileRes.json();
    if (!profileRes.ok || !profile.email) {
      return res.status(400).json({ error: "Failed to fetch profile" });
    }

    await initDb();
    const email = profile.email.toLowerCase();
    const name = profile.name || profile.given_name || email.split("@")[0];
    const dummyHash = await bcrypt.hash(Math.random().toString(36), 10);
    await createUser(email, name, dummyHash, "google");

    const token = signToken({ email, name, provider: "google" });
    const redirect = `${base}/dashboard?token=${encodeURIComponent(token)}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`;
    res.redirect(redirect);
  } catch (err) {
    console.error("Google OAuth error:", err);
    res.status(500).json({ error: "OAuth failed" });
  }
});

app.post("/api/guest", (_req, res) => {
  const guestId = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const token = signToken({ email: `guest-${guestId}@nura.local`, name: "Guest", isGuest: true });
  res.json({ token, user: { email: "guest@nura.local", name: "Guest", isGuest: true } });
});

app.post("/api/register", async (req, res) => {
  await initDb();
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }
  const key = email.toLowerCase();
  const db = await readDb();
  if (db[key]) {
    return res.status(409).json({ error: "Account already exists" });
  }
  const hash = await bcrypt.hash(password, 10);
  await createUser(key, name, hash, "email");
  const token = signToken({ email: key, name });
  res.json({ token, user: { email: key, name } });
});

app.post("/api/login", async (req, res) => {
  await initDb();
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }
  const key = email.toLowerCase();
  const db = await readDb();
  const found = db[key];
  if (!found || !found.passwordHash) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const ok = await bcrypt.compare(password, found.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const token = signToken({ email: key, name: found.name });
  res.json({ token, user: { email: key, name: found.name } });
});

app.get("/api/me", verifyToken, async (req, res) => {
  res.json({ user: req.user });
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

export default app;
