import Link from "next/link";

import { SiteFooter } from "../_components/site-footer";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "var(--rz-vh)",
        background: "#07080a",
        display: "flex",
        flexDirection: "column",
        fontFamily: "var(--font-sans)",
      }}
    >
      <div
        className="rz-pad"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: "40px",
          paddingBottom: "40px",
        }}
      >
        <Link
          href="/"
          aria-label="Rezuma"
          style={{ display: "flex", alignItems: "center", marginBottom: "52px", textDecoration: "none" }}
        >
          <img src="/logo.svg" alt="Rezuma" style={{ display: "block", height: "26px", width: "auto" }} />
        </Link>

        <div style={{ width: "100%", maxWidth: "360px" }}>
          {children}
        </div>
      </div>

      <SiteFooter compacto />
    </div>
  );
}
