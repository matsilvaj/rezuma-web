"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/assets",    label: "ativos",      disabled: false },
  { href: "/dashboard", label: "relatórios",  disabled: false },
  { href: "/dividendos",label: "dividendos",  disabled: true  },
  { href: "/settings",  label: "conta",       disabled: false },
];

export function AppTopNav() {
  const pathname = usePathname();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        background: "#07080a",
        borderBottom: "1px solid rgba(237,237,234,0.07)",
        display: "flex",
        alignItems: "center",
        padding: "0 36px",
        height: "52px",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        aria-label="Rezuma"
        style={{ display: "flex", alignItems: "center", gap: "9px", textDecoration: "none", marginRight: "32px" }}
      >
        <img src="/logo.svg" alt="Rezuma" style={{ display: "block", height: "20px", width: "auto" }} />
      </Link>

      {/* Nav, centered */}
      <nav style={{ display: "flex", alignItems: "center", gap: "2px", flex: 1, justifyContent: "center" }}>
        {NAV.map(({ href, label, disabled }) => {
          const active = !disabled && (pathname === href || pathname.startsWith(href + "/"));
          if (disabled) {
            return (
              <span
                key={href}
                style={{
                  padding: "6px 12px",
                  fontFamily: "var(--font-sans)",
                  fontSize: "13px",
                  color: "rgba(237,237,234,0.18)",
                  cursor: "default",
                  userSelect: "none",
                }}
              >
                {label}
              </span>
            );
          }
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
