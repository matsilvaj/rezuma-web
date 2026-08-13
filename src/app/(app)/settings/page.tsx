"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase";
import { usersApi } from "@/lib/api";
import { UserProfile } from "@/types";
import { validateName, validateEmail, validatePassword, validatePasswordConfirm } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, ExternalLink, Loader2 } from "lucide-react";

const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? "SummaiAppBot";

const STATUS_LABEL: Record<string, string> = {
  trialing: "Trial (7 dias grátis)",
  active: "Ativo",
  past_due: "Pagamento pendente",
  canceled: "Cancelado",
};

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Perfil
  const [fullName, setFullName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  // Notificações
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [savingNotifications, setSavingNotifications] = useState(false);

  // Telegram
  const [telegramConnected, setTelegramConnected] = useState(false);
  const [connectingTelegram, setConnectingTelegram] = useState(false);
  const [awaitingTelegram, setAwaitingTelegram] = useState(false);
  const [disconnectingTelegram, setDisconnectingTelegram] = useState(false);
  const [pollIntervalId, setPollIntervalId] = useState<ReturnType<typeof setInterval> | null>(null);

  // E-mail
  const [emailPassword, setEmailPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [emailErrors, setEmailErrors] = useState<{ password?: string; email?: string; confirm?: string }>({});
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailChangeSent, setEmailChangeSent] = useState(false);

  // Senha
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<{ current?: string; new?: string; confirm?: string }>({});
  const [savingPassword, setSavingPassword] = useState(false);

  async function loadProfile() {
    try {
      const data: UserProfile = await usersApi.getProfile();
      setProfile(data);
      setFullName(data.profile.full_name ?? "");
      setNotifyEmail(data.profile.notify_email);
      setTelegramConnected(!!data.profile.telegram_chat_id);
    } catch {
      toast.error("Erro ao carregar perfil.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  // --- Perfil ---
  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    const err = validateName(fullName);
    if (err) { setNameError(err); return; }
    setNameError(null);
    setSavingProfile(true);
    try {
      await usersApi.updateProfile({ full_name: fullName.trim() });
      toast.success("Nome atualizado.");
    } catch {
      toast.error("Erro ao salvar nome.");
    } finally {
      setSavingProfile(false);
    }
  }

  // --- Notificações ---
  async function handleSaveNotifications(e: React.FormEvent) {
    e.preventDefault();
    setSavingNotifications(true);
    try {
      await usersApi.updateProfile({ notify_email: notifyEmail });
      toast.success("Notificações atualizadas.");
    } catch {
      toast.error("Erro ao salvar notificações.");
    } finally {
      setSavingNotifications(false);
    }
  }

  // --- Telegram ---
  function stopPolling() {
    setPollIntervalId((prev) => {
      if (prev) clearInterval(prev);
      return null;
    });
  }

  useEffect(() => {
    return () => stopPolling();
  }, []);

  async function handleConnectTelegram() {
    setConnectingTelegram(true);
    try {
      const { token } = await usersApi.generateTelegramToken();
      window.open(`https://t.me/${BOT_USERNAME}?start=${token}`, "_blank", "noopener,noreferrer");
      setAwaitingTelegram(true);

      const maxAttempts = 100;
      let attempts = 0;
      const id = setInterval(async () => {
        attempts++;
        try {
          const data: UserProfile = await usersApi.getProfile();
          if (data.profile.telegram_chat_id) {
            clearInterval(id);
            setPollIntervalId(null);
            setTelegramConnected(true);
            setAwaitingTelegram(false);
            setProfile(data);
            toast.success("Telegram conectado com sucesso!");
          } else if (attempts >= maxAttempts) {
            clearInterval(id);
            setPollIntervalId(null);
            setAwaitingTelegram(false);
            toast.error("Tempo esgotado. Tente conectar novamente.");
          }
        } catch {
          // Ignora erros pontuais de rede durante o polling
        }
      }, 3000);

      setPollIntervalId(id);
    } catch {
      toast.error("Erro ao gerar link do Telegram.");
    } finally {
      setConnectingTelegram(false);
    }
  }

  async function handleDisconnectTelegram() {
    setDisconnectingTelegram(true);
    try {
      await usersApi.disconnectTelegram();
      setTelegramConnected(false);
      setAwaitingTelegram(false);
      stopPolling();
      toast.success("Telegram desconectado.");
    } catch {
      toast.error("Erro ao desconectar Telegram.");
    } finally {
      setDisconnectingTelegram(false);
    }
  }

  // --- Alterar e-mail ---
  async function handleSaveEmail(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof emailErrors = {};
    if (!emailPassword) next.password = "Informe sua senha atual.";
    const emailErr = validateEmail(newEmail);
    if (emailErr) next.email = emailErr;
    if (newEmail && newEmail !== confirmEmail) next.confirm = "Os e-mails não coincidem.";
    if (newEmail && newEmail.trim().toLowerCase() === profile?.email?.toLowerCase()) {
      next.email = "O novo e-mail deve ser diferente do atual.";
    }
    setEmailErrors(next);
    if (Object.keys(next).length > 0) return;

    setSavingEmail(true);
    try {
      const supabase = createClient();

      // Verifica a senha atual antes de alterar
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: profile?.email ?? "",
        password: emailPassword,
      });
      if (authError) {
        setEmailErrors({ password: "Senha incorreta." });
        return;
      }

      const { error } = await supabase.auth.updateUser({ email: newEmail.trim().toLowerCase() });
      if (error) throw error;

      setEmailChangeSent(true);
      setEmailPassword("");
      setNewEmail("");
      setConfirmEmail("");
    } catch {
      toast.error("Erro ao solicitar troca de e-mail. Tente novamente.");
    } finally {
      setSavingEmail(false);
    }
  }

  // --- Alterar senha ---
  async function handleSavePassword(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof passwordErrors = {};
    if (!currentPassword) next.current = "Informe sua senha atual.";
    const passErr = validatePassword(newPassword);
    const confirmErr = validatePasswordConfirm(newPassword, confirmPassword);
    if (passErr) next.new = passErr;
    if (confirmErr) next.confirm = confirmErr;
    setPasswordErrors(next);
    if (Object.keys(next).length > 0) return;

    setSavingPassword(true);
    try {
      const supabase = createClient();

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: profile?.email ?? "",
        password: currentPassword,
      });
      if (authError) {
        setPasswordErrors({ current: "Senha atual incorreta." });
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Senha alterada com sucesso.");
    } catch {
      toast.error("Erro ao alterar senha. Tente novamente.");
    } finally {
      setSavingPassword(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Carregando…</p>;
  }

  return (
    <div className="max-w-lg space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
      </div>

      {/* ── Perfil ── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold">Perfil</h2>
          <p className="text-sm text-muted-foreground">Seu nome exibido no Summai.</p>
        </div>
        <form onSubmit={handleSaveProfile} noValidate className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="full-name">Nome completo</Label>
            <Input
              id="full-name"
              type="text"
              placeholder="Seu nome"
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); setNameError(null); }}
              maxLength={120}
              aria-invalid={!!nameError}
            />
            {nameError && <p className="text-xs text-destructive">{nameError}</p>}
          </div>
          <Button type="submit" disabled={savingProfile}>
            {savingProfile ? "Salvando…" : "Salvar nome"}
          </Button>
        </form>
      </section>

      <hr className="border-border" />

      {/* ── Notificações ── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold">Notificações</h2>
          <p className="text-sm text-muted-foreground">Escolha como quer receber os resumos.</p>
        </div>

        <form onSubmit={handleSaveNotifications} noValidate className="space-y-5">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.checked)}
              className="accent-primary"
            />
            <span className="text-sm">E-mail</span>
          </label>

          {/* Telegram */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Telegram</span>
                {telegramConnected && (
                  <span className="flex items-center gap-1 text-xs text-green-600">
                    <Check size={12} /> Conectado
                  </span>
                )}
              </div>

              {telegramConnected ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={disconnectingTelegram}
                  onClick={handleDisconnectTelegram}
                  className="text-destructive hover:text-destructive text-xs h-7"
                >
                  {disconnectingTelegram ? "Desconectando…" : "Desconectar"}
                </Button>
              ) : awaitingTelegram ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Loader2 size={13} className="animate-spin" />
                    Aguardando…
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => { stopPolling(); setAwaitingTelegram(false); }}
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={connectingTelegram}
                  onClick={handleConnectTelegram}
                  className="text-xs h-7 gap-1.5"
                >
                  {connectingTelegram ? "Gerando link…" : <><ExternalLink size={12} /> Conectar</>}
                </Button>
              )}
            </div>

            {awaitingTelegram && (
              <div className="rounded-md bg-muted px-3 py-2.5 text-xs text-muted-foreground space-y-1">
                <p>1. O bot <strong>@{BOT_USERNAME}</strong> foi aberto no Telegram.</p>
                <p>2. Pressione <strong>Iniciar</strong> ou envie qualquer mensagem.</p>
                <p>3. A conexão será detectada automaticamente.</p>
              </div>
            )}
          </div>

          <label className="flex items-center gap-3 cursor-not-allowed opacity-50">
            <input type="checkbox" disabled className="accent-primary" />
            <span className="text-sm">
              WhatsApp <span className="text-xs text-muted-foreground">(em breve)</span>
            </span>
          </label>

          <Button type="submit" disabled={savingNotifications}>
            {savingNotifications ? "Salvando…" : "Salvar notificações"}
          </Button>
        </form>
      </section>

      <hr className="border-border" />

      {/* ── Plano ── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold">Plano</h2>
          <p className="text-sm text-muted-foreground">Sua assinatura atual.</p>
        </div>
        {profile?.subscription && (
          <div className="rounded-lg border p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">
                {STATUS_LABEL[profile.subscription.status] ?? profile.subscription.status}
              </p>
              {profile.subscription.status === "trialing" && profile.subscription.trial_ends_at && (
                <p className="text-xs text-muted-foreground">
                  Expira em {new Date(profile.subscription.trial_ends_at).toLocaleDateString("pt-BR")}
                </p>
              )}
            </div>
            <Button variant="outline" size="sm" disabled>
              Alterar plano <span className="ml-1 text-xs text-muted-foreground">(em breve)</span>
            </Button>
          </div>
        )}
      </section>

      <hr className="border-border" />

      {/* ── Segurança ── */}
      <section className="space-y-8">
        <div>
          <h2 className="text-base font-semibold">Segurança</h2>
          <p className="text-sm text-muted-foreground">Altere seu e-mail ou senha de acesso.</p>
        </div>

        {/* Alterar e-mail */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Alterar e-mail</h3>
          <p className="text-xs text-muted-foreground -mt-2">
            E-mail atual: <span className="font-medium">{profile?.email}</span>
          </p>

          {emailChangeSent ? (
            <div className="rounded-md bg-muted px-3 py-3 text-sm text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">Confirmação enviada</p>
              <p>
                Enviamos um link para <strong>{newEmail || "seu novo e-mail"}</strong>.
                O endereço só será atualizado após você clicar no link.
              </p>
              <button
                type="button"
                className="text-xs underline underline-offset-4 mt-1"
                onClick={() => setEmailChangeSent(false)}
              >
                Alterar novamente
              </button>
            </div>
          ) : (
            <form onSubmit={handleSaveEmail} noValidate className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="email-password">Senha atual</Label>
                <Input
                  id="email-password"
                  type="password"
                  placeholder="Confirme sua senha para alterar o e-mail"
                  autoComplete="current-password"
                  value={emailPassword}
                  onChange={(e) => { setEmailPassword(e.target.value); setEmailErrors({}); }}
                  aria-invalid={!!emailErrors.password}
                />
                {emailErrors.password && <p className="text-xs text-destructive">{emailErrors.password}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="new-email">Novo e-mail</Label>
                <Input
                  id="new-email"
                  type="email"
                  placeholder="novo@email.com"
                  autoComplete="email"
                  value={newEmail}
                  onChange={(e) => { setNewEmail(e.target.value); setEmailErrors({}); }}
                  aria-invalid={!!emailErrors.email}
                />
                {emailErrors.email && <p className="text-xs text-destructive">{emailErrors.email}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirm-email">Confirmar novo e-mail</Label>
                <Input
                  id="confirm-email"
                  type="email"
                  placeholder="Repita o novo e-mail"
                  autoComplete="email"
                  value={confirmEmail}
                  onChange={(e) => { setConfirmEmail(e.target.value); setEmailErrors({}); }}
                  aria-invalid={!!emailErrors.confirm}
                />
                {emailErrors.confirm && <p className="text-xs text-destructive">{emailErrors.confirm}</p>}
              </div>
              <Button type="submit" disabled={savingEmail}>
                {savingEmail ? "Enviando…" : "Alterar e-mail"}
              </Button>
            </form>
          )}
        </div>

        <hr className="border-border" />

        {/* Alterar senha */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Alterar senha</h3>
          <form onSubmit={handleSavePassword} noValidate className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="current-password">Senha atual</Label>
              <Input
                id="current-password"
                type="password"
                placeholder="Sua senha atual"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => { setCurrentPassword(e.target.value); setPasswordErrors({}); }}
                aria-invalid={!!passwordErrors.current}
              />
              {passwordErrors.current && <p className="text-xs text-destructive">{passwordErrors.current}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-password">Nova senha</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setPasswordErrors({}); }}
                aria-invalid={!!passwordErrors.new}
              />
              {passwordErrors.new && <p className="text-xs text-destructive">{passwordErrors.new}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirm-password">Confirmar nova senha</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Repita a nova senha"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setPasswordErrors({}); }}
                aria-invalid={!!passwordErrors.confirm}
              />
              {passwordErrors.confirm && <p className="text-xs text-destructive">{passwordErrors.confirm}</p>}
            </div>
            <Button type="submit" disabled={savingPassword}>
              {savingPassword ? "Alterando…" : "Alterar senha"}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
