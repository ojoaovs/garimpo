import { temas } from "@/lib/temas";
import Link from "next/link";

import { Copiar } from "@/components/cliente";
import { Icone } from "@/components/icones";
import { Cabecalho, Caixa, quando, Vazio } from "@/components/ui";
import { enderecoPublico } from "@/lib/config";
import { db } from "@/lib/db";
import { marcacoes } from "@/lib/modelos";

export const metadata = { title: "Prévias e modelos" };

export default async function Previas() {
  const [modelos, previas, base] = await Promise.all([
    db.modelo.findMany({ orderBy: { atualizadoEm: "desc" }, include: { _count: { select: { previas: true } } } }),
    db.previa.findMany({ orderBy: { criadoEm: "desc" }, take: 40, include: { negocio: { select: { id: true, nome: true } }, modelo: { select: { nome: true } } } }),
    enderecoPublico(),
  ]);
  return (
    <>
      <Cabecalho sobre="Material" titulo="Prévias e modelos" sub="Qualquer página HTML vira modelo. Cada prévia é o modelo preenchido com os dados de um negócio, num link próprio." acoes={<Link href="/previas/modelos/novo" className="btn btn-acao"><Icone nome="upload" /> Importar modelo</Link>} />

      <h2 className="mb-4 text-[19px]">Biblioteca Bradesign · {temas.length} temas</h2>
      <div className="mb-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{temas.filter((_, i) => i % 3 === 0).map((t) => <div key={t.id} className="caixa p-4"><h3 className="mb-3 font-semibold">{t.nicho}</h3><div className="flex flex-wrap gap-2">{temas.filter(x => x.nicho === t.nicho).map(x => <a key={x.id} href={`/ver-modelo/${x.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-linha btn-sm">{x.estilo}</a>)}</div></div>)}</div>
      <h2 className="mb-4 text-[19px]">Modelos importados</h2>
      {modelos.length ? (
        <ul className="escalonado grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {modelos.map((m) => {
            const vars = marcacoes(m.html);
            return (
              <li key={m.id} className="caixa caixa-viva relative flex flex-col overflow-hidden">
                <div className="relative h-[190px] overflow-hidden border-b border-linha bg-white">
                  <iframe src={`/ver-modelo/${m.id}`} title={`Miniatura de ${m.nome}`} sandbox="" loading="lazy" tabIndex={-1} className="pointer-events-none absolute left-0 top-0 h-[680px] w-[1440px] origin-top-left scale-[0.27] border-0 bg-white" />
                </div>
                <div className="flex flex-1 flex-col gap-1 p-4">
                  <Link href={`/previas/modelos/${m.id}`} className="display text-[17px] after:absolute after:inset-0 after:content-['']">
                    {m.nome}
                  </Link>
                  <p className="text-[13px] text-tinta-3">
                    {vars.length} {vars.length === 1 ? "variável" : "variáveis"} · {m._count.previas} {m._count.previas === 1 ? "prévia" : "prévias"}
                    {!m.ativo && " · desligado"}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <Vazio titulo="Nenhum modelo" texto="Importe o .html de uma página que você já fez. O sistema acha nome, telefone e endereço e transforma em variáveis." acao={<Link href="/previas/modelos/novo" className="btn btn-acao btn-sm">Importar modelo</Link>} />
      )}

      <h2 className="mb-4 mt-12 text-[19px]">Prévias geradas</h2>
      <Caixa corpo="overflow-x-auto">
        {previas.length ? (
          <table className="tabela min-w-[720px]">
            <thead>
              <tr>
                <th>Negócio</th>
                <th>Modelo</th>
                <th>Status</th>
                <th>Visitas</th>
                <th>Criada</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {previas.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/negocios/${p.negocio.id}`} className="font-medium hover:underline">
                      {p.negocio.nome}
                    </Link>
                  </td>
                  <td className="text-tinta-2">{p.modelo.nome}</td>
                  <td>
                    <span className={`selo ${p.status === "APROVADA" ? "selo-ok" : p.status === "ENVIADA" ? "selo-info" : p.status === "DESCARTADA" || p.expiraEm < new Date() ? "selo-erro" : ""}`}>{p.expiraEm < new Date() ? "vencida" : p.status.toLowerCase()}</span>
                  </td>
                  <td className="num">{p.visitas}</td>
                  <td className="text-tinta-3">{quando(p.criadoEm)}</td>
                  <td className="text-right">
                    <span className="inline-flex gap-2">
                      <a href={`/p/${p.slug}`} target="_blank" rel="noreferrer" className="btn btn-linha btn-sm">
                        Abrir
                      </a>
                      <Copiar texto={`${base}/p/${p.slug}`} rotulo="Link" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="p-4 text-[14px] text-tinta-3 sm:p-5">Gere a primeira prévia dentro de um negócio da esteira.</p>
        )}
      </Caixa>
    </>
  );
}
