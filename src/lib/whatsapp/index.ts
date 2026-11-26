import "server-only";

import { ativo, type Valores } from "@/lib/config";
import { cloudflareHeaders } from "@/lib/cloudflare-access";
import { variantes } from "@/lib/telefone";

/**
 * Uma interface para todos os provedores de WhatsApp. O resto do sistema só
 * chama `whatsapp()` e não sabe se do outro lado está Baileys, Evolution,
 * a API da Meta ou a Z-API.
 */

export type Estado = "sem_configuracao" | "fora_do_ar" | "desconectado" | "aguardando_qr" | "reconectando" | "conectado";
export type Situacao = { provedor: string | null; estado: Estado; qr: string | null; numero: string | null; detalhe?: string };

export type ClienteWhatsapp = {
  id: string;
  situacao(): Promise<Situacao>;
  /** Pede o QR (Baileys, Evolution, Z-API). */
  conectar?(): Promise<Situacao>;
  desconectar?(): Promise<Situacao>;
  /** Destino aceito pelo WhatsApp (JID ou número); null = o número não tem WhatsApp. */
  verificar(numero: string): Promise<string | null>;
  enviar(destino: string, texto: string, opcoes: { primeira: boolean }): Promise<{ id: string; em: Date }>;
};

export class WhatsappIndisponivel extends Error {}

async function http<T>(url: string, init: RequestInit & { timeoutMs?: number } = {}): Promise<T> {
  let r: Response;
  try {
    r = await fetch(url, { ...init, redirect: "error", signal: AbortSignal.timeout(init.timeoutMs ?? 20_000), cache: "no-store" });
  } catch (e) {
    throw new WhatsappIndisponivel(`Sem resposta de ${new URL(url).host}: ${e instanceof Error ? e.message : e}`);
  }
  const texto = await r.text();
  if (r.status === 409) throw new WhatsappIndisponivel("WhatsApp desconectado");
  if (!r.ok) throw new Error(`${new URL(url).host} respondeu ${r.status}: ${texto.slice(0, 240)}`);
  return (texto ? JSON.parse(texto) : {}) as T;
}

const sem = (base: string) => base.replace(/\/+$/, "");
const fora = (p: string, detalhe: string): Situacao => ({ provedor: p, estado: "fora_do_ar", qr: null, numero: null, detalhe });

// ------------------------------------------------------------------ Baileys

function baileys(v: Valores): ClienteWhatsapp {
  const base = sem(String(v.url || "http://127.0.0.1:4320"));
  const h = { ...cloudflareHeaders(base, "zap.bradesign.online"), "content-type": "application/json", "x-whatsapp-token": String(v.token || "") };
  const situ = (s: { estado: Estado; qr: string | null; numero: string | null }): Situacao => ({ provedor: "baileys", ...s });
  return {
    id: "baileys",
    async situacao() {
      try {
        return situ(await http(`${base}/estado`, { headers: h, timeoutMs: 4000 }));
      } catch (e) {
        return fora("baileys", `O serviço servicos/whatsapp não respondeu em ${base}. Rode "npm run tudo" ou "npm start" dentro de servicos/whatsapp. (${e instanceof Error ? e.message : e})`);
      }
    },
    conectar: async () => situ(await http(`${base}/conectar`, { method: "POST", headers: h, body: "{}" })),
    desconectar: async () => situ(await http(`${base}/desconectar`, { method: "POST", headers: h, body: "{}" })),
    async verificar(numero) {
      const r = await http<{ achado: { jid: string } | null }>(`${base}/verificar`, { method: "POST", headers: h, body: JSON.stringify({ telefone: numero }), timeoutMs: 30_000 });
      return r.achado?.jid ?? null;
    },
    async enviar(destino, texto) {
      const r = await http<{ id: string; em: string }>(`${base}/enviar`, { method: "POST", headers: h, body: JSON.stringify({ jid: destino, texto }), timeoutMs: 45_000 });
      return { id: r.id, em: new Date(r.em) };
    },
  };
}

// ------------------------------------------------------------------ Evolution API (v2)

function evolution(v: Valores): ClienteWhatsapp {
  const base = sem(String(v.url || ""));
  const inst = encodeURIComponent(String(v.instancia || ""));
  const h = { "content-type": "application/json", apikey: String(v.apiKey || "") };
  return {
    id: "evolution",
    async situacao() {
      try {
        const r = await http<{ instance?: { state?: string } }>(`${base}/instance/connectionState/${inst}`, { headers: h, timeoutMs: 6000 });
        const s = r.instance?.state;
        return { provedor: "evolution", estado: s === "open" ? "conectado" : s === "connecting" ? "aguardando_qr" : "desconectado", qr: null, numero: null };
      } catch (e) {
        return fora("evolution", e instanceof Error ? e.message : String(e));
      }
    },
    async conectar() {
      const r = await http<{ base64?: string }>(`${base}/instance/connect/${inst}`, { headers: h });
      return { provedor: "evolution", estado: r.base64 ? "aguardando_qr" : "conectado", qr: r.base64 ?? null, numero: null };
    },
    async desconectar() {
      await http(`${base}/instance/logout/${inst}`, { method: "DELETE", headers: h }).catch(() => null);
      return { provedor: "evolution", estado: "desconectado", qr: null, numero: null };
    },
    async verificar(numero) {
      for (const n of variantes(numero)) {
        const r = await http<{ exists: boolean; jid: string }[]>(`${base}/chat/whatsappNumbers/${inst}`, { method: "POST", headers: h, body: JSON.stringify({ numbers: [n] }) });
        const achado = r.find((x) => x.exists);
        if (achado) return achado.jid;
      }
      return null;
    },
    async enviar(destino, texto) {
      const r = await http<{ key?: { id?: string } }>(`${base}/message/sendText/${inst}`, {
        method: "POST",
        headers: h,
        body: JSON.stringify({ number: destino.split("@")[0], text: texto, delay: Math.min(8000, 1500 + texto.length * 35) }),
        timeoutMs: 45_000,
      });
      if (!r.key?.id) throw new Error("A Evolution não devolveu o id da mensagem");
      return { id: r.key.id, em: new Date() };
    },
  };
}

