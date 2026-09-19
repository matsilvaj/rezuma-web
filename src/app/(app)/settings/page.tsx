"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase";
import { usersApi, billingApi } from "@/lib/api";
import { UserProfile } from "@/types";
import { validateName, validateEmail, validatePassword, validatePasswordConfirm } from "@/lib/validation";

const S = {
  textP:   "#ededea",
  textS:   "rgba(237,237,234,0.55)",
  textT:   "rgba(237,237,234,0.22)",
  border:  "rgba(237,237,234,0.07)",
  borderS: "rgba(237,237,234,0.10)",
  accent:  "#5eb88a",
  accentD: "rgba(94,184,138,0.10)",
  accentB: "rgba(94,184,138,0.22)",
  danger:  "rgba(237,80,60,0.70)",
  mono:    "var(--font-mono)",
  sans:    "var(--font-sans)",
} as const;

const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? "RezumaAppBot";

type Section = "perfil" | "notificacoes" | "plano" | "seguranca";

const SECTIONS: { id: Section; label: string }[] = [
  { id: "perfil",        label: "perfil"        },
  { id: "notificacoes",  label: "notificações"   },
  { id: "plano",         label: "plano"          },
  { id: "seguranca",     label: "segurança"      },
];

const STATUS_LABEL: Record<string, string> = {
  trialing: "trial ativo",
  active:   "plano ativo",
  past_due: "pagamento pendente",
  canceled: "cancelado",
};

// ── Shared primitives ──────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: S.mono, fontSize: "9px", letterSpacing: "1.6px", textTransform: "uppercase" as const, color: S.textT, fontWeight: 600, marginBottom: "6px" }}>
      {children}
    </div>
  );
}

function FieldInput({
  id, type = "text", placeholder, value, onChange, error, autoComplete, maxLength,
}: {
  id: string; type?: string; placeholder?: string; value: string;
  onChange: (v: string) => void; error?: string | null;
  autoComplete?: string; maxLength?: number;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        maxLength={maxLength}
        autoComplete={autoComplete}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          boxSizing: "border-box",
          background: "#0d0f11",
          border: `1px solid ${error ? "rgba(237,80,60,0.40)" : focused ? "rgba(237,237,234,0.18)" : S.border}`,
          borderRadius: "8px",
          padding: "10px 14px",
          fontFamily: S.mono,
          fontSize: "13px",
          color: S.textP,
          outline: "none",
          transition: "border-color 0.15s",
        }}
      />
      {error && (
        <p style={{ fontFamily: S.mono, fontSize: "10px", color: "rgba(237,80,60,0.80)", marginTop: "5px", letterSpacing: "0.2px" }}>
          {error}
        </p>
      )}
    </div>
  );
}

function SubmitButton({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading}
      style={{
        fontFamily: S.sans,
        fontSize: "13px",
        fontWeight: 500,
        color: "#07080a",
        background: loading ? "rgba(237,237,234,0.35)" : "#ededea",
        border: "none",
        borderRadius: "7px",
        padding: "9px 20px",
        cursor: loading ? "default" : "pointer",
        transition: "opacity 0.15s",
      }}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div style={{ height: "1px", background: S.border, margin: "28px 0" }} />;
}

// ── Section: Perfil ────────────────────────────────────────────────────────

