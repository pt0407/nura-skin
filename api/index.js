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
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
}

async function readDb() {
  if (pool) {
    const { rows } = await pool.query("SELECT email, name, password_hash FROM users");
    const map = {};
    for (const r of rows) map[r.email] = { name: r.name, passwordHash: r.password_hash };
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

async function createUser(email, name, passwordHash) {
  if (pool) {
    await pool.query(
      "INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3)",
      [email, name, passwordHash]
    );
  } else {
    const db = await readDb();
    db[email] = { name, email, passwordHash };
    await writeDb(db);
  }
}

function signToken(user) {
  return jwt.sign({ email: user.email, name: user.name }, JWT_SECRET, { expiresIn: "7d" });
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

const app = express();
app.use(cors());
app.use(express.json());

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
  await createUser(key, name, hash);
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
  if (!found) {
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
