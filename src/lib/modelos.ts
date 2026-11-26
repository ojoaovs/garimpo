/**
 * Modelos de prévia: qualquer página HTML vira modelo.
 *
 * 1. A pessoa importa o .html (ou cola o código).
 * 2. O sistema acha os textos que parecem nome, telefone, endereço, título...
 *    e sugere trocar cada um por uma variável.
 * 3. Ela confirma as trocas (ou escreve {{nome}} direto no HTML).
 * 4. Para cada negócio, a prévia sai com os dados dele.
 *
 * Sem "server-only": a tela de importação usa as mesmas funções.
 */

export const VARIAVEIS = [
  { id: "nome", rotulo: "Nome do negócio", exemplo: "Barbearia do Zé" },
  { id: "cidade", rotulo: "Cidade", exemplo: "Campinas" },
  { id: "categoria", rotulo: "Categoria", exemplo: "Barbearia" },
  { id: "endereco", rotulo: "Endereço", exemplo: "Rua das Flores, 120 - Centro" },
  { id: "telefone", rotulo: "Telefone legível", exemplo: "(19) 99876-5432" },
  { id: "whatsapp_link", rotulo: "Link do WhatsApp", exemplo: "https://wa.me/5519998765432" },
  { id: "nota", rotulo: "Nota no Google", exemplo: "4,9" },
  { id: "avaliacoes", rotulo: "Nº de avaliações", exemplo: "312" },
  { id: "maps_link", rotulo: "Link do Google Maps", exemplo: "https://maps.google.com/?cid=..." },
  { id: "site", rotulo: "Site atual", exemplo: "https://..." },
  { id: "instagram", rotulo: "Instagram", exemplo: "@barbeariadoze" },
  { id: "foto", rotulo: "Foto (URL)", exemplo: "https://..." },
  { id: "iniciais", rotulo: "Iniciais", exemplo: "BZ" },
  { id: "ano", rotulo: "Ano atual", exemplo: String(new Date().getFullYear()) },
] as const;

export type Troca = { de: string; para: string };
export type Candidato = { texto: string; onde: string; sugestao: string | null };

const RE_MARCA = /\{\{\s*([a-zA-Z_][\w]*)\s*\}\}/g;

/** Variáveis {{x}} usadas no HTML (inclusive as próprias da pessoa, como {{slogan}}). */
export function marcacoes(html: string): string[] {
  return [...new Set([...html.matchAll(RE_MARCA)].map((m) => m[1]))];
}

const limpar = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