function PerfilSection({ profile }: { profile: UserProfile }) {
  const [fullName, setFullName] = useState(profile.profile.full_name ?? "");
  const [saving,   setSaving]   = useState(false);
  const [nameErr,  setNameErr]  = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const err = validateName(fullName);
    if (err) { setNameErr(err); return; }
    setNameErr(null);
    setSaving(true);
    try {
      await usersApi.updateProfile({ full_name: fullName.trim() });
      toast.success("Nome atualizado.");
    } catch {
      toast.error("Erro ao salvar nome.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <p style={{ fontFamily: S.sans, fontSize: "13px", color: S.textS, marginBottom: "28px", lineHeight: 1.6 }}>
        Informações básicas da sua conta.
      </p>

      <form onSubmit={handleSave} noValidate style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <SectionLabel>e-mail</SectionLabel>
          <p style={{ fontFamily: S.mono, fontSize: "13px", color: S.textT, padding: "10px 0" }}>
            {profile.email}
          </p>
        </div>

        <div>
          <SectionLabel>nome</SectionLabel>
          <FieldInput
            id="full-name"
            placeholder="Seu nome completo"
            value={fullName}
            onChange={v => { setFullName(v); setNameErr(null); }}
            error={nameErr}
            maxLength={120}
          />
        </div>

        <div>
          <SubmitButton loading={saving}>{saving ? "salvando…" : "salvar"}</SubmitButton>
        </div>
      </form>
    </div>
  );
}

// ── Section: Notificações ──────────────────────────────────────────────────

function NotificacoesSection({ profile }: { profile: UserProfile }) {
  const [notifyEmail,     setNotifyEmail]     = useState(profile.profile.notify_email);
  const [saving,          setSaving]          = useState(false);
  const [telegramConn,    setTelegramConn]    = useState(!!profile.profile.telegram_chat_id);
  const [connecting,      setConnecting]      = useState(false);
  const [awaiting,        setAwaiting]        = useState(false);
  const [disconnecting,   setDisconnecting]   = useState(false);
  const [pollId,          setPollId]          = useState<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (pollId) clearInterval(pollId); }, [pollId]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await usersApi.updateProfile({ notify_email: notifyEmail });
      toast.success("Preferências salvas.");
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function connectTelegram() {
    setConnecting(true);
    try {
      const { token } = await usersApi.generateTelegramToken();
      window.open(`https://t.me/${BOT_USERNAME}?start=${token}`, "_blank", "noopener,noreferrer");
      setAwaiting(true);
      let attempts = 0;
      const id = setInterval(async () => {
        attempts++;
        try {
          const data: UserProfile = await usersApi.getProfile();
          if (data.profile.telegram_chat_id) {
            clearInterval(id);
            setPollId(null);
            setTelegramConn(true);
            setAwaiting(false);
            toast.success("Telegram conectado.");
          } else if (attempts >= 100) {
            clearInterval(id);
            setPollId(null);
            setAwaiting(false);
            toast.error("Tempo esgotado. Tente novamente.");
          }
        } catch { /* ignora erros pontuais */ }
      }, 3000);
      setPollId(id);
    } catch {
      toast.error("Erro ao gerar link do Telegram.");
    } finally {
      setConnecting(false);
    }
  }

  async function disconnectTelegram() {
    setDisconnecting(true);
    try {
      await usersApi.disconnectTelegram();
      setTelegramConn(false);
      setAwaiting(false);
      if (pollId) { clearInterval(pollId); setPollId(null); }
      toast.success("Telegram desconectado.");
    } catch {
      toast.error("Erro ao desconectar.");
    } finally {
      setDisconnecting(false);
    }
  }

  return (
    <div>
      <p style={{ fontFamily: S.sans, fontSize: "13px", color: S.textS, marginBottom: "28px", lineHeight: 1.6 }}>
        Escolha por onde quer receber os resumos dos seus ativos.
      </p>

      <form onSubmit={handleSave} noValidate style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* E-mail toggle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: S.sans, fontSize: "13px", fontWeight: 500, color: S.textP }}>
              E-mail
            </div>
            <div style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, marginTop: "3px" }}>
              resumos consolidados por dia
            </div>
          </div>
          <label style={{ position: "relative", display: "inline-block", width: "36px", height: "20px", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={notifyEmail}
              onChange={e => setNotifyEmail(e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span style={{
              position: "absolute", inset: 0,
              background: notifyEmail ? S.accent : "rgba(237,237,234,0.10)",
              borderRadius: "20px",
              transition: "background 0.2s",
            }} />
            <span style={{
              position: "absolute",
              top: "3px",
              left: notifyEmail ? "19px" : "3px",
              width: "14px",
              height: "14px",
              background: "#ededea",
              borderRadius: "50%",
              transition: "left 0.2s",
            }} />
          </label>
        </div>

        {/* Telegram */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: awaiting ? "14px" : "0" }}>
            <div>
              <div style={{ fontFamily: S.sans, fontSize: "13px", fontWeight: 500, color: S.textP, display: "flex", alignItems: "center", gap: "8px" }}>
                Telegram
                {telegramConn && (
                  <span style={{ fontFamily: S.mono, fontSize: "9px", color: S.accent, border: `1px solid ${S.accentB}`, borderRadius: "4px", padding: "2px 7px", letterSpacing: "0.4px" }}>
                    conectado
                  </span>
                )}
              </div>
              <div style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, marginTop: "3px" }}>
                mensagem por ativo, em tempo real
              </div>
            </div>

            {telegramConn ? (
              <button
                type="button"
                disabled={disconnecting}
                onClick={disconnectTelegram}
                style={{ fontFamily: S.mono, fontSize: "10px", color: S.danger, background: "transparent", border: `1px solid rgba(237,80,60,0.20)`, borderRadius: "5px", padding: "5px 12px", cursor: "pointer", letterSpacing: "0.3px" }}
              >
                {disconnecting ? "…" : "desconectar"}
              </button>
            ) : awaiting ? (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT }}>aguardando…</span>
                <button
                  type="button"
                  onClick={() => { if (pollId) { clearInterval(pollId); setPollId(null); } setAwaiting(false); }}
                  style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, background: "transparent", border: `1px solid ${S.border}`, borderRadius: "5px", padding: "5px 12px", cursor: "pointer" }}
                >
                  cancelar
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={connecting}
                onClick={connectTelegram}
                style={{ fontFamily: S.mono, fontSize: "10px", color: S.textS, background: "transparent", border: `1px solid ${S.borderS}`, borderRadius: "5px", padding: "5px 12px", cursor: "pointer", letterSpacing: "0.3px" }}
              >
                {connecting ? "gerando link…" : "conectar"}
              </button>
            )}
          </div>

          {awaiting && (
            <div style={{ background: "#0d0f11", border: `1px solid ${S.border}`, borderRadius: "7px", padding: "12px 14px" }}>
              <p style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, lineHeight: 1.8 }}>
                1. O bot @{BOT_USERNAME} foi aberto no Telegram<br />
                2. Pressione Iniciar ou envie qualquer mensagem<br />
                3. A conexão será detectada automaticamente
              </p>
            </div>
          )}
        </div>

        {/* WhatsApp, em breve */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", opacity: 0.35 }}>
          <div>
            <div style={{ fontFamily: S.sans, fontSize: "13px", fontWeight: 500, color: S.textP }}>
              WhatsApp
            </div>
            <div style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, marginTop: "3px" }}>
              em breve
            </div>
          </div>
        </div>

        <div>
          <SubmitButton loading={saving}>{saving ? "salvando…" : "salvar preferências"}</SubmitButton>
        </div>
      </form>
    </div>
  );
}

