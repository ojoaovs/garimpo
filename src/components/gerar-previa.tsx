"use client";

import { useState } from "react";

import { Enviar } from "@/components/cliente";

/** Escolhe o modelo e preenche as variáveis próprias dele (as do negócio já vêm sozinhas). */
export function CamposPrevia({ modelos }: { modelos: { id: string; nome: string; extras: string[]; defaults?: Record<string, string>; categoria?: string }[] }) {
  const [id, setId] = useState(modelos[0]?.id ?? "");
  const m = modelos.find((x) => x.id === id);
  const categorias = [...new Set(modelos.map(x => x.categoria ?? "Modelos importados"))];
  const labels: Record<string, string> = { horarios_disponiveis: "Horários disponíveis (data e hora)", datas_disponiveis: "Datas disponíveis", itens_catalogo: "Itens do catálogo / encarte", validade_ofertas: "Validade das ofertas", titulo_principal: "Título principal", subtitulo_principal: "Descrição principal", titulo_servicos: "Título da seção de serviços", titulo_contato: "Título de contato", foto_capa: "Foto de capa (URL HTTPS)", foto_1: "Foto do serviço 1 (URL HTTPS)", foto_2: "Foto do serviço 2 (URL HTTPS)", foto_3: "Foto do serviço 3 (URL HTTPS)", servico_1: "Serviço 1", servico_2: "Serviço 2", servico_3: "Serviço 3", descricao_1: "Descrição do serviço 1", descricao_2: "Descrição do serviço 2", descricao_3: "Descrição do serviço 3" };
  if (!modelos.length) return <p className="text-[14px] text-tinta-3">Nenhum modelo ainda. Importe um em Prévias e modelos.</p>;
  return (
    <div className="flex flex-col gap-3">
      <label className="text-[13px] font-semibold" htmlFor="modelo-previa">Direção de arte</label>
      <select id="modelo-previa" name="modeloId" value={id} onChange={(e) => setId(e.target.value)} className="campo">
        {categorias.map(c => <optgroup key={c} label={c}>{modelos.filter(x => (x.categoria ?? "Modelos importados") === c).map(x => <option key={x.id} value={x.id}>{x.nome}</option>)}</optgroup>)}
      </select>
      {id && <div className="relative h-[200px] overflow-hidden rounded-xl border border-linha bg-white"><iframe key={id} src={`/ver-modelo/${encodeURIComponent(id)}`} title={m?.nome || "Tema selecionado"} sandbox="" className="pointer-events-none absolute left-0 top-0 h-[780px] w-[1440px] origin-top-left scale-[0.29] border-0" tabIndex={-1} /></div>}
      {id && <a href={`/ver-modelo/${encodeURIComponent(id)}`} target="_blank" rel="noopener noreferrer" className="btn btn-linha btn-sm">Visualizar tema antes de gerar</a>}
      {!!m?.extras.length && <details className="rounded-xl border border-linha p-3" key={id}><summary className="cursor-pointer font-semibold text-[14px]">Personalizar textos e fotos (opcional)</summary><p className="my-3 text-[13px] text-tinta-3">Use informações confirmadas e imagens que você tem autorização para publicar. Os campos vazios mantêm os textos e fotos ilustrativas do tema.</p><div className="grid gap-3">{m.extras.map((v) => (
        <label key={v} className="block">
          <span className="mb-1 block text-[13px] text-tinta-2">
            {labels[v] ?? v}
          </span>
          {["horarios_disponiveis", "datas_disponiveis", "itens_catalogo"].includes(v) ? <><textarea name={`v_${v}`} className="campo" rows={5} maxLength={2000} placeholder={v === "horarios_disponiveis" ? "2027-01-15 09:00\n2027-01-15 10:00" : v === "datas_disponiveis" ? "2027-01-15, 2027-01-16" : "Produto|Categoria|Preço|Tamanhos separados por vírgula|Detalhe"} /><span className="text-[12px] text-tinta-3">{v === "itens_catalogo" ? "Um item por linha. Preço e tamanhos opcionais; informe somente dados reais. Sem cadastro, exemplos sem preço são exibidos." : "Informe somente datas ou horários confirmados. Sem cadastro, a página solicita uma consulta, não confirma disponibilidade."}</span></> : <input name={`v_${v}`} type={v === "validade_ofertas" ? "date" : "text"} className="campo" placeholder={v.startsWith("foto_") ? "https://... (opcional)" : m.defaults?.[v]} maxLength={2000} />}
        </label>
      ))}</div></details>}
      <div>
        <Enviar className="btn btn-acao btn-sm">Gerar prévia</Enviar>
      </div>
    </div>
  );
}
