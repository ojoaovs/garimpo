import "server-only";

import { ativo } from "@/lib/config";
import { cloudflareHeaders } from "@/lib/cloudflare-access";

/** Lugar como o Rastro devolve. */
export type Lugar = {
  placeId: string | null;
  nome: string;
  endereco: string | null;
  nota: number | null;
  totalAvaliacoes: number | null;
  site: string | null;
  telefone: string | null;
  linkMaps: string | null;
  categoria: string | null;
};

export class RastroErro extends Error {
  constructor(
    readonly motivo: string,
    mensagem: string,
    readonly status = 502,
  ) {
    super(mensagem);
  }
}

const EXPLICA: Record<string, string> = {
  captcha: "O Google pediu verificação humana. Abra a janela do Chromium do Rastro e resolva o captcha.",
  acao_manual: "O Google Maps pediu uma ação manual na janela do Rastro.",
  limite_por_hora: "Limite de buscas por hora do Rastro atingido. Espere um pouco.",
  timeout: "A busca demorou demais. Tente de novo.",
  nao_autorizado: "Token do Rastro errado. Confira em Conexões → Rastro.",
};

async function chamar(caminho: string, corpo: unknown): Promise<Lugar[]> {
  const cfg = await ativo("rastro");
  const base = String(cfg?.valores.url || process.env.RASTRO_URL || "").replace(/\/+$/, "");
  const token = String(cfg?.valores.token || process.env.RASTRO_TOKEN || "");
  if (!base) throw new RastroErro("sem_configuracao", "O Rastro não está configurado. Ligue em Conexões → Rastro.", 503);
  let r: Response;
  try {
    r = await fetch(`${base}${caminho}`, {
      method: "POST",
      headers: { ...cloudflareHeaders(base, "rastro.bradesign.online"), "content-type": "application/json", "x-rastro-token": token },
      redirect: "error",
      body: JSON.stringify(corpo),
      signal: AbortSignal.timeout(150_000),
      cache: "no-store",
    });
  } catch {
    throw new RastroErro("fora_do_ar", `O Rastro não respondeu em ${base}. Ele está rodando? (npm run tudo, ou npm start em servicos/rastro)`, 503);
  }
  const dados = (await r.json().catch(() => ({}))) as { lugares?: Lugar[]; motivo?: string; detalhe?: string };
  if (!r.ok) {
    const motivo = dados.motivo ?? `http_${r.status}`;
    throw new RastroErro(motivo, EXPLICA[motivo] ?? dados.detalhe ?? `O Rastro respondeu ${r.status}.`, r.status === 429 ? 429 : 502);
  }
  return dados.lugares ?? [];
}

/** Um negócio pelo nome (ex.: "Barbearia do Zé", "Campinas"). */
export const buscarPorNome = (nome: string, cidade: string) => chamar("/buscar", { nome, cidade });

/** Vários negócios de um tipo numa cidade, pulando os que já estão na esteira. */
export const buscarPorTipo = (tipo: string, cidade: string, limite: number, excluir: string[] = []) =>
  chamar("/vizinhos", { tipo, cidade, limite, excluir: excluir.slice(0, 20) });

export async function testarRastro(url: string, token: string) {
  try {
    const headers = cloudflareHeaders(url, "rastro.bradesign.online");
    const saude = await fetch(`${url.replace(/\/+$/, "")}/saude`, { headers, redirect: "error", signal: AbortSignal.timeout(4000) });
    if (!saude.ok) return { ok: false, mensagem: `Respondeu ${saude.status}.` };
    const auth = await fetch(`${url.replace(/\/+$/, "")}/nada`, { method: "POST", headers: { ...headers, "x-rastro-token": token }, redirect: "error", signal: AbortSignal.timeout(4000) });
    if (auth.status === 401 || auth.status === 403) return { ok: false, mensagem: "Está no ar, mas o token não confere." };
    if (auth.status !== 404) return { ok: false, mensagem: `Resposta inesperada do Rastro (${auth.status}).` };
    return { ok: true, mensagem: "Rastro no ar e token certo." };
  } catch {
    return { ok: false, mensagem: `Nada respondendo em ${url}.` };
  }
}
