"use client";

import { useState } from "react";

import { Enviar } from "@/components/cliente";

/** Escolhe o modelo e preenche as variáveis próprias dele (as do negócio já vêm sozinhas). */
export function CamposPrevia({ modelos }: { modelos: { id: string; nome: string; extras: string[] }[] }) {
  const [id, setId] = useState(modelos[0]?.id ?? "");
  const m = modelos.find((x) => x.id === id);
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
      {m?.extras.map((v) => (
        <label key={v} className="block">
          <span className="mb-1 block text-[13px] text-tinta-2">
            <code className="kbd">{`{{${v}}}`}</code>
          </span>
          <input name={`v_${v}`} className="campo" />
        </label>
      ))}
      <div>
        <Enviar className="btn btn-acao btn-sm">Gerar prévia</Enviar>
      </div>
    </div>
  );
}
