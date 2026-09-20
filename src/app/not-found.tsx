import Link from "next/link";

import { SiteFooter } from "./_components/site-footer";

const S = {
  textP: "#ededea",
  textS: "rgba(237,237,234,0.40)",
  textT: "rgba(237,237,234,0.22)",
  mono:  "var(--font-mono)",
  sans:  "var(--font-sans)",
} as const;

const ATALHOS = [
  { href: "/",         label: "início" },
  { href: "/dashboard", label: "meus relatórios" },
  { href: "/faq",      label: "perguntas frequentes" },
  { href: "/contato",  label: "contato" },
];

export default function NotFound() {
  return (
    <main style={{ background: "#07080a", minHeight: "var(--rz-vh)", display: "flex", flexDirection: "column" }}>
      <header className="rz-pad" style={{ maxWidth: "900px", width: "100%", margin: "0 auto", paddingTop: "22px", paddingBottom: "22px" }}>
        <Link href="/" aria-label="Rezuma">
          <img src="/logo.svg" alt="Rezuma" style={{ display: "block", height: "23px", width: "auto" }} />
        </Link>
      </header>

      <div className="rz-pad" style={{ flex: 1, maxWidth: "760px", width: "100%", margin: "0 auto", paddingTop: "48px", paddingBottom: "72px" }}>
        <p style={{ fontFamily: S.mono, fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: S.textT, margin: "0 0 18px" }}>
          erro 404
        </p>
        <h1 style={{ fontFamily: S.sans, fontSize: "30px", fontWeight: 700, color: S.textP, letterSpacing: "-1.2px", lineHeight: 1.25, margin: "0 0 14px" }}>
          Esta página não existe.
        </h1>
        <p style={{ fontFamily: S.sans, fontSize: "15px", color: S.textS, lineHeight: 1.8, margin: "0 0 28px", maxWidth: "460px" }}>
          O endereço pode ter mudado, ou o relatório que você procurava foi de um
          ativo que saiu da sua carteira.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {ATALHOS.map(a => (
            <Link
              key={a.href}
              href={a.href}
              style={{
                fontFamily: S.mono,
                fontSize: "11px",
                color: S.textS,
                textDecoration: "none",
                border: "1px solid rgba(237,237,234,0.10)",
                borderRadius: "7px",
                padding: "8px 14px",
              }}
            >
              {a.label}
            </Link>
          ))}
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