// ── Section: Plano ─────────────────────────────────────────────────────────

function PlanoSection({ profile }: { profile: UserProfile }) {
  const [checkingOut,  setCheckingOut]  = useState(false);
  const [openingPortal,setOpeningPortal]= useState(false);

  const sub    = profile.subscription;
  const status = sub?.status;

  async function handleCheckout() {
    setCheckingOut(true);
    try {
      const { url } = await billingApi.checkout("monthly");
      window.location.href = url;
    } catch {
      toast.error("Erro ao iniciar checkout.");
    } finally {
      setCheckingOut(false);
    }
  }

  async function handlePortal() {
    setOpeningPortal(true);
    try {
      const { url } = await billingApi.portal();
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Erro ao abrir portal de assinatura.");
    } finally {
      setOpeningPortal(false);
    }
  }

  return (
    <div>
      <p style={{ fontFamily: S.sans, fontSize: "13px", color: S.textS, marginBottom: "28px", lineHeight: 1.6 }}>
        Gerencie sua assinatura e método de pagamento.
      </p>

      <div style={{ background: "#0d0f11", border: `1px solid ${S.borderS}`, borderRadius: "10px", padding: "20px 24px", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
          <div>
            <div style={{ fontFamily: S.mono, fontSize: "10px", letterSpacing: "1.4px", textTransform: "uppercase" as const, color: S.textT, fontWeight: 600, marginBottom: "8px" }}>
              status
            </div>
            {sub ? (
              <>
                <div style={{ fontFamily: S.sans, fontSize: "14px", fontWeight: 500, color: status === "active" ? S.accent : status === "trialing" ? S.accent : S.textS }}>
                  {STATUS_LABEL[status!] ?? status}
                </div>
                {status === "trialing" && sub.trial_ends_at && (
                  <div style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, marginTop: "5px" }}>
                    trial encerra em {new Date(sub.trial_ends_at).toLocaleDateString("pt-BR")}
                  </div>
                )}
                {status === "active" && sub.current_period_end && (
                  <div style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, marginTop: "5px" }}>
                    renova em {new Date(sub.current_period_end).toLocaleDateString("pt-BR")}
                  </div>
                )}
              </>
            ) : (
              <div style={{ fontFamily: S.sans, fontSize: "14px", color: S.textT }}>
                sem assinatura ativa
              </div>
            )}
          </div>

          {status === "active" ? (
            <button
              onClick={handlePortal}
              disabled={openingPortal}
              style={{ fontFamily: S.mono, fontSize: "10px", color: S.textS, background: "transparent", border: `1px solid ${S.borderS}`, borderRadius: "6px", padding: "7px 14px", cursor: "pointer", letterSpacing: "0.3px", flexShrink: 0 }}
            >
              {openingPortal ? "abrindo…" : "gerenciar"}
            </button>
          ) : (
            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              style={{ fontFamily: S.sans, fontSize: "13px", fontWeight: 500, color: "#07080a", background: "#ededea", border: "none", borderRadius: "7px", padding: "8px 18px", cursor: "pointer", flexShrink: 0 }}
            >
              {checkingOut ? "redirecionando…" : "assinar agora"}
            </button>
          )}
        </div>
      </div>

      {!sub && (
        <div style={{ background: S.accentD, border: `1px solid ${S.accentB}`, borderRadius: "8px", padding: "14px 16px" }}>
          <p style={{ fontFamily: S.mono, fontSize: "10px", color: S.accent, lineHeight: 1.7 }}>
            R$4,99/mês · R$49,90/ano, cancele quando quiser
          </p>
        </div>
      )}
    </div>
  );
}

