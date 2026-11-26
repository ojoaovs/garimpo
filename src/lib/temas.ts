import "server-only";

import { dadosTemas } from "./temas/dados";
import { direcaoDoTema } from "./temas/direcao";
import { fotosDoTema } from "./temas/fotos";
import { paginaDoTema } from "./temas/pagina";

export type Tema = {
  id: string;
  nome: string;
  nicho: string;
  estilo: string;
  demo: string;
  html: string;
  ativo: boolean;
  trocas: string;
  categoria: string;
  defaults: Record<string, string>;
};

export const prefixoTemasAntigos = "brd-tema-";
export const prefixoTemasPremium = "brd-premium-";

type Versao = 4 | 5 | 6;
const idTema = (slug: string, versao: Versao) =>
  `${prefixoTemasPremium}${slug}-v${versao}`;

function valoresPadrao(dados: (typeof dadosTemas)[number], versao: 5 | 6) {
  const { titulo, abertura, chamada } = direcaoDoTema(dados.slug);
  return {
    ...dados.defaults,
    ...fotosDoTema(dados, versao),
    titulo_principal: versao === 6 ? (chamada ?? titulo) : titulo,
    subtitulo_principal: abertura,
  };
}

export const temas: Tema[] = dadosTemas.map((dados) => ({
  id: idTema(dados.slug, 6),
  nome: dados.nome,
  nicho: dados.nicho,
  estilo: dados.estilo,
  demo: dados.demo,
  categoria: dados.categoria,
  html: paginaDoTema(dados.slug, fotosDoTema(dados, 6)),
  ativo: true,
  trocas: "[]",
  defaults: valoresPadrao(dados, 6),
}));

export function temaPorId(id: string) {
  return temas.find((t) => t.id === id.replace(/-v[45]$/, "-v6"));
}

/** Uma prévia publicada é preenchida com os valores da versão que a gerou. */
export function defaultsDoTemaPublicado(
  id: string,
): Record<string, string> | undefined {
  if (!id.startsWith(prefixoTemasPremium)) return undefined;
  const dados = dadosTemas.find(
    (t) => id === idTema(t.slug, 4) || id === idTema(t.slug, 5),
  );
  if (dados)
    return id.endsWith("-v4") ? dados.defaults : valoresPadrao(dados, 5);
  return temas.find((t) => t.id === id)?.defaults;
}
