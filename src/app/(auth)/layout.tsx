import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "var(--rz-vh)",
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
        style={{ display: "flex", alignItems: "center", marginBottom: "52px", textDecoration: "none" }}
      >
        <img src="/logo.svg" alt="Rezuma" style={{ display: "block", height: "26px", width: "auto" }} />
      </Link>

      <div style={{ width: "100%", maxWidth: "360px" }}>
        {children}
      </div>
    </div>
  );
}
