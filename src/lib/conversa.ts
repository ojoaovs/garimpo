import "server-only";

import { configConversa, salvarConversa, type ConfigConversa } from "@/lib/config";
import { db } from "@/lib/db";
import { checarTexto, type Violacao } from "@/lib/lista-negra";
import { avancarEtapa, registrarEvento, type Autor } from "@/lib/negocios";
import { inicioDoDia, pedidoExplicito, respostaAutomatica } from "@/lib/regras";
import { mesmoNumero, variantes } from "@/lib/telefone";
import { whatsapp, type Recebida } from "@/lib/whatsapp";

/**
 * Conversa: o único caminho de envio. Toda mensagem passa pelas travas, na
 * ordem: pausado, conversa parada, descartado, sem WhatsApp, modo teste,
 * limite diário, espaçamento entre primeiras mensagens, lista negra e conexão.
 */

export type Bloqueio =
  | "nao_encontrado"
  | "pausado"
  | "conversa_parada"
  | "descartado"
  | "sem_whatsapp"
  | "modo_teste"
  | "limite_diario"
  | "espacamento"
  | "lista_negra"
  | "sem_provedor"
  | "desconectado";

export class EnvioBloqueado extends Error {
  constructor(
    readonly motivo: Bloqueio,
    mensagem: string,
    readonly extra: { liberaEm?: string | null; violacoes?: Violacao[] } = {},
  ) {
    super(mensagem);
  }
}

export const enviosDeHoje = () => db.evento.count({ where: { tipo: "MENSAGEM_ENVIADA", porAgente: true, criadoEm: { gte: inicioDoDia() } } });

type Alvo = { whatsapp: string | null; semWhatsapp: boolean; conversaPausada: boolean; etapa: string };

async function travas(c: ConfigConversa, n: Alvo, primeira: boolean, manual: boolean): Promise<EnvioBloqueado | null> {
  if (c.pausado && !manual) return new EnvioBloqueado("pausado", "A conversa automática está pausada. Ligue em Conversas → Travas.");
  if (n.conversaPausada) return new EnvioBloqueado("conversa_parada", "A conversa com este negócio está parada (pediu para parar, pediu uma pessoa ou foi parada à mão).");
  if (n.etapa === "DESCARTADO") return new EnvioBloqueado("descartado", "Negócio descartado. Volte a etapa para conversar.");
  if (!n.whatsapp || n.semWhatsapp) return new EnvioBloqueado("sem_whatsapp", "Este negócio não tem WhatsApp.");
  if (c.somenteTeste && !mesmoNumero(n.whatsapp, c.numerosTeste)) return new EnvioBloqueado("modo_teste", "Modo teste ligado: só envia para os números de teste.");
  if (!manual && (await enviosDeHoje()) >= c.limiteDia) return new EnvioBloqueado("limite_diario", `Limite de ${c.limiteDia} envios por dia atingido.`);
  if (primeira && !manual && c.proximoEnvioEm && new Date(c.proximoEnvioEm) > new Date()) {
    return new EnvioBloqueado("espacamento", "Espaçamento entre primeiras mensagens: aguarde.", { liberaEm: c.proximoEnvioEm });
  }
  return null;
}

export type SituacaoEnvio = { pode: boolean; primeira: boolean; motivo?: Bloqueio; mensagem?: string; liberaEm?: string | null };

export async function situacaoEnvio(negocioId: string): Promise<SituacaoEnvio> {
  const [c, n] = await Promise.all([configConversa(), carregar(negocioId)]);
  if (!n) return { pode: false, primeira: false, motivo: "nao_encontrado", mensagem: "Negócio não encontrado." };
  const primeira = n._count.eventos === 0;
  const b = await travas(c, n, primeira, false);
  return b ? { pode: false, primeira, motivo: b.motivo, mensagem: b.message, liberaEm: b.extra.liberaEm ?? null } : { pode: true, primeira };
}

const carregar = (id: string) =>
  db.negocio.findUnique({
    where: { id },
    select: { id: true, whatsapp: true, whatsappJid: true, semWhatsapp: true, conversaPausada: true, etapa: true, _count: { select: { eventos: { where: { tipo: "MENSAGEM_ENVIADA" } } } } },
  });

/**
 * Envia. `manual` = uma pessoa no painel apertou enviar: ignora pausa, limite
 * diário e espaçamento (as travas de robô), mas nunca a lista negra, o modo
 * teste nem o pedido de parar.
 */
