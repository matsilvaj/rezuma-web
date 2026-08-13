// Regex RFC 5322 simplificado — suficiente para UI; a validação definitiva é no servidor
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateName(value: string): string | null {
  if (!value.trim()) return "Nome obrigatório.";
  if (value.trim().length < 2) return "Nome muito curto.";
  return null;
}

export function validateEmail(value: string): string | null {
  if (!value.trim()) return "E-mail obrigatório.";
  if (!EMAIL_RE.test(value)) return "E-mail inválido.";
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) return "Senha obrigatória.";
  if (value.length < 8) return "A senha deve ter pelo menos 8 caracteres.";
  return null;
}

export function validatePasswordConfirm(password: string, confirm: string): string | null {
  if (!confirm) return "Confirme a senha.";
  if (password !== confirm) return "As senhas não coincidem.";
  return null;
}

// Chat ID do Telegram: inteiro (positivo para usuários, negativo para grupos)
export function validateTelegramChatId(value: string): string | null {
  if (!value) return null; // campo opcional
  if (!/^-?\d+$/.test(value.trim())) return "Chat ID inválido. Deve conter apenas números.";
  return null;
}

// Traduz erros da Supabase Auth para mensagens em português sem vazar detalhes internos
export function translateSupabaseError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials") || m.includes("invalid email or password")) {
    return "E-mail ou senha incorretos.";
  }
  if (m.includes("email not confirmed")) {
    return "Confirme seu e-mail antes de entrar.";
  }
  if (m.includes("user already registered") || m.includes("already been registered")) {
    return "Este e-mail já está cadastrado. Tente entrar.";
  }
  if (m.includes("password should be at least")) {
    return "A senha deve ter pelo menos 8 caracteres.";
  }
  if (m.includes("rate limit") || m.includes("too many requests")) {
    return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  }
  // Fallback genérico — não expõe detalhes internos
  return "Ocorreu um erro. Tente novamente.";
}
