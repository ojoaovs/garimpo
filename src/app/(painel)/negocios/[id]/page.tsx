import { CampoCidade } from "@/components/campo-cidade";
import { AtSign, ExternalLink, Globe, MapPin, Phone, Star } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { anotar, apagarNegocio, criarPrevia, editarNegocio, mudarEtapa, novaCobranca, statusPrevia } from "@/acoes/operacao";
import { Confirmar, Copiar, Enviar, Form } from "@/components/cliente";
import { Expansivel, Gaveta } from "@/components/gaveta";
import { temas } from "@/lib/temas";
import { CamposPrevia } from "@/components/gerar-previa";
import { Icone } from "@/components/icones";
import { Avatar, Campo, dataHora, quando, SeloEtapa } from "@/components/ui";
import { ativo, enderecoPublico } from "@/lib/config";
import { db } from "@/lib/db";
import { AGENTES, brl, ETAPAS, MOTIVOS, NOME_ETAPA, NOME_MOTIVO, ordemEtapa, type Etapa, type Motivo } from "@/lib/etapas";
import { marcacoes, VARIAVEIS } from "@/lib/modelos";
import { numeroLegivel } from "@/lib/telefone";

export const metadata = { title: "Negócio" };

export default async function Negocio({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const n = await db.negocio.findUnique({
    where: { id },
    include: {
      eventos: { orderBy: { criadoEm: "desc" } },
      previas: { orderBy: { criadoEm: "desc" }, include: { modelo: { select: { nome: true } } } },
      cobrancas: { orderBy: { criadoEm: "desc" } },
    },
  });
  if (!n) notFound();
  const [modelos, base, checkout] = await Promise.all([db.modelo.findMany({ where: { ativo: true, NOT: [{ slug: { startsWith: "brd-tema-" } }, { slug: { startsWith: "brd-premium-" } }] }, orderBy: { atualizadoEm: "desc" }, select: { id: true, nome: true, html: true } }), enderecoPublico(), ativo("checkout")]);
  const padrao = new Set<string>(VARIAVEIS.map((v) => v.id));
  const listaModelos = [...temas.map((m) => ({ id: m.id, nome: m.nome, extras: marcacoes(m.html).filter((v) => !padrao.has(v)), defaults: m.defaults, categoria: m.categoria })), ...modelos.map((m) => ({ id: m.id, nome: m.nome, extras: marcacoes(m.html).filter((v) => !padrao.has(v)) }))];
  const mensagens = n.eventos.filter((e) => e.tipo === "MENSAGEM_ENVIADA" || e.tipo === "RESPOSTA_RECEBIDA");
  const ultimas = mensagens.slice(0, 3).reverse();
  const etapaIdx = ordemEtapa(n.etapa);

  return (
    <>
      <Link href="/esteira" className="mb-5 inline-flex items-center gap-1 text-[13px] font-medium text-tinta-3 hover:text-tinta">
        ← Esteira
      </Link>

      {/* topo */}
      <section className="caixa mb-6 overflow-hidden">
        <div className="flex flex-wrap items-start gap-5 p-6">
          <Avatar nome={n.nome} tamanho={68} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-[28px] leading-tight sm:text-[32px]">{n.nome}</h1>
              <SeloEtapa etapa={n.etapa} nome={NOME_ETAPA[n.etapa as Etapa] ?? n.etapa} />
            </div>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] text-tinta-3">
              {n.categoria && <span>{n.categoria}</span>}
              {n.cidade && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {n.cidade}
                </span>
              )}
              {n.nota !== null && (
                <span className="num inline-flex items-center gap-1 text-tinta-2">
                  <Star className="h-3.5 w-3.5 fill-current text-alerta" />
                  {n.nota.toLocaleString("pt-BR")}
                  {n.avaliacoes ? <span className="text-tinta-3">({n.avaliacoes})</span> : null}
                </span>
              )}
              {n.etapa === "DESCARTADO" && n.motivoDescarte && <span className="text-erro">{NOME_MOTIVO[n.motivoDescarte as Motivo]}</span>}
              {n.valorFechado ? <span className="num font-semibold text-ok">{brl(n.valorFechado)}</span> : null}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/conversas?n=${n.id}`} className="btn btn-acao">
              <Icone nome="conversas" /> Conversar
            </Link>
            <Gaveta rotulo="Gerar prévia" icone="previas" botao="btn btn-linha" titulo="Gerar prévia" descricao="Os dados do negócio entram sozinhos. Campos próprios do modelo aparecem abaixo.">
              <Form acao={criarPrevia.bind(null, n.id)} fecharAoSalvar>
                <CamposPrevia modelos={listaModelos} />
              </Form>
            </Gaveta>
            <Gaveta rotulo="Cobrar" icone="cobrar" botao="btn btn-linha" titulo={`Cobrar ${n.nome}`} descricao={checkout ? "O link sai pelo checkout ligado." : "Ligue um checkout em Conexões antes."}>
              <Form acao={novaCobranca} fecharAoSalvar className="flex flex-col gap-4">
                <input type="hidden" name="negocioId" value={n.id} />
                <input type="hidden" name="nomeCliente" value={n.nome} />
                <Campo rotulo="O que está cobrando">
                  <input name="titulo" className="campo" placeholder="Site profissional + domínio" required />
                </Campo>
                <div className="grid grid-cols-2 gap-3">
                  <Campo rotulo="Valor (R$)">
                    <input name="valor" className="campo num" inputMode="decimal" placeholder="497,00" required />
                  </Campo>
                  <Campo rotulo="Vale por (dias)">
                    <input name="validade" type="number" min={1} max={90} defaultValue={7} className="campo num" />
                  </Campo>
                </div>
                <Campo rotulo="E-mail do cliente" dica="Opcional.">
                  <input name="email" type="email" className="campo" />
                </Campo>
                <Enviar className="btn btn-acao btn-lg">Gerar link</Enviar>
              </Form>
            </Gaveta>
            <Gaveta rotulo="Mover" icone="esteira" botao="btn btn-linha" titulo="Mover de etapa" descricao="Normalmente o negócio anda sozinho. Use para corrigir.">
              <Form acao={mudarEtapa.bind(null, n.id)} fecharAoSalvar className="flex flex-col gap-4">
                <fieldset className="grid gap-2">
                  {ETAPAS.map((e) => (
                    <label key={e.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-linha px-4 py-3 has-[:checked]:border-acao has-[:checked]:bg-acao-suave">
                      <input type="radio" name="etapa" value={e.id} defaultChecked={e.id === n.etapa} className="accent-[var(--acao)]" />
                      <span>
                        <span className="block text-[14px] font-semibold">{e.nome}</span>
                        <span className="block text-[12px] text-tinta-3">{e.dica}</span>
                      </span>
                    </label>
                  ))}
                </fieldset>
                <div className="grid grid-cols-2 gap-3">
                  <Campo rotulo="Motivo (se descartar)">
                    <select name="motivo" defaultValue={n.motivoDescarte ?? ""} className="campo">
                      <option value="">—</option>
                      {MOTIVOS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nome}
                        </option>
                      ))}
                    </select>
                  </Campo>
                  <Campo rotulo="Valor (se fechado)">
                    <input name="valor" className="campo num" placeholder="R$" inputMode="decimal" defaultValue={n.valorFechado ? (n.valorFechado / 100).toFixed(2).replace(".", ",") : ""} />
                  </Campo>
                </div>
                <Enviar className="btn btn-acao btn-lg">Mover</Enviar>
              </Form>
            </Gaveta>
          </div>
        </div>
        {/* trilho das etapas */}
        <ol className="grid grid-cols-5 border-t border-linha" aria-label="Etapas">
          {ETAPAS.filter((e) => e.id !== "DESCARTADO").map((e, i) => {
            const feita = n.etapa !== "DESCARTADO" && i <= etapaIdx;
            return (
              <li key={e.id} className={`relative px-3 py-3 text-center text-[12px] font-semibold sm:text-[13px] ${feita ? "text-acao" : "text-tinta-3"}`}>
                <span className={`absolute inset-x-0 top-0 h-[3px] ${feita ? "bg-acao" : "bg-transparent"}`} />
                <span className="hidden sm:inline">{e.nome}</span>
                <span className="sm:hidden">{i + 1}</span>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          {/* conversa resumida */}
          <section className="caixa overflow-hidden">
            <header className="flex items-center justify-between gap-3 border-b border-linha px-5 py-3.5">
              <h2 className="text-[17px]">Conversa</h2>
              <Link href={`/conversas?n=${n.id}`} className="link text-[13px] font-semibold">
                {mensagens.length ? `Abrir (${mensagens.length})` : "Começar"}
              </Link>
            </header>
            <div className="flex flex-col gap-1.5 bg-rebaixo/40 px-5 py-4">
              {ultimas.length ? (
                ultimas.map((m) => (
                  <p key={m.id} className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-[14px] ${m.tipo === "MENSAGEM_ENVIADA" ? "self-end rounded-br-md bg-acao text-acao-texto" : "self-start rounded-bl-md border border-linha bg-superficie"}`}>
                    {m.texto}
                  </p>
                ))
              ) : (
                <p className="py-4 text-center text-[14px] text-tinta-3">Nenhuma mensagem ainda.</p>
              )}
            </div>
          </section>

          {/* prévias */}
          <section>
            <h2 className="mb-3 text-[17px]">Prévias</h2>
            {n.previas.length ? (
              <ul className="escalonado grid gap-4 sm:grid-cols-2">
                {n.previas.map((p) => {
                  const link = `${base}/p/${p.slug}`;
                  const vencida = p.expiraEm < new Date();
                  return (
                    <li key={p.id} className="caixa overflow-hidden">
                      <div className="relative h-[150px] overflow-hidden border-b border-linha bg-white">
                        <iframe src={`/p/${p.slug}`} title={`Prévia ${p.modelo.nome}`} sandbox="" loading="lazy" tabIndex={-1} className="pointer-events-none absolute left-0 top-0 h-[600px] w-[1440px] origin-top-left scale-[0.25] border-0" />
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-[14px] font-semibold">{p.modelo.nome}</p>
                          <span className={`selo ${p.status === "APROVADA" ? "selo-ok" : p.status === "ENVIADA" ? "selo-info" : p.status === "DESCARTADA" || vencida ? "selo-erro" : ""}`}>{vencida ? "vencida" : p.status.toLowerCase()}</span>
                        </div>
                        <p className="mt-1 text-[12px] text-tinta-3">
                          {p.visitas} {p.visitas === 1 ? "visita" : "visitas"}
                          {p.vistaEm && ` · última ${quando(p.vistaEm)}`}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          <a href={`/p/${p.slug}`} target="_blank" rel="noreferrer" className="btn btn-linha btn-sm">
                            <ExternalLink className="h-3.5 w-3.5" /> Abrir
                          </a>
                          <Copiar texto={link} rotulo="Copiar link" />
                          {p.status === "RASCUNHO" && (
                            <form action={statusPrevia.bind(null, p.id, "ENVIADA")}>
                              <button className="btn btn-fantasma btn-sm">Enviada</button>
                            </form>
                          )}
                          {p.status !== "DESCARTADA" && (
                            <form action={statusPrevia.bind(null, p.id, "DESCARTADA")}>
                              <button className="btn btn-fantasma btn-sm text-tinta-3">Descartar</button>
                            </form>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="caixa px-5 py-6 text-[14px] text-tinta-3">Nenhuma prévia. Use “Gerar prévia” lá em cima.</p>
            )}
          </section>

          {/* linha do tempo */}
          <section>
            <h2 className="mb-3 text-[17px]">Linha do tempo</h2>
            <div className="caixa p-5">
              <Form acao={anotar.bind(null, n.id)} limparAoSalvar className="mb-5 flex gap-2">
                <input name="texto" className="campo" placeholder="Anotar algo sobre este negócio" />
                <Enviar className="btn btn-linha">Anotar</Enviar>
              </Form>
              <ol className="relative ml-1.5 border-l border-linha">
                {n.eventos.map((e) => (
                  <li key={e.id} className="relative pb-4 pl-6 last:pb-0">
                    <span className={`absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-superficie ${e.tipo === "PAGAMENTO" ? "bg-ok" : e.tipo === "RESPOSTA_RECEBIDA" ? "bg-acao" : "bg-linha-forte"}`} />
                    <p className="text-[14px] leading-snug">{e.texto}</p>
                    <p className="mt-0.5 text-[12px] text-tinta-3">
                      {e.agenteNome ?? AGENTES[e.agente] ?? e.agente} · {dataHora(e.criadoEm)}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <section className="caixa p-5">
            <h2 className="mb-4 text-[17px]">Contato</h2>
            <ul className="flex flex-col gap-3.5 text-[14px]">
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-tinta-3" />
                <span>
                  <span className="num block">{n.whatsapp ? numeroLegivel(n.whatsapp) : "Sem WhatsApp"}</span>
                  {n.semWhatsapp && <span className="text-[12px] text-erro">número sem WhatsApp</span>}
                  {n.telefone && n.telefone !== n.whatsapp && <span className="block text-[12px] text-tinta-3">Maps: {n.telefone}</span>}
                </span>
              </li>
              {n.endereco && (
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-tinta-3" />
                  {n.linkMaps ? (
                    <a href={n.linkMaps} target="_blank" rel="noreferrer" className="hover:underline">
                      {n.endereco}
                    </a>
                  ) : (
                    <span>{n.endereco}</span>
                  )}
                </li>
              )}
              <li className="flex items-start gap-3">
                <Globe className="mt-0.5 h-4 w-4 shrink-0 text-tinta-3" />
                {n.site ? (
                  <a href={n.site} target="_blank" rel="noreferrer" className="truncate hover:underline">
                    {n.site.replace(/^https?:\/\//, "")}
                  </a>
                ) : (
                  <span className="font-semibold text-ok">Sem site: oportunidade</span>
                )}
              </li>
              {n.instagram && (
                <li className="flex items-start gap-3">
                  <AtSign className="mt-0.5 h-4 w-4 shrink-0 text-tinta-3" />
                  <span>{n.instagram}</span>
                </li>
              )}
            </ul>
            {n.observacoes && <p className="mt-4 rounded-xl bg-rebaixo/60 px-3.5 py-3 text-[14px] text-tinta-2">{n.observacoes}</p>}
          </section>

          {n.cobrancas.length > 0 && (
            <section className="caixa overflow-hidden">
              <h2 className="border-b border-linha px-5 py-3.5 text-[17px]">Cobranças</h2>
              <ul className="divide-y divide-linha">
                {n.cobrancas.map((c) => (
                  <li key={c.id} className="flex items-center gap-3 px-5 py-3 text-[14px]">
                    <span className="min-w-0 flex-1 truncate">{c.titulo}</span>
                    <span className="num">{brl(c.valor)}</span>
                    <span className={`selo ${c.status === "PAGA" ? "selo-ok" : c.status === "CANCELADA" ? "selo-erro" : "selo-alerta"}`}>{c.status.toLowerCase()}</span>
                    <Copiar texto={`${base}/pagar/${c.token}`} rotulo="Link" />
                  </li>
                ))}
              </ul>
            </section>
          )}

          <Expansivel icone="usuario" titulo="Editar dados" resumo="Nome, WhatsApp, cidade, endereço, site">
            <Form acao={editarNegocio.bind(null, n.id)} fecharAoSalvar className="grid gap-3">
              <Campo rotulo="Nome">
                <input name="nome" defaultValue={n.nome} className="campo" required />
              </Campo>
              <div className="grid gap-3 sm:grid-cols-2">
                <Campo rotulo="WhatsApp">
                  <input name="whatsapp" defaultValue={n.whatsapp ?? ""} className="campo num" />
                </Campo>
                <Campo rotulo="Cidade">
                  <CampoCidade valor={n.cidade ?? ""} />
                </Campo>
                <Campo rotulo="Categoria">
                  <input name="categoria" defaultValue={n.categoria ?? ""} className="campo" />
                </Campo>
                <Campo rotulo="Instagram">
                  <input name="instagram" defaultValue={n.instagram ?? ""} className="campo" />
                </Campo>
              </div>
              <Campo rotulo="Endereço">
                <input name="endereco" defaultValue={n.endereco ?? ""} className="campo" />
              </Campo>
              <Campo rotulo="Site">
                <input name="site" defaultValue={n.site ?? ""} className="campo" />
              </Campo>
              <Campo rotulo="Observações">
                <textarea name="observacoes" defaultValue={n.observacoes ?? ""} rows={3} className="campo" />
              </Campo>
              <div>
                <Enviar>Salvar</Enviar>
              </div>
            </Form>
          </Expansivel>

          <Expansivel icone="escudo" titulo="Zona de perigo" resumo="Apagar o negócio e tudo dele" acao="Abrir">
            <form action={apagarNegocio.bind(null, n.id)}>
              <Confirmar texto="Apagar de vez? Clique de novo">Apagar negócio</Confirmar>
            </form>
          </Expansivel>
          <p className="text-[12px] text-tinta-3">
            Origem: {n.origem} · criado {dataHora(n.criadoEm)}
          </p>
        </div>
      </div>
    </>
  );
}
