const fontes = {
  editorial: ["Instrument Serif", "instrument-serif", "400"],
  precisa: ["Archivo Narrow", "archivo-narrow", "600 700"],
  expressiva: ["Bricolage Grotesque", "bricolage-grotesque", "600 800"],
  humana: ["Instrument Sans", "instrument-sans", "400 700"],
} as const;

function fonteLocal([
  nome,
  arquivo,
  pesos,
]: (typeof fontes)[keyof typeof fontes]) {
  return `@font-face {
    font-family: "${nome}";
    src: url("/temas/fontes/${arquivo}.woff2") format("woff2");
    font-weight: ${pesos};
    font-style: normal;
    font-display: swap;
  }`;
}

type Direcao = {
  capa: "poster" | "dupla" | "arco" | "cena" | "ficha" | "vitrine" | "janela";
  galeria: "mosaico" | "fileiras" | "colecao";
  fonte: keyof typeof fontes;
  cores: [
    fundo: string,
    tinta: string,
    painel: string,
    destaque: string,
    sobreDestaque: string,
  ];
  acao: string;
  secoes: string;
  imagem: string;
  titulo: string;
  abertura: string;
  raio?: string;
  consultaAntes?: boolean;
};

const direcoes = {
  studio: {
    capa: "poster",
    galeria: "mosaico",
    fonte: "expressiva",
    cores: ["#18163b", "#f5f2ff", "#292653", "#dfd2ff", "#211746"],
    acao: "Planejar projeto",
    secoes: "Serviços",
    imagem: "50% 45%",
    titulo: "Da primeira ideia ao último detalhe.",
    abertura:
      "Identidade, sites e projetos digitais. Conte o que você quer colocar no mundo.",
  },
  forma: {
    capa: "dupla",
    galeria: "mosaico",
    fonte: "editorial",
    cores: ["#f5f4ef", "#232820", "#e3e6dc", "#334637", "#fff"],
    acao: "Explorar meu projeto",
    secoes: "Projetos",
    imagem: "50% 55%",
    titulo: "Espaços à altura da sua rotina.",
    abertura:
      "De um cômodo a um novo endereço, converse sobre o espaço que você tem em mente.",
  },
  calma: {
    capa: "arco",
    galeria: "fileiras",
    fonte: "editorial",
    cores: ["#f2f7f5", "#193535", "#dceee7", "#29534d", "#fff"],
    acao: "Consultar atendimento",
    secoes: "Cuidados",
    imagem: "50% 42%",
    raio: "24px",
    titulo: "Tempo para cuidar de você.",
    abertura:
      "Encontre o atendimento que procura e escolha uma data de preferência.",
  },
  mesa: {
    capa: "cena",
    galeria: "fileiras",
    fonte: "editorial",
    cores: ["#211812", "#fff7ec", "#392820", "#f1c799", "#261810"],
    acao: "Abrir cardápio",
    secoes: "À mesa",
    imagem: "50% 58%",
    consultaAntes: true,
    titulo: "Tem lugar para você à mesa.",
    abertura: "Explore o cardápio, monte sua seleção e converse com a casa.",
  },
  atlas: {
    capa: "ficha",
    galeria: "fileiras",
    fonte: "humana",
    cores: ["#eaf1f9", "#112748", "#d7e6f6", "#214778", "#fff"],
    acao: "Consultar especialista",
    secoes: "Áreas de atuação",
    imagem: "50% 46%",
    titulo: "Clareza para a próxima decisão.",
    abertura:
      "Organize as dúvidas da sua empresa e encontre o ponto de partida para a conversa.",
  },
  vitrine: {
    capa: "vitrine",
    galeria: "colecao",
    fonte: "expressiva",
    cores: ["#f7eaf2", "#401830", "#eed7e7", "#772958", "#fff"],
    acao: "Explorar coleção",
    secoes: "Coleção",
    imagem: "50% 38%",
    consultaAntes: true,
    titulo: "Vista seu próprio estilo.",
    abertura:
      "Filtre por categoria e tamanho. Separe suas favoritas para consultar disponibilidade.",
  },
  pulso: {
    capa: "janela",
    galeria: "colecao",
    fonte: "precisa",
    cores: ["#222743", "#f3f4ff", "#303858", "#ffd34a", "#201c0e"],
    acao: "Consultar treino",
    secoes: "Modalidades",
    imagem: "50% 49%",
    titulo: "Seu treino começa aqui.",
    abertura:
      "Explore as opções de treino e consulte o horário que cabe na sua rotina.",
  },
  oficio: {
    capa: "ficha",
    galeria: "fileiras",
    fonte: "precisa",
    cores: ["#1f2c35", "#f5f8fa", "#2d414e", "#ffd786", "#211a0e"],
    acao: "Pedir orçamento",
    secoes: "Serviços",
    imagem: "50% 50%",
    consultaAntes: true,
    titulo: "Da avaliação ao reparo.",
    abertura:
      "Conte o que exige atenção e reúna as informações para pedir um orçamento.",
  },
  horizonte: {
    capa: "cena",
    galeria: "mosaico",
    fonte: "editorial",
    cores: ["#e8f2f3", "#153d45", "#d4e8e9", "#14535e", "#fff"],
    acao: "Consultar datas",
    secoes: "Experiências",
    imagem: "50% 56%",
    raio: "16px",
    titulo: "Para onde vamos agora?",
    abertura:
      "Escolha o período e consulte experiências, eventos e hospedagem.",
  },
  essencia: {
    capa: "dupla",
    galeria: "fileiras",
    fonte: "humana",
    cores: ["#f4f2fa", "#272340", "#e7e0f3", "#513e81", "#fff"],
    acao: "Encontrar atendimento",
    secoes: "Atendimento",
    imagem: "50% 50%",
    raio: "20px",
    titulo: "O atendimento que você procura, por perto.",
    abertura: "Encontre serviços, fale com a equipe ou consulte como chegar.",
  },
  barbearia: {
    capa: "janela",
    galeria: "fileiras",
    fonte: "precisa",
    cores: ["#302020", "#ffede1", "#482e2a", "#edaf8d", "#311b17"],
    acao: "Escolher horário",
    secoes: "Corte e barba",
    imagem: "48% 42%",
    titulo: "Corte, barba e acabamento.",
    abertura: "Escolha o serviço e peça um horário para sua próxima visita.",
  },
  chacara: {
    capa: "cena",
    galeria: "mosaico",
    fonte: "editorial",
    cores: ["#eef0db", "#283c25", "#dee5c4", "#355133", "#fff"],
    acao: "Consultar locação",
    secoes: "A chácara",
    imagem: "50% 52%",
    titulo: "Um fim de semana ao ar livre.",
    abertura:
      "Planeje seu encontro e consulte datas, capacidade e opções de locação.",
  },
  mercado: {
    capa: "dupla",
    galeria: "colecao",
    fonte: "expressiva",
    cores: ["#f8f5db", "#253a26", "#e7ebca", "#2d5635", "#fff"],
    acao: "Montar lista de compras",
    secoes: "Setores",
    imagem: "50% 45%",
    raio: "14px",
    consultaAntes: true,
    titulo: "A feira da semana começa aqui.",
    abertura:
      "Monte sua lista e consulte as ofertas vigentes antes de sair de casa.",
  },
  calcados: {
    capa: "vitrine",
    galeria: "colecao",
    fonte: "expressiva",
    cores: ["#edf1ff", "#192958", "#dce4ff", "#283b84", "#fff"],
    acao: "Buscar no catálogo",
    secoes: "Calçados",
    imagem: "50% 60%",
    consultaAntes: true,
    titulo: "Encontre seu próximo par.",
    abertura:
      "Explore estilos, filtre pela sua numeração e consulte os modelos disponíveis.",
  },
} satisfies Record<string, Direcao>;

export function direcaoDoTema(slug: keyof typeof direcoes) {
  const direcao: Direcao = direcoes[slug];
  const [fundo, tinta, painel, destaque, sobreDestaque] = direcao.cores;
  const [familia] = fontes[direcao.fonte];
  return {
    ...direcao,
    fontes: [
      fonteLocal(fontes.humana),
      ...(direcao.fonte === "humana"
        ? []
        : [fonteLocal(fontes[direcao.fonte])]),
    ].join("\n"),
    tokens: `
      --bg: ${fundo}; --ink: ${tinta}; --panel: ${painel};
      --accent: ${destaque}; --on: ${sobreDestaque};
      --display: "${familia}", ${direcao.fonte === "editorial" ? "Georgia, serif" : "system-ui, sans-serif"};
      --display-weight: ${direcao.fonte === "editorial" ? 400 : 700};
      --radius: ${direcao.raio ?? "4px"};
      --crop: ${direcao.imagem};
    `,
  };
}
