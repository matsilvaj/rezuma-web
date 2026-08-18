"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { validateEmail, validatePassword, translateSupabaseError } from "@/lib/validation";

const LOCK_AFTER = 5;
const LS_KEY = "_lga";

function lockDuration(attempts: number): number {
  return Math.min(30 * Math.pow(2, Math.floor(attempts / LOCK_AFTER) - 1), 300);
}

function readLS(): { count: number; lockedUntil: number | null } {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : { count: 0, lockedUntil: null };
  } catch {
    return { count: 0, lockedUntil: null };
  }
}

function writeLS(count: number, lockedUntil: number | null) {
  try { localStorage.setItem(LS_KEY, JSON.stringify({ count, lockedUntil })); } catch { /* ignorar */ }
}

function clearLS() {
  try { localStorage.removeItem(LS_KEY); } catch { /* ignorar */ }
}

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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [lockCountdown, setLockCountdown] = useState(0);

  useEffect(() => {
    const stored = readLS();
    setFailedAttempts(stored.count);
    if (stored.lockedUntil && stored.lockedUntil > Date.now()) {
      setLockedUntil(stored.lockedUntil);
      setLockCountdown(Math.ceil((stored.lockedUntil - Date.now()) / 1000));
    } else if (stored.lockedUntil) {
      clearLS();
    }
  }, []);

  useEffect(() => {
    if (!lockedUntil) return;
    const interval = setInterval(() => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setLockedUntil(null);
        setLockCountdown(0);
        setErrors({});
        clearLS();
      } else {
        setLockCountdown(remaining);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  function validate(): boolean {
    const next: typeof errors = {};
    const emailErr = validateEmail(email);
    const passErr  = validatePassword(password);
    if (emailErr) next.email    = emailErr;
    if (passErr)  next.password = passErr;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (lockedUntil && Date.now() < lockedUntil) {
      setErrors({ form: `Muitas tentativas. Aguarde ${lockCountdown} segundos para tentar novamente.` });
      return;
    }
    if (!validate()) return;
    setLoading(true);
    setErrors({});

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      if (newAttempts >= LOCK_AFTER && newAttempts % LOCK_AFTER === 0) {
        const duration = lockDuration(newAttempts);
        const until = Date.now() + duration * 1000;
        setLockedUntil(until);
        setLockCountdown(duration);
        writeLS(newAttempts, until);
        setErrors({ form: `Muitas tentativas incorretas. Aguarde ${duration} segundos.` });
      } else {
        writeLS(newAttempts, null);
        const remaining = LOCK_AFTER - (newAttempts % LOCK_AFTER);
        const suffix = remaining === 1 ? ". Mais 1 tentativa antes do bloqueio." : "";
        setErrors({ form: translateSupabaseError(error.message) + suffix });
      }
      setLoading(false);
      return;
    }

    clearLS();
    router.push("/dashboard");
    router.refresh();
  }

  const isLocked = !!lockedUntil && Date.now() < lockedUntil;

  return (
    <>
      <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "24px", fontWeight: 700, color: "#ededea", letterSpacing: "-0.8px", marginBottom: "6px" }}>
        Entrar no Rezuma
      </h1>
      <p style={{ fontFamily: "var(--font-sans)", fontSize: "14px", color: "rgba(237,237,234,0.40)", lineHeight: 1.6 }}>
        Seus ativos, resumidos.
      </p>

      <form onSubmit={handleLogin} noValidate style={{ marginTop: "32px", display: "flex", flexDirection: "column", gap: "18px" }}>
        <div>
          <label htmlFor="email" style={S.label}>E-mail</label>
          <input
            id="email"
            type="email"
            placeholder="voce@email.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLocked}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            style={{ ...S.input, borderColor: errors.email ? "rgba(220,80,80,0.4)" : "rgba(237,237,234,0.09)" }}
            onFocus={(e) => { e.currentTarget.style.borderColor = errors.email ? "rgba(220,80,80,0.7)" : "rgba(237,237,234,0.22)"; }}
            onBlur={(e)  => { e.currentTarget.style.borderColor = errors.email ? "rgba(220,80,80,0.4)" : "rgba(237,237,234,0.09)"; }}
          />
          {errors.email && <p id="email-error" style={S.err}>{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" style={S.label}>Senha</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLocked}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            style={{ ...S.input, borderColor: errors.password ? "rgba(220,80,80,0.4)" : "rgba(237,237,234,0.09)" }}
            onFocus={(e) => { e.currentTarget.style.borderColor = errors.password ? "rgba(220,80,80,0.7)" : "rgba(237,237,234,0.22)"; }}
            onBlur={(e)  => { e.currentTarget.style.borderColor = errors.password ? "rgba(220,80,80,0.4)" : "rgba(237,237,234,0.09)"; }}
          />
          {errors.password && <p id="password-error" style={S.err}>{errors.password}</p>}
        </div>

        {errors.form && (
          <p role="alert" style={{ fontSize: "13px", color: "rgba(220,80,80,0.85)", lineHeight: 1.5 }}>
            {errors.form}
          </p>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Link
            href="/forgot-password"
            style={{ fontSize: "12px", color: "rgba(237,237,234,0.30)", textDecoration: "underline", textUnderlineOffset: "3px" }}
          >
            Esqueci minha senha
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading || isLocked}
          style={{
            width: "100%",
            background: loading || isLocked ? "rgba(237,237,234,0.35)" : "#ededea",
            color: "#07080a",
            padding: "11px 0",
            borderRadius: "7px",
            fontSize: "14px",
            fontWeight: 600,
            border: "none",
            cursor: loading || isLocked ? "not-allowed" : "pointer",
            fontFamily: "var(--font-sans)",
            letterSpacing: "-0.2px",
            marginTop: "4px",
          }}
        >
          {isLocked ? `Bloqueado (${lockCountdown}s)` : loading ? "Entrando…" : "Entrar"}
        </button>
      </form>

      <p style={{ marginTop: "28px", fontSize: "13px", color: "rgba(237,237,234,0.35)", textAlign: "center" }}>
        Não tem conta?{" "}
        <Link href="/register" style={{ color: "rgba(237,237,234,0.65)", textDecoration: "underline", textUnderlineOffset: "3px" }}>
          Criar conta
        </Link>
      </p>
    </>
  );
}
