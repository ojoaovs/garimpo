import { temaPorId } from "@/lib/temas";
import { db } from "@/lib/db";
import { paginaSimples, respostaHtmlIsolada } from "@/lib/html-seguro";
import { aplicarTrocas, preencher, VARIAVEIS, type Troca } from "@/lib/modelos";
import { usuarioAtual } from "@/lib/sessao";

export const dynamic = "force-dynamic";

/** Modelo preenchido com os valores de exemplo (só para quem está no painel). */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await usuarioAtual())) return respostaHtmlIsolada(paginaSimples("Entre no painel", "Faça login para ver o modelo."), 401);
  const { id } = await params;
  const tema = temaPorId(id);
  const m = tema ?? await db.modelo.findUnique({ where: { id } });
  if (!m) return respostaHtmlIsolada(paginaSimples("Modelo não encontrado", ""), 404);
  let trocas: Troca[] = [];
  try {
    trocas = JSON.parse(m.trocas);
  } catch {
    /* sem trocas */
  }
  const exemplo = Object.fromEntries(VARIAVEIS.map((v) => [v.id, v.exemplo]));
  if (tema) Object.assign(exemplo, tema.defaults, { nome: tema.demo, categoria: tema.nicho.split(",")[0], cidade: "Sua cidade", foto: "", whatsapp_link: "#contato", maps_link: "", endereco: "", telefone: "", iniciais: tema.demo.slice(0,2) });
  const html = preencher(aplicarTrocas(m.html, trocas), new Proxy(exemplo as Record<string, string>, { get: (o, k: string) => o[k] ?? `[${k}]` }));
  return respostaHtmlIsolada(html);
}
