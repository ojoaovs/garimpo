/**
 * Prévias e modelos são HTML de terceiros servidos no mesmo domínio do painel.
 * O cabeçalho "sandbox" tira a origem da página: os scripts dela rodam, mas
 * não alcançam os cookies nem a API do painel.
 */
export function respostaHtmlIsolada(html: string, status = 200) {
  return new Response(html, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "content-security-policy": "sandbox allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation; frame-ancestors 'self'",
      "x-frame-options": "SAMEORIGIN",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer",
      "cache-control": "no-store",
      "x-robots-tag": "noindex",
    },
  });
}

export const paginaSimples = (titulo: string, texto: string) => `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${titulo}</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;font:16px/1.5 system-ui,sans-serif;background:#f1f2ee;color:#121513}main{max-width:420px;padding:24px;text-align:center}h1{font-size:22px;margin:0 0 8px}p{color:#69716b;margin:0}</style></head><body><main><h1>${titulo}</h1><p>${texto}</p></main></body></html>`;
