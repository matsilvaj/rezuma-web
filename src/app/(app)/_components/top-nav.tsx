"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/assets",    label: "ativos"     },
  { href: "/dashboard", label: "relatórios" },
  { href: "/settings",  label: "conta"      },
];

export function AppTopNav() {
  const pathname = usePathname();

  return (
    <header
      className="rz-pad rz-topnav"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        background: "#07080a",
        borderBottom: "1px solid rgba(237,237,234,0.07)",
        display: "flex",
        alignItems: "center",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        aria-label="Rezuma"
        className="rz-topnav-logo"
        style={{ display: "flex", alignItems: "center", gap: "9px", textDecoration: "none" }}
      >
        <img src="/logo.svg" alt="Rezuma" style={{ display: "block", height: "23px", width: "auto" }} />
      </Link>

      {/* Nav, centered */}
      <nav className="rz-topnav-nav">
        {NAV.map(({ href, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "6px 12px",
                borderRadius: "6px",
                textDecoration: "none",
                fontFamily: "var(--font-sans)",
                fontSize: "13px",
                fontWeight: active ? 500 : 400,
                color: active ? "#ededea" : "rgba(237,237,234,0.40)",
                background: "transparent",
              }}
            >
              {label}
              {active && (
                <span
                  aria-hidden="true"
                  style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#5eb88a", flexShrink: 0 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <form action="/api/auth/signout" method="post">
        <button
          type="submit"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "12px",
            color: "rgba(237,237,234,0.22)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "6px 0",
          }}
        >
          sair
        </button>
      </form>
    </header>
  );
}
