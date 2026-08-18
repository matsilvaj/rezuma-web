"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import {
  validateName,
  validateEmail,
  validatePassword,
  validatePasswordConfirm,
  translateSupabaseError,
} from "@/lib/validation";
import { usersApi } from "@/lib/api";

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

function field(
  hasError: boolean,
  focused: boolean
): React.CSSProperties {
  return {
    ...S.input,
    borderColor: hasError
      ? focused ? "rgba(220,80,80,0.7)" : "rgba(220,80,80,0.4)"
      : focused ? "rgba(237,237,234,0.22)" : "rgba(237,237,234,0.09)",
  };
}

export default function RegisterPage() {
  const router = useRouter();
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [errors,   setErrors]   = useState<{ name?: string; email?: string; password?: string; confirm?: string; form?: string }>({});
  const [loading,  setLoading]  = useState(false);

  const [focus, setFocus] = useState({ name: false, email: false, password: false, confirm: false });

  function validate(): boolean {
    const next: typeof errors = {};
    const nameErr    = validateName(name);
    const emailErr   = validateEmail(email);
    const passErr    = validatePassword(password);
    const confirmErr = validatePasswordConfirm(password, confirm);
    if (nameErr)    next.name     = nameErr;
    if (emailErr)   next.email    = emailErr;
    if (passErr)    next.password = passErr;
    if (confirmErr) next.confirm  = confirmErr;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { full_name: name.trim() } },
    });

    if (error) {
      setErrors({ form: translateSupabaseError(error.message) });
      setLoading(false);
      return;
    }

    try {
      await usersApi.updateProfile({ full_name: name.trim() });
    } catch { /* não bloqueia o fluxo */ }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <>
      <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "24px", fontWeight: 700, color: "#ededea", letterSpacing: "-0.8px", marginBottom: "6px" }}>
        Criar conta
      </h1>
      <p style={{ fontFamily: "var(--font-sans)", fontSize: "14px", color: "rgba(237,237,234,0.40)", lineHeight: 1.6 }}>
        7 dias grátis, sem cartão de crédito.
      </p>

      <form onSubmit={handleRegister} noValidate style={{ marginTop: "32px", display: "flex", flexDirection: "column", gap: "18px" }}>
        <div>
          <label htmlFor="name" style={S.label}>Nome</label>
          <input
            id="name"
            type="text"
            placeholder="Seu nome"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={120}
            aria-invalid={!!errors.name}
            style={field(!!errors.name, focus.name)}
            onFocus={() => setFocus(f => ({ ...f, name: true }))}
            onBlur={()  => setFocus(f => ({ ...f, name: false }))}
          />
          {errors.name && <p style={S.err}>{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="email" style={S.label}>E-mail</label>
          <input
            id="email"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!errors.email}
            style={field(!!errors.email, focus.email)}
            onFocus={() => setFocus(f => ({ ...f, email: true }))}
            onBlur={()  => setFocus(f => ({ ...f, email: false }))}
          />
          {errors.email && <p style={S.err}>{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" style={S.label}>Senha</label>
          <input
            id="password"
            type="password"
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!errors.password}
            style={field(!!errors.password, focus.password)}
            onFocus={() => setFocus(f => ({ ...f, password: true }))}
            onBlur={()  => setFocus(f => ({ ...f, password: false }))}
          />
          {errors.password && <p style={S.err}>{errors.password}</p>}
        </div>

        <div>
          <label htmlFor="confirm" style={S.label}>Confirmar senha</label>
          <input
            id="confirm"
            type="password"
            placeholder="Repita a senha"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            aria-invalid={!!errors.confirm}
            style={field(!!errors.confirm, focus.confirm)}
            onFocus={() => setFocus(f => ({ ...f, confirm: true }))}
            onBlur={()  => setFocus(f => ({ ...f, confirm: false }))}
          />
          {errors.confirm && <p style={S.err}>{errors.confirm}</p>}
        </div>

        {errors.form && (
          <p role="alert" style={{ fontSize: "13px", color: "rgba(220,80,80,0.85)", lineHeight: 1.5 }}>
            {errors.form}
          </p>
        )}

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
          {loading ? "Criando conta…" : "Criar conta grátis"}
        </button>
      </form>

      <p style={{ marginTop: "28px", fontSize: "13px", color: "rgba(237,237,234,0.35)", textAlign: "center" }}>
        Já tem conta?{" "}
        <Link href="/login" style={{ color: "rgba(237,237,234,0.65)", textDecoration: "underline", textUnderlineOffset: "3px" }}>
          Entrar
        </Link>
      </p>
    </>
  );
}
