"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import type { Resultado } from "@/components/cliente";
import { enderecoPublico, instalado, salvarGeral } from "@/lib/config";
import { aleatorio, conferirSenha, hashSenha, sha256 } from "@/lib/cripto";
import { db } from "@/lib/db";
import { EmailIndisponivel, enviarEmail } from "@/lib/email";
import { semear } from "@/lib/semente";
import { abrirSessao } from "@/lib/sessao";

const senhaForte = z.string().min(8, "A senha precisa de 8 caracteres ou mais.").max(200);

const tentativas = new Map<string, { n: number; ate: number }>();
function freio(chave: string) {
  const agora = Date.now();
  const t = tentativas.get(chave);
  if (t && t.ate > agora && t.n >= 8) return false;
  tentativas.set(chave, t && t.ate > agora ? { n: t.n + 1, ate: t.ate } : { n: 1, ate: agora + 15 * 60_000 });
  return true;
}

export async function instalar(_: Resultado, f: FormData): Promise<Resultado> {
  if (await instalado()) return { ok: false, mensagem: "Este sistema já foi instalado. Entre com a sua conta." , ir: "/entrar" };
  const r = z
    .object({
      nome: z.string().trim().min(2, "Diga seu nome.").max(80),
      email: z.string().trim().toLowerCase().email("E-mail inválido."),
      senha: senhaForte,
      sistema: z.string().trim().max(40).optional(),
    })
    .safeParse(Object.fromEntries(f));
  if (!r.success) return { ok: false, mensagem: r.error.issues[0].message };
  const u = await db.usuario.create({ data: { nome: r.data.nome, email: r.data.email, senhaHash: await hashSenha(r.data.senha) } });
  if (r.data.sistema) await salvarGeral({ nomeSistema: r.data.sistema });
  await semear();
  await abrirSessao(u.id, u.versaoSessao);
  redirect("/instalar/checkout");
}

export async function entrar(_: Resultado, f: FormData): Promise<Resultado> {
  const email = String(f.get("email") ?? "").trim().toLowerCase();
  const senha = String(f.get("senha") ?? "");
  if (!freio(`login:${email}`)) return { ok: false, mensagem: "Muitas tentativas. Espere 15 minutos." };
  const u = await db.usuario.findUnique({ where: { email } });
  if (!u || !(await conferirSenha(senha, u.senhaHash))) return { ok: false, mensagem: "E-mail ou senha não conferem." };
  await abrirSessao(u.id, u.versaoSessao);
  tentativas.delete(`login:${email}`);
  redirect("/");
}

export async function pedirNovaSenha(_: Resultado, f: FormData): Promise<Resultado> {
  const email = String(f.get("email") ?? "").trim().toLowerCase();
  const neutro: Resultado = { ok: true, mensagem: "Se esse e-mail tem conta, o link chegou. Vale por 1 hora." };
  if (!freio(`senha:${email}`)) return neutro;
  const u = await db.usuario.findUnique({ where: { email } });
  if (!u) return neutro;
  const token = aleatorio(32);
  await db.tokenSenha.create({ data: { usuarioId: u.id, hash: sha256(token), expiraEm: new Date(Date.now() + 3_600_000) } });
  const link = `${await enderecoPublico()}/redefinir/${token}`;
  try {
    await enviarEmail(u.email, "Trocar a senha", `<p>Para criar uma senha nova, abra o link (vale por 1 hora):</p><p><a href="${link}">${link}</a></p><p>Se não foi você, ignore este e-mail.</p>`);
  } catch (e) {
    if (e instanceof EmailIndisponivel) {
      // Sem e-mail configurado: o link vai para o terminal de quem roda o sistema.
      if (process.env.NODE_ENV !== "production") console.log(`[senha] Link local: ${link}`);
      return neutro;
    }
    console.error("[senha] Falha no envio de e-mail.");
    return { ok: false, mensagem: "Não consegui enviar o e-mail. Confira o Resend em Conexões." };
  }
  return neutro;
}

export async function redefinirSenha(_: Resultado, f: FormData): Promise<Resultado> {
  const token = String(f.get("token") ?? "");
  const r = senhaForte.safeParse(String(f.get("senha") ?? ""));
  if (!r.success) return { ok: false, mensagem: r.error.issues[0].message };
  const t = await db.tokenSenha.findUnique({ where: { hash: sha256(token) } });
  if (!t || t.usadoEm || t.expiraEm < new Date()) return { ok: false, mensagem: "Link vencido ou já usado. Peça outro." };
  const u = await db.usuario.update({ where: { id: t.usuarioId }, data: { senhaHash: await hashSenha(r.data), versaoSessao: { increment: 1 } } });
  await db.tokenSenha.update({ where: { id: t.id }, data: { usadoEm: new Date() } });
  await abrirSessao(u.id, u.versaoSessao);
  redirect("/");
}
