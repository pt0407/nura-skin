import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import readline from "node:readline";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

async function main() {
  console.log("\n🌐 NURA Remote Database Setup (Neon Postgres)\n");

  if (!process.env.NEON_API_KEY) {
    console.log("You need a Neon API key to create a remote database.\n");
    console.log("1. Go to https://neon.tech and sign up / log in");
    console.log("2. Open your profile → API Keys → Generate new key");
    console.log("3. Copy the key and paste it below.\n");
    const key = await ask("Neon API Key: ");
    if (!key.trim()) {
      console.log("No key provided. Exiting.");
      rl.close();
      return;
    }
    process.env.NEON_API_KEY = key.trim();
  }

  const projectName = "nura-skin";
  console.log(`\nCreating Neon project: ${projectName}...\n`);

  try {
    execSync(`npx neonctl projects create --name ${projectName} --set-context`, {
      stdio: "inherit",
      env: process.env,
    });
  } catch (e) {
    console.log("\n⚠️  Project may already exist. Continuing...\n");
  }

  console.log("Fetching connection string...\n");
  let connectionString;
  try {
    connectionString = execSync(
      `npx neonctl connection-string --database-name neondb --role-name neondb_owner --pooled`,
      { encoding: "utf-8", env: process.env }
    ).trim();
  } catch (e) {
    console.error("Failed to get connection string. Make sure the project exists.");
    rl.close();
    return;
  }

  console.log("✅ Got connection string.\n");

  const envContent = `VITE_API_URL=\nDATABASE_URL=${connectionString}\nJWT_SECRET=${cryptoRandom()}\n`;

  writeFileSync(".env.production", envContent);
  console.log("📝 Wrote .env.production\n");

  console.log("Next steps:");
  console.log("  1. Add these env vars to your Vercel project dashboard:");
  console.log("     DATABASE_URL  →  (already in .env.production)");
  console.log("     JWT_SECRET    →  (already in .env.production)");
  console.log("  2. Or run:  vercel env add DATABASE_URL");
  console.log("  3. Then deploy:  vercel --prod\n");

  rl.close();
}

function cryptoRandom() {
  return randomBytes(32).toString("hex");
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
