import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgres://nura:nura_pass@localhost:5432/nura",
});

async function setup() {
  console.log("Setting up NURA database...\n");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      email TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log("✅ users table created");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS scan_history (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
      score INTEGER,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log("✅ scan_history table created");

  console.log("\nDatabase is ready!");
  await pool.end();
}

setup().catch((err) => {
  console.error("Setup failed:", err.message);
  process.exit(1);
});