// ------------------------------------------------------------------ Meta (Cloud API)

const GRAPH = "https://graph.facebook.com/v21.0";

function meta(v: Valores): ClienteWhatsapp {
  const h = { "content-type": "application/json", authorization: `Bearer ${v.token}` };
  const pid = String(v.phoneNumberId || "");
  return {
    id: "meta",
    async situacao() {
      try {
        const r = await http<{ display_phone_number?: string }>(`${GRAPH}/${pid}?fields=display_phone_number`, { headers: h, timeoutMs: 8000 });
        return { provedor: "meta", estado: "conectado", qr: null, numero: r.display_phone_number ?? null };
      } catch (e) {
        return fora("meta", e instanceof Error ? e.message : String(e));
      }
    },
    // A Cloud API não diz antes se o número tem WhatsApp: o erro aparece no envio.
    verificar: async (numero) => variantes(numero)[0] ?? null,
    async enviar(destino, texto, { primeira }) {
      const template = String(v.template || "");
      const corpo =
        primeira && template
          ? { messaging_product: "whatsapp", to: destino, type: "template", template: { name: template, language: { code: "pt_BR" }, components: [{ type: "body", parameters: [{ type: "text", text: texto }] }] } }
          : { messaging_product: "whatsapp", to: destino, type: "text", text: { body: texto, preview_url: true } };
      const r = await http<{ messages?: { id: string }[] }>(`${GRAPH}/${pid}/messages`, { method: "POST", headers: h, body: JSON.stringify(corpo) });
      const id = r.messages?.[0]?.id;
      if (!id) throw new Error("A Meta não devolveu o id da mensagem");
      return { id, em: new Date() };
    },
  };
}

// ------------------------------------------------------------------ Z-API

function zapi(v: Valores): ClienteWhatsapp {
  const base = `https://api.z-api.io/instances/${encodeURIComponent(String(v.instancia || ""))}/token/${encodeURIComponent(String(v.token || ""))}`;
  const h: Record<string, string> = { "content-type": "application/json" };
  if (v.clientToken) h["Client-Token"] = String(v.clientToken);
  return {
    id: "zapi",
    async situacao() {
      try {
        const r = await http<{ connected?: boolean }>(`${base}/status`, { headers: h, timeoutMs: 6000 });
        return { provedor: "zapi", estado: r.connected ? "conectado" : "desconectado", qr: null, numero: null };
      } catch (e) {
        return fora("zapi", e instanceof Error ? e.message : String(e));
      }
    },
    async conectar() {
      const r = await http<{ value?: string; connected?: boolean }>(`${base}/qr-code/image`, { headers: h });
      if (r.connected) return { provedor: "zapi", estado: "conectado", qr: null, numero: null };
      const qr = r.value ? (r.value.startsWith("data:") ? r.value : `data:image/png;base64,${r.value}`) : null;
      return { provedor: "zapi", estado: "aguardando_qr", qr, numero: null };
    },
    async desconectar() {
      await http(`${base}/disconnect`, { headers: h }).catch(() => null);
      return { provedor: "zapi", estado: "desconectado", qr: null, numero: null };
    },
    async verificar(numero) {
      for (const n of variantes(numero)) {
        const r = await http<{ exists?: boolean }>(`${base}/phone-exists/${n}`, { headers: h });
        if (r.exists) return n;
      }
      return null;
    },
    async enviar(destino, texto) {
      const r = await http<{ messageId?: string; id?: string; zaapId?: string }>(`${base}/send-text`, {
        method: "POST",
        headers: h,
        body: JSON.stringify({ phone: destino, message: texto, delayTyping: Math.min(15, Math.ceil(texto.length / 30)) }),
        timeoutMs: 45_000,
      });
      const id = r.messageId ?? r.id ?? r.zaapId;
      if (!id) throw new Error("A Z-API não devolveu o id da mensagem");
      return { id, em: new Date() };
    },
  };
}

const FABRICAS: Record<string, (v: Valores) => ClienteWhatsapp> = { baileys, evolution, meta, zapi };

export function clienteDe(provedor: string, v: Valores): ClienteWhatsapp {
  const f = FABRICAS[provedor];
  if (!f) throw new Error(`Provedor de WhatsApp desconhecido: ${provedor}`);
  return f(v);
}

/** O cliente do provedor ligado em Conexões; null se nenhum está ligado. */
export async function whatsapp(): Promise<ClienteWhatsapp | null> {
  const a = await ativo("whatsapp");
  if (!a) return null;
  return FABRICAS[a.id]?.(a.valores) ?? null;
}

export async function situacaoWhatsapp(): Promise<Situacao> {
  const c = await whatsapp();
  if (!c) return { provedor: null, estado: "sem_configuracao", qr: null, numero: null };
  return c.situacao();
}

/** Mensagem que chegou, já no formato comum. */
export type Recebida = {
  id: string;
  /** JID ou número do outro lado. */
  destino: string;
  telefone: string | null;
  deMim: boolean;
  texto: string;
  em: Date;
};
