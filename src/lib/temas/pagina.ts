import { direcaoDoTema } from "./direcao";
import { estiloConsulta, estilos } from "./estilos";
import { interacoes } from "./interacoes";
import { segmentos } from "./segmentos";

type Segmento = (typeof segmentos)[keyof typeof segmentos];

function consulta(segmento: Segmento) {
  let campos: string;
  if ("exemplos" in segmento) {
    campos = `
      <div hidden data-items>{{itens_catalogo}}</div>
      <div hidden data-demo-items>${segmento.exemplos}</div>
      <div hidden data-validity>${segmento.tipo === "offers" ? "{{validade_ofertas}}" : ""}</div>
      <div class="feature-form">
        <label class="feature-field">Buscar por nome<input type="search" maxlength="80" data-search></label>
        <label class="feature-field">Categoria<select data-category><option value="">Todas</option></select></label>
        <label class="feature-field" hidden>Tamanho ou numeração<select data-size><option value="">Todos</option></select></label>
      </div>
      <p class="feature-status" data-status aria-live="polite"></p>
      <div class="feature-list" data-list></div>
      <div class="feature-cart">
        <strong data-count aria-live="polite"></strong>
        <div class="feature-actions">
          <button type="button" class="pill outline" data-clear>Limpar lista</button>
          <button type="button" class="pill" data-build disabled>${segmento.botao}</button>
        </div>
      </div>`;
  } else {
    const datas = {
      agenda: "<div hidden data-slots>{{horarios_disponiveis}}</div>",
      range: "<div hidden data-dates>{{datas_disponiveis}}</div>",
      brief: "",
    }[segmento.tipo];
    campos = `
      ${datas ? `${datas}<div class="feature-dates" data-date-buttons aria-label="Datas informadas" hidden></div>` : ""}
      <form class="feature-form">
        ${segmento.campos}
        <p class="feature-wide feature-status" data-status aria-live="polite"></p>
        <div class="feature-wide"><button type="submit" class="pill">${segmento.botao}</button></div>
      </form>`;
  }

  return `<section class="feature" id="funcionalidade" aria-labelledby="titulo-consulta" data-feature="${segmento.tipo}" data-subject="${segmento.assunto}">
    <div class="wrap">
      <div class="feature-head">
        <h2 id="titulo-consulta">${segmento.titulo}</h2>
        <p>${segmento.descricao}</p>
      </div>
      <div class="feature-main">
        ${campos}
        <p class="feature-output" data-output aria-live="polite"></p>
        <div class="feature-actions"><button type="button" class="pill outline" data-send hidden>Continuar</button></div>
        <p class="feature-note">A seleção prepara uma mensagem para você revisar. Disponibilidade e valores são confirmados pela equipe.</p>
        <noscript><p>Ative o JavaScript para montar a consulta ou use os <a href="#contato">canais de contato</a>.</p></noscript>
      </div>
    </div>
  </section>`;
}

function imagem(variavel: string, capa = false) {
  return `<figure class="media">
    <span class="initials" aria-hidden="true">{{iniciais}}</span>
    <img src="{{${variavel}}}" alt="" decoding="async" ${capa ? 'fetchpriority="high"' : 'loading="lazy"'} referrerpolicy="no-referrer">
    <figcaption>Foto ilustrativa</figcaption>
  </figure>`;
}

const midiaEContato = String.raw`
for (const img of document.querySelectorAll(".media img")) {
  const hide = () => { img.hidden = true; };
  img.addEventListener("error", hide, { once: true });
  if (img.complete && !img.naturalWidth) hide();
}
const contato = document.querySelector("[data-wa]");
if (contato?.getAttribute("href")?.startsWith("https://wa.me/")) {
  const original = new URL(contato.href);
  for (const assunto of document.querySelectorAll("[data-topic]")) {
    assunto.addEventListener("click", () => {
      const destino = new URL(original);
      destino.searchParams.set("text", "Olá! Gostaria de saber mais sobre " + assunto.dataset.topic + ".");
      contato.href = destino.href;
    });
  }
}
`;

