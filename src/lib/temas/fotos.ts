import { dadosTemas } from "./dados";

export const camposFoto = ["foto_capa", "foto_1", "foto_2", "foto_3"] as const;
export type CampoFoto = (typeof camposFoto)[number];
export type FotosTema = Record<CampoFoto, string>;

type DadosTema = (typeof dadosTemas)[number];
const arquivo = (id: string) => `/temas/fotos/${id}.webp`;

/** A coleção atual usa novos enquadramentos e imagens em destaque. */
const selecao: Partial<
  Record<DadosTema["slug"], Partial<Record<CampoFoto, string>>>
> = {
  forma: { foto_capa: "1571460" },
  calma: { foto_capa: "11774389", foto_1: "6899538" },
  mesa: { foto_capa: "958545", foto_1: "675951", foto_2: "1267320" },
  atlas: { foto_capa: "3184291" },
  vitrine: { foto_capa: "1926769", foto_3: "4857762" },
  pulso: { foto_capa: "1552242", foto_1: "2261477", foto_2: "416778" },
  oficio: { foto_capa: "4489702", foto_2: "4116291" },
  horizonte: { foto_capa: "248797" },
  barbearia: { foto_capa: "3998421", foto_3: "1319460" },
  chacara: { foto_capa: "20200267", foto_2: "15508432" },
  mercado: { foto_capa: "1128678" },
  calcados: { foto_capa: "2529148" },
};

export function fotosDoTema(
  { slug, defaults }: DadosTema,
  versao: 5 | 6,
): FotosTema {
  const fotos = {} as FotosTema;
  for (const campo of camposFoto) {
    const anterior = new URL(defaults[campo]).pathname.split("/")[2];
    fotos[campo] = arquivo(
      (versao === 6 ? selecao[slug]?.[campo] : undefined) ?? anterior,
    );
  }
  return fotos;
}
