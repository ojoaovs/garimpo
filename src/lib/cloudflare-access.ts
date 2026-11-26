import "server-only";

// Nunca envia as credenciais do Access a outros hosts ou por HTTP.
export function cloudflareHeaders(base: string, host: "rastro.bradesign.online" | "zap.bradesign.online"): Record<string, string> {
  const url = new URL(base);
  if (url.protocol !== "https:" || url.hostname !== host || url.port || url.username || url.password) return {};
  const id = process.env.CF_ACCESS_CLIENT_ID?.trim();
  const secret = process.env.CF_ACCESS_CLIENT_SECRET?.trim();
  if (!id || !secret) throw new Error("Credenciais Cloudflare Access não configuradas.");
  return { "CF-Access-Client-Id": id, "CF-Access-Client-Secret": secret };
}