// ── Section: Segurança ─────────────────────────────────────────────────────

function SegurancaSection({ profile }: { profile: UserProfile }) {
  // E-mail change
  const [emailPassword,  setEmailPassword]  = useState("");
  const [newEmail,       setNewEmail]       = useState("");
  const [confirmEmail,   setConfirmEmail]   = useState("");
  const [emailErrs,      setEmailErrs]      = useState<{ password?: string; email?: string; confirm?: string }>({});
  const [savingEmail,    setSavingEmail]    = useState(false);
  const [emailSent,      setEmailSent]      = useState(false);

  // Password change
  const [currentPass,    setCurrentPass]    = useState("");
  const [newPass,        setNewPass]        = useState("");
  const [confirmPass,    setConfirmPass]    = useState("");
  const [passErrs,       setPassErrs]       = useState<{ current?: string; new?: string; confirm?: string }>({});
  const [savingPass,     setSavingPass]     = useState(false);

  async function handleEmailChange(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof emailErrs = {};
    if (!emailPassword) next.password = "Informe sua senha atual.";
    const eErr = validateEmail(newEmail);
    if (eErr) next.email = eErr;
    if (newEmail && newEmail !== confirmEmail) next.confirm = "Os e-mails não coincidem.";
    if (newEmail && newEmail.trim().toLowerCase() === profile.email?.toLowerCase()) next.email = "O novo e-mail deve ser diferente do atual.";
    setEmailErrs(next);
    if (Object.keys(next).length > 0) return;

    setSavingEmail(true);
    try {
      const supabase = createClient();
      const { error: ae } = await supabase.auth.signInWithPassword({ email: profile.email ?? "", password: emailPassword });
      if (ae) { setEmailErrs({ password: "Senha incorreta." }); return; }
      const { error } = await supabase.auth.updateUser({ email: newEmail.trim().toLowerCase() });
      if (error) throw error;
      setEmailSent(true);
      setEmailPassword(""); setNewEmail(""); setConfirmEmail("");
    } catch {
      toast.error("Erro ao solicitar troca de e-mail.");
    } finally {
      setSavingEmail(false);
    }
  }

  async function handlePassChange(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof passErrs = {};
    if (!currentPass) next.current = "Informe sua senha atual.";
    const pe = validatePassword(newPass);
    const ce = validatePasswordConfirm(newPass, confirmPass);
    if (pe) next.new = pe;
    if (ce) next.confirm = ce;
    setPassErrs(next);
    if (Object.keys(next).length > 0) return;

    setSavingPass(true);
    try {
      const supabase = createClient();
      const { error: ae } = await supabase.auth.signInWithPassword({ email: profile.email ?? "", password: currentPass });
      if (ae) { setPassErrs({ current: "Senha atual incorreta." }); return; }
      const { error } = await supabase.auth.updateUser({ password: newPass });
      if (error) throw error;
      setCurrentPass(""); setNewPass(""); setConfirmPass("");
      toast.success("Senha alterada com sucesso.");
    } catch {
      toast.error("Erro ao alterar senha.");
    } finally {
      setSavingPass(false);
    }
  }

  return (
    <div>
      <p style={{ fontFamily: S.sans, fontSize: "13px", color: S.textS, marginBottom: "28px", lineHeight: 1.6 }}>
        Altere seu e-mail ou senha de acesso.
      </p>

      {/* E-mail */}
      <div>
        <div style={{ fontFamily: S.mono, fontSize: "9px", letterSpacing: "1.6px", textTransform: "uppercase" as const, color: S.textT, fontWeight: 600, marginBottom: "16px" }}>
          alterar e-mail
        </div>
        <p style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, marginBottom: "16px" }}>
          atual: {profile.email}
        </p>

        {emailSent ? (
          <div style={{ background: "#0d0f11", border: `1px solid ${S.borderS}`, borderRadius: "8px", padding: "16px" }}>
            <div style={{ fontFamily: S.sans, fontSize: "13px", fontWeight: 500, color: S.textP, marginBottom: "6px" }}>
              Confirmação enviada
            </div>
            <p style={{ fontFamily: S.sans, fontSize: "13px", color: S.textS, lineHeight: 1.6 }}>
              Enviamos um link para <strong>{newEmail || "seu novo e-mail"}</strong>. O endereço só será atualizado após você clicar no link.
            </p>
            <button
              type="button"
              onClick={() => setEmailSent(false)}
              style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, background: "transparent", border: "none", cursor: "pointer", marginTop: "12px", textDecoration: "underline" }}
            >
              alterar novamente
            </button>
          </div>
        ) : (
          <form onSubmit={handleEmailChange} noValidate style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <SectionLabel>senha atual</SectionLabel>
              <FieldInput id="ep" type="password" placeholder="Confirme sua senha" value={emailPassword} onChange={v => { setEmailPassword(v); setEmailErrs({}); }} error={emailErrs.password} autoComplete="current-password" />
            </div>
            <div>
              <SectionLabel>novo e-mail</SectionLabel>
              <FieldInput id="ne" type="email" placeholder="novo@email.com" value={newEmail} onChange={v => { setNewEmail(v); setEmailErrs({}); }} error={emailErrs.email} autoComplete="email" />
            </div>
            <div>
              <SectionLabel>confirmar novo e-mail</SectionLabel>
              <FieldInput id="ce" type="email" placeholder="Repita o novo e-mail" value={confirmEmail} onChange={v => { setConfirmEmail(v); setEmailErrs({}); }} error={emailErrs.confirm} autoComplete="email" />
            </div>
            <div><SubmitButton loading={savingEmail}>{savingEmail ? "enviando…" : "alterar e-mail"}</SubmitButton></div>
          </form>
        )}
      </div>

      <Divider />

      {/* Senha */}
      <div>
        <div style={{ fontFamily: S.mono, fontSize: "9px", letterSpacing: "1.6px", textTransform: "uppercase" as const, color: S.textT, fontWeight: 600, marginBottom: "16px" }}>
          alterar senha
        </div>
        <form onSubmit={handlePassChange} noValidate style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <SectionLabel>senha atual</SectionLabel>
            <FieldInput id="cp" type="password" placeholder="Sua senha atual" value={currentPass} onChange={v => { setCurrentPass(v); setPassErrs({}); }} error={passErrs.current} autoComplete="current-password" />
          </div>
          <div>
            <SectionLabel>nova senha</SectionLabel>
            <FieldInput id="np" type="password" placeholder="Mínimo 8 caracteres" value={newPass} onChange={v => { setNewPass(v); setPassErrs({}); }} error={passErrs.new} autoComplete="new-password" />
          </div>
          <div>
            <SectionLabel>confirmar nova senha</SectionLabel>
            <FieldInput id="npc" type="password" placeholder="Repita a nova senha" value={confirmPass} onChange={v => { setConfirmPass(v); setPassErrs({}); }} error={passErrs.confirm} autoComplete="new-password" />
          </div>
          <div><SubmitButton loading={savingPass}>{savingPass ? "alterando…" : "alterar senha"}</SubmitButton></div>
        </form>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [profile,  setProfile]  = useState<UserProfile | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [section,  setSection]  = useState<Section>("perfil");

  useEffect(() => {
    usersApi.getProfile()
      .then((d: UserProfile) => setProfile(d))
      .catch(() => toast.error("Erro ao carregar perfil."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, letterSpacing: "1px" }}>carregando…</p>;
  }

  if (!profile) return null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: "0", maxWidth: "740px" }}>

      {/* Sidebar nav */}
      <nav style={{ paddingRight: "32px", borderRight: `1px solid ${S.border}` }}>
        {SECTIONS.map(s => {
          const active = section === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                fontFamily: S.mono,
                fontSize: "11px",
                color: active ? S.textP : S.textT,
                background: "transparent",
                border: "none",
                padding: "8px 0",
                cursor: "pointer",
                letterSpacing: "0.3px",
                fontWeight: active ? 600 : 400,
                borderLeft: active ? `2px solid ${S.accent}` : "2px solid transparent",
                paddingLeft: "10px",
                marginLeft: "-10px",
                transition: "color 0.15s",
              }}
            >
              {s.label}
            </button>
          );
        })}
      </nav>

      {/* Content */}
      <div style={{ paddingLeft: "40px" }}>
        <h2 style={{ fontFamily: S.sans, fontSize: "16px", fontWeight: 700, color: S.textP, letterSpacing: "-0.3px", marginBottom: "20px" }}>
          {SECTIONS.find(s => s.id === section)?.label}
        </h2>

        {section === "perfil"       && <PerfilSection       profile={profile} />}
        {section === "notificacoes" && <NotificacoesSection profile={profile} />}
        {section === "plano"        && <PlanoSection        profile={profile} />}
        {section === "seguranca"    && <SegurancaSection    profile={profile} />}
      </div>
    </div>
  );
}
