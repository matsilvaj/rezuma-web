import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Origens com que o front conversa: o Supabase (login) e a nossa API.
// Qualquer outro destino de fetch é recusado pelo navegador.
const conecta = [
  "'self'",
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_API_URL,
].filter(Boolean).join(" ");

/**
 * Content Security Policy.
 *
 * 'unsafe-inline' em script e style é o custo de não usar nonce: o Next injeta
 * scripts inline de inicialização e o projeto inteiro estiliza com style={}.
 * Mesmo assim a política vale muito: bloqueia script de outro domínio, envio
 * de dados para destino desconhecido, embutir o site em iframe e plugins.
 * 'unsafe-eval' só em desenvolvimento, onde o recarregamento do Next precisa.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src ${conecta}${isDev ? " ws: wss:" : ""}`,
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Dois anos de HTTPS obrigatório. Sem "preload" de propósito: entrar na
  // lista de preload dos navegadores é difícil de desfazer.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  // Não anuncia a versão do framework no cabeçalho de resposta.
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
