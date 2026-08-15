"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { validateEmail, validatePassword, translateSupabaseError } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ count, lockedUntil }));
  } catch { /* ignorar erros de storage */ }
}

function clearLS() {
  try { localStorage.removeItem(LS_KEY); } catch { /* ignorar */ }
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [lockCountdown, setLockCountdown] = useState(0);

  // Restaura o estado do localStorage ao montar
  useEffect(() => {
    const stored = readLS();
    setFailedAttempts(stored.count);
    if (stored.lockedUntil && stored.lockedUntil > Date.now()) {
      setLockedUntil(stored.lockedUntil);
      setLockCountdown(Math.ceil((stored.lockedUntil - Date.now()) / 1000));
    } else if (stored.lockedUntil) {
      // Bloqueio expirou enquanto a aba estava fechada
      clearLS();
    }
  }, []);

  // Contador regressivo durante o bloqueio
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
    const passErr = validatePassword(password);
    if (emailErr) next.email = emailErr;
    if (passErr) next.password = passErr;
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

    // Login bem-sucedido — limpa o contador
    clearLS();
    router.push("/dashboard");
    router.refresh();
  }

  const isLocked = !!lockedUntil && Date.now() < lockedUntil;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 p-8">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Entrar no Rezuma</h1>
          <p className="text-sm text-muted-foreground">Seus ativos, resumidos.</p>
        </div>

        <form onSubmit={handleLogin} noValidate className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="voce@email.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLocked}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <p id="email-error" className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLocked}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            {errors.password && (
              <p id="password-error" className="text-xs text-destructive">{errors.password}</p>
            )}
          </div>

          {errors.form && (
            <p role="alert" className="text-sm text-destructive">{errors.form}</p>
          )}

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground underline underline-offset-4 hover:text-primary"
            >
              Esqueci minha senha
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={loading || isLocked}>
            {isLocked
              ? `Bloqueado (${lockCountdown}s)`
              : loading
              ? "Entrando…"
              : "Entrar"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Não tem conta?{" "}
          <Link href="/register" className="underline underline-offset-4 hover:text-primary">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
