/**
 * Regras puras da conversa: reconhecer resposta automática (menu, ausência,
 * boas-vindas) e pedido explícito (parar / falar com uma pessoa).
 */

const normalizar = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function pareceAutomatica(corpo: string): boolean {
  const t = normalizar(corpo);
  const linkAgenda = /(?:https?:\/\/|www\.)\S*(?:topagenda|booksy|trinks|vagaro|agenda(?:click|pro)?|salao99|avec)\S*/i.test(corpo);
  const horario =
    /\b(?:seg(?:unda)?(?:\s*(?:a|ate|-)\s*sex(?:ta)?)?|sab(?:ado)?|dom(?:ingo)?)\b[^\n]{0,45}\b\d{1,2}(?::\d{2})?\s*(?:h|:|-|as)\s*\d{0,2}/.test(t) &&
    /(?:\n|;|\|).{0,20}\b(?:sab(?:ado)?|dom(?:ingo)?|seg(?:unda)?)\b/.test(t);
  const menu = /(?:^|\n)\s*(?:opcao\s*)?[1-9][.)\-:]?\s+.{2,}(?:\n\s*(?:opcao\s*)?[1-9][.)\-:]?\s+.{2,})+/i.test(t);
  return (
    /\b(mensagem automatica|resposta automatica|atendimento (automatico|virtual)|assistente virtual|seja (muito )?bem-vind[oa]|bem-vind[oa] (ao|a|a nossa|em)|como (posso|podemos) ajudar|agradece (o )?seu contato|obrigad[oa] por (entrar em contato|sua mensagem)|recebemos (sua|a sua) mensagem|sua mensagem (foi )?recebida|responderemos (em breve|assim que possivel)|retornaremos (em breve|assim que possivel)|logo (responderemos|retornaremos)|aguarde (um momento|nosso atendimento)|horario de (atendimento|funcionamento)|fora do horario|digite|escolha uma opcao|menu de opcoes|em breve (um|nosso) atendente|link para agendar|baixe? o app)\b/.test(t) ||
    linkAgenda ||
    horario ||
    menu
  );
}

/** Automática pelo texto, ou pela pressa: a 1ª resposta em menos de 10 s não foi digitada. */
export function respostaAutomatica(e: { texto: string; primeiraResposta: boolean; recebidaEm: Date; nossaUltimaEm: Date | null }): boolean {
  if (pareceAutomatica(e.texto)) return true;
  // Rapidez não prova que a resposta seja automática.
  return false;
}

export function pedidoExplicito(corpo: string): "humano" | "parar" | null {
  const t = normalizar(corpo);
  if (/\b(quero|preciso|posso|gostaria de)\b.{0,35}\b(falar|conversar)\b.{0,25}\b(humano|pessoa|atendente)\b|\b(atendimento humano|falar com humano)\b/.test(t)) return "humano";
  if (/\b(nao (tenho|temos) interesse|sem interesse|pare de (me )?(mandar|enviar)|nao (me )?(mande|envie)|remova meu (numero|contato)|nao quero)\b/.test(t)) return "parar";
  if (/^(?:obrigad[oa](?: mesmo)?|valeu|tchau|ate (?:logo|mais)|nao,? obrigad[oa]|dispenso|agora nao)[.!\s]*$/.test(t.trim())) return "parar";
  return null;
}

/** Meia-noite de hoje no fuso escolhido (padrão: São Paulo). */
export function inicioDoDia(agora = new Date(), fuso = process.env.TZ_NEGOCIO || "America/Sao_Paulo"): Date {
  const dia = new Intl.DateTimeFormat("en-CA", { timeZone: fuso }).format(agora);
  const off = new Intl.DateTimeFormat("en-US", { timeZone: fuso, timeZoneName: "longOffset" }).formatToParts(agora).find((p) => p.type === "timeZoneName")?.value.replace("GMT", "") || "+00:00";
  return new Date(`${dia}T00:00:00${off === "" ? "+00:00" : off}`);
}
