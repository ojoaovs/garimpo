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
<title>{{nome}}</title>
<style>
  * { box-sizing: border-box; }
  :root { --papel: #f3e7d4; --tinta: #382818; --painel: #d1975b; }
  body { margin: 0; color: var(--tinta); background: var(--papel); font: 1rem/1.55 system-ui, sans-serif; }
  main { width: min(1120px, 100% - 32px); margin-inline: auto; }
  h1 { font: 400 clamp(3.25rem, 9vw, 8rem)/.98 Georgia, serif; letter-spacing: -.055em; margin: 12px 0 24px; overflow-wrap: anywhere; }
  h2 { font-size: 1.15rem; margin: 0 0 8px; }
  p { margin: 0; overflow-wrap: anywhere; }
  :empty.optional, a[href=""], .rating:not(:has(b:not(:empty))), .data:not(:has(p:not(:empty))) { display: none; }
  :focus-visible { outline: 3px solid currentColor; outline-offset: 4px; }
  .capa { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, .7fr); gap: 24px; padding-block: clamp(24px, 6vw, 88px); align-items: stretch; }
  .capa > div:first-child { display: grid; align-content: center; }
  .marca { position: relative; margin: 0; display: grid; place-items: center; min-height: 360px; overflow: hidden; border-radius: 50% 50% 12px 12px / 28% 28% 12px 12px; background: linear-gradient(145deg, var(--painel), #f5d597); font: 400 clamp(5rem, 14vw, 12rem)/1 Georgia, serif; }
  .marca img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; animation: aproxima 1s ease-out both; }
  .marca figcaption { position: absolute; right: 12px; bottom: 12px; background: #291d17e0; color: #fff5e3; padding: 5px 9px; border-radius: 4px; font: 12px/1.3 system-ui, sans-serif; }
  @keyframes aproxima { from { transform: scale(1.08); } to { transform: scale(1); } }
  @media (prefers-reduced-motion: reduce) { .marca img { animation: none; } }
  .acoes { display: flex; flex-wrap: wrap; gap: 10px; }
  .acoes a { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 9px 16px; border: 1px solid currentColor; color: inherit; border-radius: 8px; font-weight: 650; text-decoration: none; }
  .acoes a:first-child { background: var(--tinta); border-color: var(--tinta); color: var(--papel); }
  .acoes a:focus-visible { outline-color: var(--tinta); }
  .dados { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap: 22px; padding-block: 32px; border-block: 1px solid #20382f40; }
  .avaliacoes:not(:empty)::before { content: " · "; }
  .avaliacoes:not(:empty)::after { content: " avaliações"; }
  footer { padding-block: 18px; }
  @media (max-width: 650px) { .capa { grid-template-columns: 1fr; } .marca { min-height: 200px; } }
</style>
</head>
<body>
<main>
  <section class="capa" aria-labelledby="titulo">
    <div>
      <p class="optional">{{categoria}}</p>
      <h1 id="titulo">{{nome}}</h1>
      <div class="acoes">
        <a href="{{whatsapp_link}}" target="_blank" rel="noopener noreferrer">Chamar no WhatsApp</a>
        <a href="{{maps_link}}" target="_blank" rel="noopener noreferrer">Como chegar</a>
      </div>
    </div>
    <figure class="marca"><span aria-hidden="true">{{iniciais}}</span><img src="/temas/fotos/11159533.webp" alt="" fetchpriority="high"><figcaption>Foto ilustrativa</figcaption></figure>
  </section>
  <div class="dados">
    <section class="data"><h2>Onde fica</h2><p class="optional">{{endereco}}</p><p class="optional">{{cidade}}</p></section>
    <section class="data"><h2>Telefone</h2><p>{{telefone}}</p></section>
    <section class="rating"><h2>Avaliação no Google</h2><p><b>{{nota}}</b><span class="avaliacoes">{{avaliacoes}}</span></p></section>
  </div>
  <footer>© {{ano}} {{nome}}</footer>
</main>
</body>
</html>`;
