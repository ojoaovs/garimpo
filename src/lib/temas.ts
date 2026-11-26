import "server-only";

import { dadosTemas } from "./temas/dados";
import { direcaoDoTema } from "./temas/direcao";
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

const camposFoto = ["foto_capa", "foto_1", "foto_2", "foto_3"] as const;
const capaLocal = (url: string) =>
  `/temas/fotos/${new URL(url).pathname.split("/")[2]}.webp`;

export const temas: Tema[] = dadosTemas.map(({ slug, defaults, ...dados }) => {
  const { titulo, abertura } = direcaoDoTema(slug);
  const fotos = Object.fromEntries(
    camposFoto.map((campo) => [campo, capaLocal(defaults[campo])]),
  );
  return {
    ...dados,
    id: `${prefixoTemasPremium}${slug}-v5`,
    html: paginaDoTema(slug, Object.values(fotos)),
    ativo: true,
    trocas: "[]",
    defaults: {
      ...defaults,
      ...fotos,
      titulo_principal: titulo,
      subtitulo_principal: abertura,
    },
  };
});

export function temaPorId(id: string) {
  return temas.find((t) => t.id === id.replace(/-v4$/, "-v5"));
}

export function defaultsDoTemaPublicado(
  id: string,
): Record<string, string> | undefined {
  if (id.startsWith(prefixoTemasPremium) && id.endsWith("-v4")) {
    return dadosTemas.find((t) => id === `${prefixoTemasPremium}${t.slug}-v4`)
      ?.defaults;
  }
  return temaPorId(id)?.defaults;
}
