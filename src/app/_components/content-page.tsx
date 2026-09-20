import Link from "next/link";

import { SiteFooter } from "./site-footer";

/**
 * Casca das páginas de texto: privacidade, termos, sobre, perguntas e
 * contato. Barra simples no topo, coluna estreita para a leitura não ficar
 * larga demais, e o mesmo rodapé da landing.
 */
export function ContentPage({
  titulo,
  resumo,
  atualizado,
  children,
}: {
  titulo: string;
  resumo?: string;
  atualizado?: string;
  children: React.ReactNode;
}) {
  return (
    <main style={{ background: "#07080a", minHeight: "var(--rz-vh)", display: "flex", flexDirection: "column" }}>
      <header
        className="rz-pad"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          maxWidth: "900px",
          width: "100%",
          margin: "0 auto",
          paddingTop: "22px",
          paddingBottom: "22px",
        }}
      >
        <Link href="/" aria-label="Rezuma">
          <img src="/logo.svg" alt="Rezuma" style={{ display: "block", height: "23px", width: "auto" }} />
        </Link>
        <Link
          href="/"
          style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "rgba(237,237,234,0.35)", textDecoration: "none" }}
        >
          voltar ao início
        </Link>
      </header>

      <div
        className="rz-pad"
        style={{ flex: 1, maxWidth: "760px", width: "100%", margin: "0 auto", paddingTop: "32px", paddingBottom: "72px" }}
      >
        <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "30px", fontWeight: 700, color: "#ededea", letterSpacing: "-1.2px", lineHeight: 1.2, margin: "0 0 14px" }}>
          {titulo}
        </h1>

        {resumo && (
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "15px", color: "rgba(237,237,234,0.55)", lineHeight: 1.8, margin: "0 0 10px" }}>
            {resumo}
          </p>
        )}

        {atualizado && (
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "rgba(237,237,234,0.22)", letterSpacing: "0.3px", margin: 0 }}>
            atualizado em {atualizado}
          </p>
        )}

        <div className="rz-prosa">{children}</div>
      </div>

      <SiteFooter />
    </main>
  );
}
