import "server-only";

import { aleatorio } from "@/lib/cripto";
import { configGeral, enderecoPublico } from "@/lib/config";
import { db } from "@/lib/db";
import { temaPorId } from "@/lib/temas";
import { aplicarTrocas, preencher, valoresDoNegocio, type Troca } from "@/lib/modelos";
import { avancarEtapa, registrarEvento, type Autor } from "@/lib/negocios";

const slugDe = (nome: string) =>
  nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "previa";

export async function gerarPrevia(negocioId: string, modeloId: string, valores: Record<string, string>, autor: Autor) {
  const tema = temaPorId(modeloId);
  if (tema) {
    const m = await db.modelo.upsert({ where: { slug: tema.id }, update: {}, create: { slug: tema.id, nome: tema.nome, html: tema.html, trocas: tema.trocas } });
    modeloId = m.id;
  }
  const [n, m, geral] = await Promise.all([
    db.negocio.findUnique({ where: { id: negocioId }, select: { id: true, nome: true } }),
    db.modelo.findUnique({ where: { id: modeloId }, select: { id: true, nome: true, slug: true, ativo: true } }),
    configGeral(),
  ]);
  if (!n) throw new Error("Negócio não encontrado.");
  if (!m || !m.ativo || m.slug.startsWith("brd-tema-")) throw new Error("Modelo indisponível para novas prévias.");
  const slug = `${slugDe(n.nome)}-${aleatorio(4).toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "x"}`;
  const previa = await db.previa.create({
    data: {
      slug,
      modeloId: m.id,
      negocioId: n.id,
      valores: JSON.stringify({ ...(tema?.defaults ?? {}), ...(valores ?? {}) }),
      expiraEm: new Date(Date.now() + Math.max(1, geral.validadePreviaDias) * 86_400_000),
    },
  });
  await registrarEvento({ negocioId: n.id, ...autor, tipo: "PREVIA_GERADA", texto: `Prévia gerada com o modelo "${m.nome}"` });
  await avancarEtapa(n.id, "PREVIA_PRONTA", autor);
  return previa;
}

export async function linkDaPrevia(slug: string, req?: Request) {
  return `${await enderecoPublico(req)}/p/${slug}`;
}

/** HTML final da prévia (null se não existe; "expirada" depois do prazo). */
export async function renderizarPrevia(slug: string, contarVisita = false): Promise<string | null | "expirada"> {
  const p = await db.previa.findUnique({ where: { slug }, include: { modelo: true, negocio: true } });
  if (!p || p.status === "DESCARTADA") return null;
  if (p.expiraEm < new Date()) return "expirada";
  if (contarVisita) await db.previa.update({ where: { id: p.id }, data: { visitas: { increment: 1 }, vistaEm: new Date() } }).catch(() => null);
  let extra: Record<string, string> = {};
  try {
    extra = JSON.parse(p.valores);
  } catch {
    /* valores inválidos: só os do negócio */
  }
  let trocas: Troca[] = [];
  try {
    trocas = JSON.parse(p.modelo.trocas);
  } catch {
    /* sem trocas */
  }
  const base = valoresDoNegocio(p.negocio);
  const tema = temaPorId(p.modelo.slug);
  const valores: Record<string, string> = { ...tema?.defaults, ...base, ...(tema ? { foto_capa: base.foto } : {}), ...Object.fromEntries(Object.entries(extra).filter(([, v]) => v !== "")) };
  if (p.modelo.slug.startsWith("brd-premium-")) {
    for (const chave of ["foto", "foto_capa", "foto_1", "foto_2", "foto_3", "whatsapp_link", "maps_link"]) {
      try { const u = new URL(valores[chave] || ""); if (u.protocol !== "https:" || u.username || u.password || (chave === "whatsapp_link" && u.hostname !== "wa.me")) valores[chave] = ""; }
      catch { valores[chave] = ""; }
    }
  }
  const html = p.modelo.slug.startsWith("brd-premium-") ? p.modelo.html.replace(/<div class="topline">[\s\S]*?<\/div>(?=<section class="hero">)/, "") : p.modelo.html;
  return preencher(aplicarTrocas(html, trocas), valores);
}
