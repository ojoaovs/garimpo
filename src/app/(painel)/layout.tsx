import { redirect } from "next/navigation";

import { Menu } from "@/components/menu";
import { configGeral, resumoIntegracoes } from "@/lib/config";
import { db } from "@/lib/db";
import { exigirUsuario, fecharSessao } from "@/lib/sessao";

export const dynamic = "force-dynamic";

async function sair() {
  "use server";
  await fecharSessao();
  redirect("/entrar");
}

export default async function LayoutPainel({ children }: { children: React.ReactNode }) {
  const usuario = await exigirUsuario();
  const [geral, resumo, naoLidas] = await Promise.all([
    configGeral(),
    resumoIntegracoes(),
    db.negocio.count({ where: { etapa: "RESPONDEU", conversaPausada: false } }),
  ]);
  const grupos = [
    {
      nome: "Operação",
      itens: [
        { href: "/", nome: "Visão geral", icone: "visao" as const },
        { href: "/esteira", nome: "Esteira", icone: "esteira" as const },
        { href: "/rastro", nome: "Rastro", icone: "rastro" as const },
        { href: "/conversas", nome: "Conversas", conta: naoLidas, icone: "conversas" as const },
      ],
    },
    {
      nome: "Material",
      itens: [
        { href: "/previas", nome: "Prévias e modelos", icone: "previas" as const },
        { href: "/skills", nome: "Skills dos agentes", icone: "skills" as const },
        { href: "/lista-negra", nome: "Lista negra", icone: "lista" as const },
      ],
    },
    { nome: "Dinheiro", itens: [{ href: "/cobrancas", nome: "Cobranças", icone: "cobrancas" as const }] },
    {
      nome: "Sistema",
      itens: [
        { href: "/conexoes", nome: "Conexões", icone: "conexoes" as const },
        { href: "/chaves", nome: "API e chaves", icone: "chaves" as const },
        { href: "/conta", nome: "Conta e sistema", icone: "conta" as const },
      ],
    },
  ];
  return (
    <div className="min-h-[100svh]">
      <Menu nomeSistema={geral.nomeSistema} usuario={usuario.nome} email={usuario.email} grupos={grupos} sair={sair} conexoes={{ checkout: !!resumo.checkout?.ativo, whatsapp: !!resumo.whatsapp?.ativo, rastro: !!resumo.rastro?.ativo, email: !!resumo.email?.ativo }} />
      <div className="conteudo-painel">
        <main className="mx-auto w-full max-w-[1240px] px-4 pb-24 pt-7 sm:px-10 sm:pt-10">{children}</main>
      </div>
    </div>
  );
}
