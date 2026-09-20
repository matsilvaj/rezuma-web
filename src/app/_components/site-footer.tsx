import Link from "next/link";

const S = {
  border: "rgba(237,237,234,0.07)",
  textS:  "rgba(237,237,234,0.40)",
  textT:  "rgba(237,237,234,0.18)",
  mono:   "var(--font-mono)",
} as const;

const LINKS = [
  { href: "/sobre",       label: "sobre" },
  { href: "/faq",         label: "perguntas frequentes" },
  { href: "/contato",     label: "contato" },
  { href: "/privacidade", label: "privacidade" },
  { href: "/termos",      label: "termos" },
];

/**
 * Rodapé compartilhado pela landing e pelas páginas de conteúdo, para os
 * links institucionais e o aviso legal existirem em um lugar só.
 */
export function SiteFooter({ viewerName }: { viewerName?: string | null }) {
  return (
    <footer className="rz-pad" style={{ borderTop: `1px solid ${S.border}`, maxWidth: "900px", margin: "0 auto", paddingTop: "28px", paddingBottom: "40px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px", flexWrap: "wrap" }}>
        <img src="/logo.svg" alt="Rezuma" style={{ display: "block", height: "21px", width: "auto", opacity: 0.35 }} />
        <div style={{ display: "flex", gap: "24px" }}>
          {viewerName ? (
            <Link href="/dashboard" style={{ fontSize: "12px", color: S.textS, textDecoration: "none" }}>
              Olá, {viewerName}
            </Link>
          ) : (
            <>
              <Link href="/login"    style={{ fontSize: "12px", color: S.textT, textDecoration: "none" }}>Entrar</Link>
              <Link href="/register" style={{ fontSize: "12px", color: S.textT, textDecoration: "none" }}>Criar conta</Link>
            </>
          )}
        </div>
      </div>

      <nav style={{ display: "flex", flexWrap: "wrap", gap: "18px", marginTop: "22px" }}>
        {LINKS.map(l => (
          <Link key={l.href} href={l.href} style={{ fontFamily: S.mono, fontSize: "11px", color: S.textT, textDecoration: "none" }}>
            {l.label}
          </Link>
        ))}
      </nav>

      <div style={{ textAlign: "center", marginTop: "28px" }}>
        <p style={{ fontSize: "11px", color: S.textT, lineHeight: 1.8, maxWidth: "560px", margin: "0 auto 14px" }}>
          Os resumos são feitos a partir de documentos públicos divulgados pelas
          próprias companhias e fundos. Não são recomendação de investimento,
          análise de valores mobiliários nem consultoria financeira. Toda
          decisão é sua.
        </p>
        <p style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, letterSpacing: "0.3px", margin: 0 }}>
          © {new Date().getFullYear()} Rezuma. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