export async function enviarMensagem(negocioId: string, texto: string, autor: Autor, opcoes: { manual?: boolean; ignorarListaNegra?: boolean } = {}) {
  const manual = !!opcoes.manual;
  const [c, n] = await Promise.all([configConversa(), carregar(negocioId)]);
  if (!n) throw new EnvioBloqueado("nao_encontrado", "Negócio não encontrado.");
  const primeira = n._count.eventos === 0;
  const b = await travas(c, n, primeira, manual);
  if (b) throw b;

  if (!opcoes.ignorarListaNegra) {
    const lista = await checarTexto(texto);
    if (!lista.ok) {
      throw new EnvioBloqueado("lista_negra", `O texto tem ${lista.violacoes.length === 1 ? "um termo" : `${lista.violacoes.length} termos`} da lista negra: ${lista.violacoes.map((v) => `"${v.trecho}"`).join(", ")}.`, { violacoes: lista.violacoes });
    }
  }

  const cliente = await whatsapp();
  if (!cliente) throw new EnvioBloqueado("sem_provedor", "Nenhum WhatsApp ligado. Escolha um em Conexões.");
  if ((await cliente.situacao()).estado !== "conectado") throw new EnvioBloqueado("desconectado", "O WhatsApp não está conectado.");

  let destino = n.whatsappJid;
  if (!destino) {
    destino = await cliente.verificar(n.whatsapp!);
    if (!destino) {
      await db.negocio.update({ where: { id: n.id }, data: { semWhatsapp: true } });
      throw new EnvioBloqueado("sem_whatsapp", "Este número não tem WhatsApp.");
    }
    await db.negocio.update({ where: { id: n.id }, data: { whatsappJid: destino } });
  }

  // Reserva a vaga da primeira mensagem antes de enviar.
  if (primeira && !manual) {
    const min = Math.max(30, c.intervaloMinSeg);
    const max = Math.max(min, c.intervaloMaxSeg);
    await salvarConversa({ proximoEnvioEm: new Date(Date.now() + (min + Math.random() * (max - min)) * 1000).toISOString() });
  }

  const r = await cliente.enviar(destino, texto, { primeira });
  const evento = await db.$transaction(async (tx) => {
    const e = await registrarEvento({ negocioId: n.id, ...autor, tipo: "MENSAGEM_ENVIADA", texto, externoId: r.id, porAgente: !manual, criadoEm: r.em }, tx);
    await tx.negocio.updateMany({ where: { id: n.id, contatadoEm: null }, data: { contatadoEm: new Date() } });
    await avancarEtapa(n.id, "CONTATADO", autor, tx);
    return e;
  });
  return { eventoId: evento.id, externoId: r.id, enviadaEm: evento.criadoEm, primeira };
}

/** Grava a mensagem que chegou no negócio certo e move a etapa. */
export async function receberMensagem(m: Recebida): Promise<"gravada" | "repetida" | "sem_negocio"> {
  if (await db.evento.findUnique({ where: { externoId: m.id }, select: { id: true } })) return "repetida";
  const vs = variantes(m.telefone ?? m.destino.split("@")[0]);
  const n = await db.negocio.findFirst({
    where: { OR: [{ whatsappJid: m.destino }, ...(vs.length ? [{ whatsapp: { in: vs } }] : [])] },
    orderBy: { criadoEm: "asc" },
    select: { id: true, whatsappJid: true },
  });
  if (!n) return "sem_negocio";
  const quando = Number.isFinite(m.em.getTime()) && m.em.getTime() <= Date.now() ? m.em : new Date();
  const jid = n.whatsappJid ? {} : { whatsappJid: m.destino };

  if (m.deMim) {
    await db.$transaction(async (tx) => {
      await registrarEvento({ negocioId: n.id, agente: "VOCE", tipo: "MENSAGEM_ENVIADA", texto: m.texto, externoId: m.id, criadoEm: quando }, tx);
      if (!n.whatsappJid) await tx.negocio.update({ where: { id: n.id }, data: jid });
      await tx.negocio.updateMany({ where: { id: n.id, contatadoEm: null }, data: { contatadoEm: quando } });
      await avancarEtapa(n.id, "CONTATADO", { agente: "CONVERSA" }, tx);
    });
    return "gravada";
  }

  const [anteriores, nossa] = await Promise.all([
    db.evento.count({ where: { negocioId: n.id, tipo: "RESPOSTA_RECEBIDA" } }),
    db.evento.findFirst({ where: { negocioId: n.id, tipo: "MENSAGEM_ENVIADA" }, orderBy: { criadoEm: "desc" }, select: { criadoEm: true } }),
  ]);
  const automatica = respostaAutomatica({ texto: m.texto, primeiraResposta: anteriores === 0, recebidaEm: quando, nossaUltimaEm: nossa?.criadoEm ?? null });
  const pedido = pedidoExplicito(m.texto);

  await db.$transaction(async (tx) => {
    await registrarEvento({ negocioId: n.id, agente: "CONVERSA", tipo: "RESPOSTA_RECEBIDA", texto: m.texto, externoId: m.id, automatica, criadoEm: quando }, tx);
    await tx.negocio.update({
      where: { id: n.id },
      data: { ...jid, ...(automatica ? { respostaAutomatica: true } : {}), ...(pedido ? { conversaPausada: true } : {}) },
    });
    if (!automatica) await avancarEtapa(n.id, "RESPONDEU", { agente: "CONVERSA" }, tx);
    if (pedido) {
      await registrarEvento({ negocioId: n.id, agente: "CONVERSA", tipo: "NOTA", texto: pedido === "parar" ? "Pediu para não receber mais mensagens. Conversa parada." : "Pediu para falar com uma pessoa. Conversa parada." }, tx);
    }
  });
  return "gravada";
}