/** Textos do HTML que valem virar variável, com uma sugestão de qual. */
export function candidatos(html: string): Candidato[] {
  const achados: Candidato[] = [];
  const add = (texto: string, onde: string, sugestao: string | null) => {
    const t = texto.trim();
    if (!t || t.length > 160 || t.includes("{{") || achados.some((a) => a.texto === t)) return;
    achados.push({ texto: t, onde, sugestao });
  };
  const titulo = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  if (titulo) add(limpar(titulo), "título da aba", "nome");
  for (const m of html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)) add(limpar(m[1]), "título principal (h1)", "nome");
  for (const m of [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].slice(0, 4)) add(limpar(m[1]), "subtítulo (h2)", null);
  for (const m of html.matchAll(/https?:\/\/(?:api\.)?wa\.me\/[^\s"'<>]+|https?:\/\/api\.whatsapp\.com\/send[^\s"'<>]*/gi)) add(m[0], "link do WhatsApp", "whatsapp_link");
  for (const m of html.matchAll(/https?:\/\/(?:www\.)?(?:google\.[a-z.]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps|maps\.google\.[a-z.]+)[^\s"'<>]*/gi)) add(m[0], "link do mapa", "maps_link");
  for (const m of html.matchAll(/\(?\b\d{2}\)?\s?9?\d{4}[-\s]?\d{4}\b/g)) add(m[0], "telefone", "telefone");
  for (const m of html.matchAll(/(?:Rua|Av\.|Avenida|Alameda|Travessa|Praça|Rodovia|R\.)\s[^<\n"]{4,80}/g)) add(limpar(m[0]), "endereço", "endereco");
  for (const m of html.matchAll(/@[a-z0-9_.]{3,30}\b/gi)) if (!/@(media|import|font-face|keyframes|supports|charset|page|layer|container|property)\b/i.test(m[0])) add(m[0], "instagram", "instagram");
  return achados.slice(0, 30);
}

/** Aplica as trocas confirmadas: cada texto vira {{variável}}. */
export function aplicarTrocas(html: string, trocas: Troca[]): string {
  let saida = html;
  for (const t of [...trocas].sort((a, b) => b.de.length - a.de.length)) {
    if (!t.de || !t.para) continue;
    saida = saida.split(t.de).join(`{{${t.para}}}`);
  }
  return saida;
}

const escaparHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

/** Troca {{x}} pelos valores (escapados); variável sem valor some. */
export function preencher(html: string, valores: Record<string, string | null | undefined>): string {
  return html.replace(RE_MARCA, (_, chave: string) => escaparHtml(valores[chave] ?? ""));
}

export type DadosNegocio = {
  nome: string;
  cidade?: string | null;
  categoria?: string | null;
  endereco?: string | null;
  whatsapp?: string | null;
  telefone?: string | null;
  nota?: number | null;
  avaliacoes?: number | null;
  linkMaps?: string | null;
  site?: string | null;
  instagram?: string | null;
  foto?: string | null;
};

/** Os valores padrão que um negócio dá para as variáveis. */
export function valoresDoNegocio(n: DadosNegocio): Record<string, string> {
  const fone = (n.whatsapp ?? n.telefone ?? "").replace(/\D/g, "");
  const numero = /^(?:\d{10}|\d{11})$/.test(fone) ? `55${fone}` : fone;
  const br = numero.match(/^55(\d{2})(\d{4,5})(\d{4})$/);
  const iniciais = n.nome
    .split(/\s+/)
    .filter((p) => p.length > 2)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
  return {
    nome: n.nome,
    cidade: n.cidade ?? "",
    categoria: n.categoria ?? "",
    endereco: n.endereco ?? "",
    telefone: br ? `(${br[1]}) ${br[2]}-${br[3]}` : (n.telefone ?? ""),
    whatsapp_link: br ? `https://wa.me/${numero}` : "",
    nota: n.nota ? n.nota.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : "",
    avaliacoes: n.avaliacoes ? String(n.avaliacoes) : "",
    maps_link: n.linkMaps ?? "",
    site: n.site ?? "",
    instagram: n.instagram ?? "",
    foto: n.foto ?? "",
    iniciais: iniciais || n.nome.slice(0, 2).toUpperCase(),
    ano: String(new Date().getFullYear()),
  };
}

/** Modelo que vem de exemplo na instalação: uma página só, sem dependência externa. */
export const MODELO_EXEMPLO = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{{nome}} · {{cidade}}</title>
<style>
  :root { --tinta:#151515; --papel:#f7f5f0; --linha:#dedad0; --acao:#1f5c46; }
  * { box-sizing:border-box; margin:0; }
  body { font:17px/1.55 system-ui, -apple-system, "Segoe UI", sans-serif; color:var(--tinta); background:var(--papel); }
  main { max-width:960px; margin:0 auto; padding:56px 24px 80px; }
  .topo { display:flex; align-items:center; gap:14px; }
  .selo { width:52px; height:52px; border-radius:14px; background:var(--tinta); color:var(--papel); display:grid; place-items:center; font-weight:700; letter-spacing:.04em; }
  .categoria { font-size:13px; text-transform:uppercase; letter-spacing:.14em; color:#6b675e; }
  h1 { font-size:clamp(40px,7vw,76px); line-height:1.02; letter-spacing:-.03em; margin:48px 0 20px; max-width:14ch; }
  .lead { font-size:20px; color:#45423b; max-width:52ch; }
  .nota { display:inline-flex; gap:8px; align-items:baseline; margin-top:28px; padding:10px 14px; border:1px solid var(--linha); border-radius:12px; background:#fff; }
  .nota b { font-size:22px; }
  .acoes { display:flex; flex-wrap:wrap; gap:12px; margin-top:36px; }
  .btn { display:inline-flex; align-items:center; height:52px; padding:0 22px; border-radius:12px; font-weight:600; text-decoration:none; }
  .btn-1 { background:var(--acao); color:#fff; }
  .btn-2 { border:1px solid var(--linha); color:var(--tinta); background:#fff; }
  .grade { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:16px; margin-top:72px; }
  .bloco { background:#fff; border:1px solid var(--linha); border-radius:16px; padding:22px; }
  .bloco h2 { font-size:15px; margin-bottom:6px; }
  .bloco p { color:#55524a; font-size:15px; }
  footer { margin-top:72px; padding-top:20px; border-top:1px solid var(--linha); font-size:14px; color:#6b675e; }
</style>
</head>
<body>
<main>
  <div class="topo"><span class="selo">{{iniciais}}</span><span class="categoria">{{categoria}} · {{cidade}}</span></div>
  <h1>{{nome}}</h1>
  <p class="lead">Atendimento com hora marcada, sem fila e sem ligação: o cliente escolhe o horário pelo celular e recebe a confirmação no WhatsApp.</p>
  <div class="nota"><b>{{nota}}</b> no Google · {{avaliacoes}} avaliações</div>
  <div class="acoes">
    <a class="btn btn-1" href="{{whatsapp_link}}">Chamar no WhatsApp</a>
    <a class="btn btn-2" href="{{maps_link}}">Como chegar</a>
  </div>
  <div class="grade">
    <div class="bloco"><h2>Onde fica</h2><p>{{endereco}}</p></div>
    <div class="bloco"><h2>Telefone</h2><p>{{telefone}}</p></div>
    <div class="bloco"><h2>Horário</h2><p>Segunda a sábado, das 9h às 19h.</p></div>
  </div>
  <footer>{{nome}} · {{cidade}} · {{ano}}</footer>
</main>
</body>
</html>`;
