import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";

import { aleatorio, sha256 } from "@/lib/cripto";
import { db } from "@/lib/db";
import { usuarioAtual } from "@/lib/sessao";

/**
 * API para agentes (/api/v1). Autenticação: Authorization: Bearer gar_…
 * (ou a sessão do painel, para testar no navegador). Respostas sempre
 * { ok: true, ...dados } ou { ok: false, erro, mensagem }.
 */

export type Quem = { tipo: "chave"; chaveId: string; nome: string } | { tipo: "painel"; nome: string };

export const ok = (dados: Record<string, unknown> = {}, status = 200) => NextResponse.json({ ok: true, ...dados }, { status });
export const erro = (status: number, codigo: string, mensagem: string, extra: Record<string, unknown> = {}) =>
  NextResponse.json({ ok: false, erro: codigo, mensagem, ...extra }, { status });

export async function novaChave(nome: string) {
  const segredo = `gar_${aleatorio(24).replace(/[^A-Za-z0-9]/g, "")}`;
  const c = await db.chaveApi.create({ data: { nome: nome.slice(0, 60), prefixo: segredo.slice(0, 10), hash: sha256(segredo) } });
  return { id: c.id, nome: c.nome, chave: segredo };
}

async function identificar(req: Request): Promise<Quem | null> {
  const h = req.headers.get("authorization") ?? "";
  const m = h.match(/^Bearer\s+(gar_[A-Za-z0-9]+)$/);
  if (m) {
    const c = await db.chaveApi.findUnique({ where: { hash: sha256(m[1]) } });
    if (!c || !c.ativa) return null;
    void db.chaveApi.update({ where: { id: c.id }, data: { ultimoUsoEm: new Date() } }).catch(() => null);
    return { tipo: "chave", chaveId: c.id, nome: c.nome };
  }
  const u = await usuarioAtual();
  return u ? { tipo: "painel", nome: u.nome } : null;
}

/** Autor dos eventos: a chave aparece com o nome dela (ex.: "Claude Code"). */
export const autorDe = (q: Quem) => (q.tipo === "chave" ? { agente: "AGENTE", agenteNome: q.nome } : { agente: "VOCE", agenteNome: q.nome });

type Ctx<P> = { params: Promise<P> };

export function rota<P = Record<string, string>>(fn: (req: Request, quem: Quem, params: P) => Promise<Response>) {
  return async (req: Request, ctx: Ctx<P>) => {
    const quem = await identificar(req);
    if (!quem) return erro(401, "nao_autorizado", "Mande Authorization: Bearer gar_… (crie a chave no painel em API).", {});
    try {
      return await fn(req, quem, await ctx.params);
    } catch (e) {
      if (e instanceof ErroApi) return erro(e.status, e.codigo, e.message, e.extra);
      if (e instanceof z.ZodError) return erro(400, "parametros_invalidos", "Parâmetros inválidos.", { problemas: e.issues.map((i) => ({ campo: i.path.join("."), mensagem: i.message })) });
      console.error("[api] Falha interna.");
      return erro(500, "erro_interno", "Erro interno.");
    }
  };
}

export class ErroApi extends Error {
  constructor(
    readonly status: number,
    readonly codigo: string,
    mensagem: string,
    readonly extra: Record<string, unknown> = {},
  ) {
    super(mensagem);
  }
}

export async function corpo<T>(req: Request, schema: z.ZodType<T>): Promise<T> {
  let dado: unknown;
  try {
    dado = await req.json();
  } catch {
    throw new ErroApi(400, "json_invalido", "O corpo precisa ser JSON.");
  }
  return schema.parse(dado);
}
