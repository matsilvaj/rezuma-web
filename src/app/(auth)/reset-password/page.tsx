"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { validatePassword, validatePasswordConfirm } from "@/lib/validation";

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

function field(hasError: boolean, focused: boolean): React.CSSProperties {
  return {
    ...S.input,
    borderColor: hasError
      ? focused ? "rgba(220,80,80,0.7)" : "rgba(220,80,80,0.4)"
      : focused ? "rgba(237,237,234,0.22)" : "rgba(237,237,234,0.09)",
  };
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [errors,   setErrors]   = useState<{ password?: string; confirm?: string; form?: string }>({});
  const [loading,  setLoading]  = useState(false);
  const [focus,    setFocus]    = useState({ password: false, confirm: false });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    const passErr    = validatePassword(password);
    const confirmErr = validatePasswordConfirm(password, confirm);
    if (passErr)    next.password = passErr;
    if (confirmErr) next.confirm  = confirmErr;
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      // Quem redefine a senha por e-mail costuma estar recuperando a conta
      // de alguém que entrou nela. Encerrar as outras sessões é o que torna
      // a recuperação efetiva.
      await supabase.auth.signOut({ scope: "others" });

      router.push("/dashboard");
    } catch {
      setErrors({ form: "Erro ao redefinir senha. O link pode ter expirado. Solicite um novo." });
      setLoading(false);
    }
  }

  return (
    <>
      <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "24px", fontWeight: 700, color: "#ededea", letterSpacing: "-0.8px", marginBottom: "6px" }}>
        Redefinir senha
      </h1>
      <p style={{ fontFamily: "var(--font-sans)", fontSize: "14px", color: "rgba(237,237,234,0.40)", lineHeight: 1.6 }}>
        Digite sua nova senha.
      </p>

      <form onSubmit={handleSubmit} noValidate style={{ marginTop: "32px", display: "flex", flexDirection: "column", gap: "18px" }}>
        <div>
          <label htmlFor="password" style={S.label}>Nova senha</label>
          <input
            id="password"
            type="password"
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setErrors({}); }}
            aria-invalid={!!errors.password}
            style={field(!!errors.password, focus.password)}
            onFocus={() => setFocus(f => ({ ...f, password: true }))}
            onBlur={()  => setFocus(f => ({ ...f, password: false }))}
          />
          {errors.password && <p style={S.err}>{errors.password}</p>}
        </div>

        <div>
          <label htmlFor="confirm" style={S.label}>Confirmar nova senha</label>
          <input
            id="confirm"
            type="password"
            placeholder="Repita a nova senha"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setErrors({}); }}
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
          {loading ? "Salvando…" : "Redefinir senha"}
        </button>
      </form>
    </>
  );
}
