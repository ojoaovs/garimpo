import type { NextConfig } from "next";

const config: NextConfig = {
  serverExternalPackages: ["better-sqlite3", "@prisma/adapter-better-sqlite3", "pg"],
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "no-referrer" },
      { key: "X-Frame-Options", value: "DENY" },
    ] },
    // Apenas as páginas HTML isoladas podem aparecer nas miniaturas do próprio painel.
    { source: "/ver-modelo/:id", headers: [{ key: "X-Frame-Options", value: "SAMEORIGIN" }] },
    { source: "/p/:slug", headers: [{ key: "X-Frame-Options", value: "SAMEORIGIN" }] },
    ];
  },
  // Permite rodar uma segunda cópia (testes) sem brigar com a pasta .next da principal.
  distDir: process.env.GARIMPO_DIST || ".next",
};

export default config;
