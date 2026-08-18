"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { validateEmail } from "@/lib/validation";

const S = {
  label: {
    display: "block" as const,
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
    letterSpacing: "1.2px",
    color: "rgba(237,237,234,0.40)",
    textTransform: "uppercase" as const,
    marginBottom: "7px",
  },
  input: {
    width: "100%",
    background: "#0d0f11",
    border: "1px solid rgba(237,237,234,0.09)",
    borderRadius: "7px",
    padding: "10px 14px",
    fontFamily: "var(--font-sans)",
    fontSize: "14px",
    color: "#ededea",
    outline: "none",
    WebkitAppearance: "none" as const,
  } as React.CSSProperties,
  err: { fontSize: "11px", color: "rgba(220,80,80,0.85)", marginTop: "5px" } as React.CSSProperties,
};

export default function ForgotPasswordPage() {
  const [email,      setEmail]      = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [loading,    setLoading]    = useState(false);
  const [sent,       setSent]       = useState(false);
  const [focused,    setFocused]    = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validateEmail(email);
    if (err) { setEmailError(err); return; }
    setEmailError(null);
    setLoading(true);

    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "24px", fontWeight: 700, color: "#ededea", letterSpacing: "-0.8px", marginBottom: "14px" }}>
          Verifique seu e-mail
        </h1>
        <p style={{ fontSize: "14px", color: "rgba(237,237,234,0.40)", lineHeight: 1.7, marginBottom: "28px" }}>
          Se esse e-mail estiver cadastrado, você receberá um link para redefinir sua senha em breve.
        </p>
        <Link href="/login" style={{ fontSize: "13px", color: "rgba(237,237,234,0.50)", textDecoration: "underline", textUnderlineOffset: "3px" }}>
          Voltar para o login
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "24px", fontWeight: 700, color: "#ededea", letterSpacing: "-0.8px", marginBottom: "6px" }}>
        Esqueceu a senha?
      </h1>
      <p style={{ fontFamily: "var(--font-sans)", fontSize: "14px", color: "rgba(237,237,234,0.40)", lineHeight: 1.6 }}>
        Informe seu e-mail e enviaremos um link para redefinir sua senha.
      </p>

      <form onSubmit={handleSubmit} noValidate style={{ marginTop: "32px", display: "flex", flexDirection: "column", gap: "18px" }}>
        <div>
          <label htmlFor="email" style={S.label}>E-mail</label>
          <input
            id="email"
            type="email"
            placeholder="voce@email.com"
            autoComplete="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setEmailError(null); }}
            aria-invalid={!!emailError}
            aria-describedby={emailError ? "email-error" : undefined}
            style={{
              ...S.input,
              borderColor: emailError
                ? focused ? "rgba(220,80,80,0.7)" : "rgba(220,80,80,0.4)"
                : focused ? "rgba(237,237,234,0.22)" : "rgba(237,237,234,0.09)",
            }}
            onFocus={() => setFocused(true)}
            onBlur={()  => setFocused(false)}
          />
          {emailError && <p id="email-error" style={S.err}>{emailError}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            background: loading ? "rgba(237,237,234,0.35)" : "#ededea",
            color: "#07080a",
            padding: "11px 0",
            borderRadius: "7px",
            fontSize: "14px",
            fontWeight: 600,
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "var(--font-sans)",
            letterSpacing: "-0.2px",
            marginTop: "4px",
          }}
        >
          {loading ? "Enviando…" : "Enviar link"}
        </button>
      </form>

      <p style={{ marginTop: "28px", fontSize: "13px", color: "rgba(237,237,234,0.35)", textAlign: "center" }}>
        <Link href="/login" style={{ color: "rgba(237,237,234,0.65)", textDecoration: "underline", textUnderlineOffset: "3px" }}>
          Voltar para o login
        </Link>
      </p>
    </>
  );
}