export function paginaDoTema(
  slug: keyof typeof segmentos,
  fotos: readonly string[],
) {
  const direcao = direcaoDoTema(slug);
  const fotosIlustrativas = fotos
    .map(
      (url) =>
        `.media img[src="${url}"]:not([hidden]) + figcaption { display: block; }`,
    )
    .join("\n");
  const servicos = `<section class="section wrap" id="servicos" aria-labelledby="titulo-servicos">
    <h2 class="section-title" id="titulo-servicos">{{titulo_servicos}}</h2>
    <div class="services">
      ${[1, 2, 3]
        .map(
          (n) => `<article>
        ${imagem(`foto_${n}`)}
        <div class="service-copy">
          <h3>{{servico_${n}}}</h3>
          <p>{{descricao_${n}}}</p>
          <a class="service-link" href="#contato" data-topic="{{servico_${n}}}" aria-label="Consultar sobre {{servico_${n}}}">Consultar</a>
        </div>
      </article>`,
        )
        .join("\n")}
    </div>
  </section>`;
  const atendimento = consulta(segmentos[slug]);

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>{{nome}}</title>
  <style>
    ${direcao.fontes}
    :root { ${direcao.tokens} }
    ${estilos}
    ${estiloConsulta}
    ${fotosIlustrativas}
  </style>
</head>
<body class="tema-${slug} ${direcao.capa} ${direcao.galeria}">
  <a class="skip" href="#inicio">Pular para o conteúdo</a>
  <header class="masthead">
    <div class="wrap">
      <a class="wordmark" href="#inicio">{{nome}}</a>
      <nav class="nav" aria-label="Navegação principal">
        <a href="#servicos">${direcao.secoes}</a>
        <a href="#contato">Contato</a>
      </nav>
    </div>
  </header>
  <main id="inicio" tabindex="-1">
    <section class="hero" aria-labelledby="titulo">
      <div class="hero-inner wrap">
        <div class="copy">
          <p class="context optional">{{categoria}}</p>
          <h1 id="titulo">{{titulo_principal}}</h1>
          <p class="intro">{{subtitulo_principal}}</p>
          <div class="actions">
            <a class="pill" href="#funcionalidade">${direcao.acao}</a>
            <a class="map" href="{{maps_link}}" target="_blank" rel="noopener noreferrer">Como chegar</a>
          </div>
        </div>
        ${imagem("foto_capa", true)}
      </div>
    </section>
    ${direcao.consultaAntes ? atendimento + servicos : servicos + atendimento}
    <section class="contact-band" id="contato" aria-labelledby="titulo-contato">
      <div class="contact section wrap">
        <div>
          <h2 id="titulo-contato">{{titulo_contato}}</h2>
          <p>{{nome}}</p>
        </div>
        <div>
          <div class="contact-data">
            <p class="optional">{{endereco}}</p>
            <p class="optional">{{cidade}}</p>
            <p class="optional">{{telefone}}</p>
            <p class="rating"><strong class="score">{{nota}}</strong> no Google<span class="review-count">{{avaliacoes}}</span></p>
          </div>
          <div class="actions">
            <a class="pill" data-wa href="{{whatsapp_link}}" target="_blank" rel="noopener noreferrer">Chamar no WhatsApp</a>
            <a class="pill outline" href="{{maps_link}}" target="_blank" rel="noopener noreferrer">Ver no mapa</a>
            <a class="map" href="#funcionalidade">Preparar uma consulta</a>
          </div>
        </div>
      </div>
    </section>
  </main>
  <footer class="footer"><div class="wrap"><p>© {{ano}} {{nome}}</p><a href="#inicio">Voltar ao início</a></div></footer>
  <script>${midiaEContato}\n${interacoes}</script>
</body>
</html>`;
}
