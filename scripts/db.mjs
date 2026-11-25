#!/usr/bin/env node
/**
 * Prepara o banco: escolhe SQLite ou Postgres pela DATABASE_URL, gera o
 * prisma/schema.prisma, o cliente do Prisma e aplica as tabelas (db push).
 *
 *   node scripts/db.mjs              gera + aplica (usado no build)
 *   node scripts/db.mjs --gerar      só gera o cliente (postinstall)
 *   node scripts/db.mjs --se-preciso gera/aplica só se o banco mudou (npm run dev)
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const raiz = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
process.chdir(raiz);
try { process.loadEnvFile(); } catch { /* sem .env */ }

const URL_PADRAO = "file:./dados/garimpo.db";
const url = process.env.DATABASE_URL?.trim() || URL_PADRAO;
process.env.DATABASE_URL = url;

const provedor = /^postgres(ql)?:\/\//i.test(url) ? "postgresql" : url.startsWith("file:") ? "sqlite" : null;
if (!provedor) {
  console.error(`\nDATABASE_URL não reconhecida: use "file:./dados/garimpo.db" (local) ou "postgresql://..." (Postgres/Supabase).\n`);
  process.exit(1);
}
if (provedor === "sqlite" && process.env.VERCEL) {
  console.error("\nNa Vercel o disco é apagado a cada deploy: use Postgres (Supabase, Neon). Crie a variável DATABASE_URL=postgresql://... no projeto.\n");
  process.exit(1);
}
if (provedor === "sqlite") mkdirSync(path.join(raiz, "dados"), { recursive: true });

const so = (flag) => process.argv.includes(flag);
const base = readFileSync("prisma/schema.base.prisma", "utf8");
const schema = base.replace(`provider = "__PROVEDOR__"`, `provider = "${provedor}"`);
const anterior = existsSync("prisma/schema.prisma") ? readFileSync("prisma/schema.prisma", "utf8") : "";
const marca = "dados/.banco";
const ultimo = existsSync(marca) ? readFileSync(marca, "utf8") : "";
const assinatura = `${provedor}|${hash(url)}|${schema.length}|${hash(schema)}`;
const clienteExiste = existsSync("src/generated/prisma/client.ts");

if (schema !== anterior) writeFileSync("prisma/schema.prisma", schema);

const rodar = (cmd) => execSync(cmd, { stdio: "inherit", env: process.env });

if (so("--gerar")) {
  if (schema !== anterior || !clienteExiste) rodar("npx prisma generate");
  process.exit(0);
}
if (so("--se-preciso") && ultimo === assinatura && clienteExiste) process.exit(0);

console.log(`\n▸ Banco: ${provedor === "sqlite" ? "SQLite local (dados/garimpo.db)" : "Postgres"}`);
rodar("npx prisma generate");
rodar("npx prisma db push");
mkdirSync("dados", { recursive: true });
writeFileSync(marca, assinatura);

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}
