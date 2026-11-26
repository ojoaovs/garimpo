"use client";

import { useState } from "react";

import { Enviar } from "@/components/cliente";

/** Escolhe o modelo e preenche as variáveis próprias dele (as do negócio já vêm sozinhas). */
export function CamposPrevia({ modelos }: { modelos: { id: string; nome: string; extras: string[]; defaults?: Record<string, string> }[] }) {
  const [id, setId] = useState(modelos[0]?.id ?? "");
  const m = modelos.find((x) => x.id === id);
  const labels: Record<string, string> = { titulo_principal: "Título principal", subtitulo_principal: "Descrição principal", titulo_servicos: "Título da seção de serviços", titulo_contato: "Título de contato", foto_capa: "Foto de capa (URL HTTPS)", foto_1: "Foto do serviço 1 (URL HTTPS)", foto_2: "Foto do serviço 2 (URL HTTPS)", foto_3: "Foto do serviço 3 (URL HTTPS)", servico_1: "Serviço 1", servico_2: "Serviço 2", servico_3: "Serviço 3", descricao_1: "Descrição do serviço 1", descricao_2: "Descrição do serviço 2", descricao_3: "Descrição do serviço 3" };
  if (!modelos.length) return <p className="text-[14px] text-tinta-3">Nenhum modelo ainda. Importe um em Prévias e modelos.</p>;
  return (
    <div className="flex flex-col gap-3">
      <label className="text-[13px] font-semibold" htmlFor="modelo-previa">Direção de arte</label>
      <select id="modelo-previa" name="modeloId" value={id} onChange={(e) => setId(e.target.value)} className="campo">
        {modelos.map((x) => (
          <option key={x.id} value={x.id}>
            {x.nome}
          </option>
        ))}
      </select>
      {id && <div className="relative h-[200px] overflow-hidden rounded-xl border border-linha bg-white"><iframe key={id} src={`/ver-modelo/${encodeURIComponent(id)}`} title={m?.nome || "Tema selecionado"} sandbox="" className="pointer-events-none absolute left-0 top-0 h-[780px] w-[1440px] origin-top-left scale-[0.29] border-0" tabIndex={-1} /></div>}
      {id && <a href={`/ver-modelo/${encodeURIComponent(id)}`} target="_blank" rel="noopener noreferrer" className="btn btn-linha btn-sm">Visualizar tema antes de gerar</a>}
      {!!m?.extras.length && <details className="rounded-xl border border-linha p-3" key={id}><summary className="cursor-pointer font-semibold text-[14px]">Personalizar textos e fotos (opcional)</summary><p className="my-3 text-[13px] text-tinta-3">Use informações confirmadas e imagens que você tem autorização para publicar. Os textos vazios mantêm os padrões do tema.</p><div className="grid gap-3">{m.extras.map((v) => (
        <label key={v} className="block">
          <span className="mb-1 block text-[13px] text-tinta-2">
            {labels[v] ?? v}
          </span>
          <input name={`v_${v}`} className="campo" placeholder={m.defaults?.[v] || (v.startsWith("foto_") ? "https://..." : undefined)} maxLength={2000} />
        </label>
      ))}</div></details>}
      <div>
        <Enviar className="btn btn-acao btn-sm">Gerar prévia</Enviar>
      </div>
    </div>
  );
}
