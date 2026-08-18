import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#07080a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        fontFamily: "var(--font-sans)",
      }}
    >
      <Link
        href="/"
        aria-label="Rezuma"
        style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "52px", textDecoration: "none" }}
      >
        <div aria-hidden="true" style={{ display: "flex", flexDirection: "column", gap: "5.5px" }}>
          <div style={{ width: "18px", height: "2px", background: "#ededea", borderRadius: "1px" }} />
          <div style={{ width: "11px", height: "2px", background: "#ededea", borderRadius: "1px" }} />
          <div style={{ width:  "6px", height: "2px", background: "#ededea", borderRadius: "1px" }} />
        </div>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: "15px", fontWeight: 700, color: "#ededea", letterSpacing: "-0.4px" }}>
          rezuma
        </span>
      </Link>

      <div style={{ width: "100%", maxWidth: "360px" }}>
        {children}
      </div>
    </div>
  );
}
