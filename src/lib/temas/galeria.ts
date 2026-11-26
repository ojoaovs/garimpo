// O script roda dentro do documento da prévia, inclusive em uma galeria estática.
export const galeria = String.raw`
(() => {
  function marcaIlustracao(img, ilustrada) {
    img.toggleAttribute("data-ilustrada", ilustrada);
  }

  for (const img of document.querySelectorAll(".media img")) {
    const ilustracao = img.dataset.ilustracao;
    const recuperar = () => {
      if (ilustracao && img.getAttribute("src") !== ilustracao) {
        img.src = ilustracao;
        marcaIlustracao(img, true);
      } else {
        img.hidden = true;
      }
    };
    img.addEventListener("error", recuperar);
    if (!img.getAttribute("src") || (img.complete && !img.naturalWidth)) recuperar();
  }

  const visual = document.querySelector(".hero-visual");
  if (!visual) return;
  const foto = visual.querySelector("img");
  const controles = visual.querySelector(".foto-nav");
  const contador = controles.querySelector("[data-posicao]");
  const status = controles.querySelector("[data-foto-status]");
  const anteriores = [...visual.querySelectorAll("[data-foto]")];
  const fotos = [{
    url: foto.getAttribute("src"),
    ilustracao: foto.dataset.ilustracao,
    titulo: "Capa",
  }, ...anteriores.map(item => ({
    url: item.dataset.foto,
    ilustracao: item.dataset.ilustracao,
    titulo: item.dataset.titulo,
  }))];

  let posicao = 0;
  let solicitada = 0;
  let animacao;
  const reduzir = matchMedia("(prefers-reduced-motion: reduce)");
  const carregar = async url => {
    if (!url) return false;
    const img = new Image();
    img.referrerPolicy = "no-referrer";
    img.src = url;
    try {
      await img.decode();
      return true;
    } catch {
      return false;
    }
  };

  async function mostrar(passo) {
    solicitada = (solicitada + passo + fotos.length) % fotos.length;
    const proxima = solicitada;
    const { url, ilustracao, titulo } = fotos[proxima];
    let src = url;
    if (!(await carregar(src))) src = ilustracao;
    if (src !== url && !(await carregar(src))) src = "";
    if (solicitada !== proxima || posicao === proxima) return;

    posicao = proxima;
    foto.dataset.ilustracao = ilustracao;
    foto.src = src;
    foto.hidden = !src;
    marcaIlustracao(foto, src === ilustracao);
    visual.classList.toggle("outra-foto", proxima !== 0);
    contador.textContent = (posicao + 1) + " / " + fotos.length;
    status.textContent = "Foto " + (posicao + 1) + " de " + fotos.length + ": " + titulo;
    animacao?.cancel();
    if (!reduzir.matches && src) {
      animacao = foto.animate(
        [{ opacity: .35, transform: "scale(1.07) translateX(" + (passo * 1.2) + "%)" }, { opacity: 1, transform: "none" }],
        { duration: 580, easing: "cubic-bezier(.22,.75,.2,1)" },
      );
    }
  }

  controles.querySelector("[data-anterior]").addEventListener("click", () => mostrar(-1));
  controles.querySelector("[data-proxima]").addEventListener("click", () => mostrar(1));
  controles.hidden = false;
})();
`;
