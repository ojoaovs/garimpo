import "server-only";

import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { db } from "@/lib/db";

export type Referencia = { nome: string; conteudo: string };

/** Lê o frontmatter (name, description) de um SKILL.md. */
export function lerFrontmatter(md: string): { nome: string | null; descricao: string | null } {
  const m = md.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!m) return { nome: null, descricao: null };
  const campo = (k: string) => {
    const l = m[1].match(new RegExp(`^${k}:\\s*(.*)$`, "m"))?.[1]?.trim() ?? null;
    return l ? l.replace(/^["']|["']$/g, "") : null;
  };
  return { nome: campo("name"), descricao: campo("description") };
}

export const slugSkill = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

export async function salvarSkill(s: { slug: string; conteudo: string; referencias?: Referencia[]; origem: string; fonte?: string | null; nome?: string; descricao?: string }) {
  const fm = lerFrontmatter(s.conteudo);
  const slug = slugSkill(s.slug || fm.nome || "skill");
  const dados = {
    nome: s.nome || fm.nome || slug,
    descricao: s.descricao || fm.descricao || "",
    conteudo: s.conteudo,
    referencias: JSON.stringify(s.referencias ?? []),
    origem: s.origem,
    fonte: s.fonte ?? null,
  };
  return db.skill.upsert({ where: { slug }, update: dados, create: { slug, ...dados } });
}

const PASTA = path.join(process.cwd(), "skills");
const TEXTO = /\.(md|txt|json|ya?ml|csv)$/i;

/** Carrega a pasta skills/ do projeto (cada subpasta com um SKILL.md). Não sobrescreve skill editada no painel. */
export async function sincronizarPasta(): Promise<number> {
  if (!existsSync(PASTA)) return 0;
  let total = 0;
  for (const d of await readdir(PASTA, { withFileTypes: true })) {
    if (!d.isDirectory()) continue;
    const dir = path.join(PASTA, d.name);
    const principal = path.join(dir, "SKILL.md");
    if (!existsSync(principal)) continue;
    const existente = await db.skill.findUnique({ where: { slug: slugSkill(d.name) }, select: { origem: true } });
    if (existente && existente.origem !== "pasta") continue;
    const referencias: Referencia[] = [];
    for (const f of await readdir(dir, { recursive: true })) {
      const nome = String(f);
      if (nome === "SKILL.md" || !TEXTO.test(nome)) continue;
      referencias.push({ nome, conteudo: (await readFile(path.join(dir, nome), "utf8")).slice(0, 200_000) });
    }
    await salvarSkill({ slug: d.name, conteudo: await readFile(principal, "utf8"), referencias, origem: "pasta", fonte: `skills/${d.name}` });
    total++;
  }
  return total;
}

/**
 * Importa todas as skills de um repositório do GitHub (cada pasta com SKILL.md).
 * Aceita github.com/dono/repo, .../tree/branch/pasta. Token só para repositório privado.
 */
export async function importarGithub(endereco: string, token?: string): Promise<{ importadas: string[] }> {
  const m = endereco.trim().match(/github\.com\/([^/\s]+)\/([^/\s#?]+?)(?:\.git)?(?:\/tree\/([^/\s]+)(\/[^\s#?]*)?)?\/?$/i);
  if (!m) throw new Error("Endereço inválido. Use https://github.com/dono/repositorio");
  const [, dono, repo, ramoUrl, subpasta] = m;
  const h: Record<string, string> = { accept: "application/vnd.github+json", "user-agent": "garimpo" };
  if (token) h.authorization = `Bearer ${token}`;
  const api = `https://api.github.com/repos/${dono}/${repo}`;
  const info = await fetch(api, { headers: h });
  if (!info.ok) throw new Error(info.status === 404 ? "Repositório não encontrado (se for privado, informe um token)." : `GitHub respondeu ${info.status}.`);
  const ramo = ramoUrl || ((await info.json()) as { default_branch: string }).default_branch;
  const arv = await fetch(`${api}/git/trees/${encodeURIComponent(ramo)}?recursive=1`, { headers: h });
  if (!arv.ok) throw new Error(`Não consegui ler os arquivos (${arv.status}).`);
  const arquivos = ((await arv.json()) as { tree: { path: string; type: string; size?: number }[] }).tree.filter((t) => t.type === "blob");
  const prefixo = subpasta ? subpasta.replace(/^\/|\/$/g, "") + "/" : "";
  const skills = arquivos.filter((a) => a.path.startsWith(prefixo) && /(^|\/)SKILL\.md$/.test(a.path)).slice(0, 60);
  if (!skills.length) throw new Error("Nenhum SKILL.md encontrado nesse repositório.");

  const cru = async (p: string) => {
    const r = await fetch(`https://raw.githubusercontent.com/${dono}/${repo}/${encodeURIComponent(ramo)}/${p.split("/").map(encodeURIComponent).join("/")}`, { headers: token ? { authorization: `Bearer ${token}` } : {} });
    if (!r.ok) throw new Error(`Falhou ao baixar ${p} (${r.status}).`);
    return r.text();
  };
  const importadas: string[] = [];
  for (const s of skills) {
    const dir = s.path.includes("/") ? s.path.slice(0, s.path.lastIndexOf("/")) : "";
    const nomePasta = dir.split("/").pop() || repo;
    const refs = arquivos.filter((a) => dir && a.path.startsWith(`${dir}/`) && a.path !== s.path && TEXTO.test(a.path) && (a.size ?? 0) < 200_000).slice(0, 20);
    const referencias: Referencia[] = [];
    for (const r of refs) referencias.push({ nome: r.path.slice(dir.length + 1), conteudo: await cru(r.path) });
    const salva = await salvarSkill({ slug: nomePasta, conteudo: await cru(s.path), referencias, origem: "github", fonte: `https://github.com/${dono}/${repo}/tree/${ramo}/${dir}` });
    importadas.push(salva.slug);
  }
  return { importadas };
}

export const REPO_PADRAO = "";
