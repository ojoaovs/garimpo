import { z } from "zod";

import { corpo, ok, rota } from "@/lib/api";
import { db } from "@/lib/db";
import { temas } from "@/lib/temas";
import { marcacoes } from "@/lib/modelos";

export const dynamic = "force-dynamic";

export const GET = rota(async () => {
  const ms = await db.modelo.findMany({ where: { NOT: [{ slug: { startsWith: "brd-tema-" } }, { slug: { startsWith: "brd-premium-" } }] }, orderBy: { atualizadoEm: "desc" }, include: { _count: { select: { previas: true } } } });
  return ok({ modelos: [...temas.map(t => ({ id: t.id, nome: t.nome, slug: t.id, ativo: true, variaveis: marcacoes(t.html), previas: 0, atualizadoEm: null })), ...ms.map((m) => ({ id: m.id, nome: m.nome, slug: m.slug, ativo: m.ativo, variaveis: [...new Set([...marcacoes(m.html), ...JSON.parse(m.trocas).map((t: { para: string }) => t.para)])], previas: m._count.previas, atualizadoEm: m.atualizadoEm }))] });
});

const troca = z.object({ de: z.string().min(1).max(500), para: z.string().regex(/^[a-zA-Z_]\w*$/) });

export const POST = rota(async (req) => {
  const d = await corpo(req, z.object({ nome: z.string().trim().min(2).max(100), html: z.string().min(20).max(2_000_000), trocas: z.array(troca).max(100).default([]) }));
  const base = d.nome.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50) || "modelo";
  const slug = (await db.modelo.findUnique({ where: { slug: base } })) ? `${base}-${Date.now().toString(36).slice(-4)}` : base;
  const m = await db.modelo.create({ data: { nome: d.nome, slug, html: d.html, trocas: JSON.stringify(d.trocas) } });
  return ok({ modelo: { id: m.id, nome: m.nome, slug: m.slug } }, 201);
});
