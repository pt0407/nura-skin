import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "users.json");
const JWT_SECRET = process.env.JWT_SECRET || "nura_dev_secret_change_me";
const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(express.json());

async function readDb() {
  if (!existsSync(DB_PATH)) return {};
  const raw = await readFile(DB_PATH, "utf-8");
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeDb(data) {
  await writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

function signToken(user) {
  return jwt.sign({ email: user.email, name: user.name }, JWT_SECRET, {
    expiresIn: "7d",
  });
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

app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }
  const db = await readDb();
  const key = email.toLowerCase();
  if (db[key]) {
    return res.status(409).json({ error: "Account already exists" });
  }
  const hash = await bcrypt.hash(password, 10);
  db[key] = { name, email: key, passwordHash: hash };
  await writeDb(db);
  const token = signToken({ email: key, name });
  res.json({ token, user: { email: key, name } });
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }
  const db = await readDb();
  const key = email.toLowerCase();
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

app.listen(PORT, () => {
  console.log(`NURA server running on http://localhost:${PORT}`);
});
