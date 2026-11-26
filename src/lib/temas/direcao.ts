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
    reflexo: string,
  ];
  acao: string;
  secoes: string;
  imagem: string;
  titulo: string;
  chamada?: string;
  abertura: string;
  raio?: string;
  consultaAntes?: boolean;
};

const direcoes = {
  studio: {
    capa: "poster",
    galeria: "mosaico",
    fonte: "expressiva",
    cores: ["#141025", "#f8f1ff", "#2a174a", "#f8a5df", "#32142a", "#803ff5"],
    acao: "Planejar projeto",
    secoes: "Serviços",
    imagem: "50% 45%",
    titulo: "Da primeira ideia ao último detalhe.",
    chamada: "Ideias em grande formato.",
    abertura:
      "Identidade, sites e projetos digitais. Conte o que você quer colocar no mundo.",
  },
  forma: {
    capa: "dupla",
    galeria: "mosaico",
    fonte: "editorial",
    cores: ["#e9e0d1", "#2c261e", "#d3c2a8", "#432b2d", "#fff8ec", "#ae6d46"],
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
    cores: ["#f8e8dd", "#412125", "#f0c8b7", "#743830", "#fff4ec", "#e37f65"],
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
    cores: ["#1d0f0a", "#fff3e4", "#381811", "#ffc374", "#341605", "#dc4a29"],
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
    cores: ["#111f51", "#f2f6ff", "#213671", "#a9e1ff", "#142755", "#345bfe"],
    acao: "Consultar especialista",
    secoes: "Áreas de atuação",
    imagem: "50% 46%",
    titulo: "Clareza para a próxima decisão.",
    chamada: "Decida com clareza.",
    abertura:
      "Organize as dúvidas da sua empresa e encontre o ponto de partida para a conversa.",
  },
  vitrine: {
    capa: "vitrine",
    galeria: "colecao",
    fonte: "expressiva",
    cores: ["#3e1034", "#fff0ee", "#632049", "#ffb783", "#411b29", "#d63281"],
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
    cores: ["#17192a", "#f7f5ff", "#292b47", "#ff7a36", "#211224", "#fd4017"],
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
    cores: ["#182028", "#f4f7fb", "#27333d", "#fbd254", "#292100", "#f28a13"],
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
    cores: ["#102e3c", "#ecf9ff", "#184c5e", "#acebd1", "#123629", "#2dc0df"],
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
    cores: ["#f9e9ec", "#421f3e", "#f0c4d2", "#713458", "#fff4ef", "#e67678"],
    acao: "Encontrar atendimento",
    secoes: "Atendimento",
    imagem: "50% 50%",
    raio: "20px",
    titulo: "O atendimento que você procura, por perto.",
    chamada: "Perto de você.",
    abertura: "Encontre serviços, fale com a equipe ou consulte como chegar.",
  },
  barbearia: {
    capa: "janela",
    galeria: "fileiras",
    fonte: "precisa",
    cores: ["#291717", "#fff4e5", "#462623", "#ffd299", "#321e1a", "#c45746"],
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
    cores: ["#132e21", "#f4fae9", "#234831", "#d4ed9e", "#22361d", "#6baa47"],
    acao: "Consultar locação",
    secoes: "A chácara",
    imagem: "50% 52%",
    titulo: "Um fim de semana ao ar livre.",
    chamada: "Um fim de semana lá fora.",
    abertura:
      "Planeje seu encontro e consulte datas, capacidade e opções de locação.",
  },
  mercado: {
    capa: "dupla",
    galeria: "colecao",
    fonte: "expressiva",
    cores: ["#e1f1c7", "#223722", "#c3e1a3", "#28543d", "#fff8de", "#ffce55"],
    acao: "Montar lista de compras",
    secoes: "Setores",
    imagem: "50% 45%",
    raio: "14px",
    consultaAntes: true,
    titulo: "A feira da semana começa aqui.",
    chamada: "A feira começa aqui.",
    abertura:
      "Monte sua lista e consulte as ofertas vigentes antes de sair de casa.",
  },
  calcados: {
    capa: "vitrine",
    galeria: "colecao",
    fonte: "expressiva",
    cores: ["#112376", "#eef2ff", "#203cad", "#eeff91", "#212655", "#6593ff"],
    acao: "Buscar no catálogo",
    secoes: "Calçados",
    imagem: "50% 60%",
    consultaAntes: true,
    titulo: "Encontre seu próximo par.",
    chamada: "O par da vez.",
    abertura:
      "Explore estilos, filtre pela sua numeração e consulte os modelos disponíveis.",
  },
} satisfies Record<string, Direcao>;

export function direcaoDoTema(slug: keyof typeof direcoes) {
  const direcao: Direcao = direcoes[slug];
  const [fundo, tinta, painel, destaque, sobreDestaque, reflexo] =
    direcao.cores;
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
      --accent: ${destaque}; --on: ${sobreDestaque}; --tint: ${reflexo};
      --display: "${familia}", ${direcao.fonte === "editorial" ? "Georgia, serif" : "system-ui, sans-serif"};
      --display-weight: ${direcao.fonte === "editorial" ? 400 : 700};
      --radius: ${direcao.raio ?? "4px"};
      --crop: ${direcao.imagem};
    `,
  };
}
