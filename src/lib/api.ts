import { createClient } from "@/lib/supabase";
import { Asset } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Faz uma requisição autenticada para o rezuma-api.
 * Busca o token de sessão do Supabase e injeta no header Authorization.
 */
async function apiFetch(path: string, options: RequestInit = {}) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (session?.access_token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${session.access_token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Erro desconhecido" }));
    throw new Error(error.detail || "Erro na requisição");
  }

  // DELETE retorna 204 sem body
  if (response.status === 204) return null;

  return response.json();
}

// Assets
export const assetsApi = {
  search: (q: string) =>
    apiFetch(`/api/v1/assets/search?q=${encodeURIComponent(q)}`).then((r) => {
      const items: { ticker: string; name: string | null; type: string | null }[] = r?.results ?? [];
      // Deduplica por ticker, a busca usa OR entre ticker e name, podendo retornar o mesmo ticker duas vezes
      const seen = new Set<string>();
      return items.filter((item) => {
        if (seen.has(item.ticker)) return false;
        seen.add(item.ticker);
        return true;
      });
    }),
  list: () =>
    apiFetch("/api/v1/assets/").then((r) => r?.assets ?? []),
  // Devolve a resposta inteira: alem do ativo, traz backfill_queued, que
  // indica se o sistema foi buscar os relatorios dos ultimos 2 meses.
  add: (ticker: string): Promise<{ asset: Asset; backfill_queued: boolean }> =>
    apiFetch("/api/v1/assets/", { method: "POST", body: JSON.stringify({ ticker }) }),
  remove: (id: string) =>
    apiFetch(`/api/v1/assets/${id}`, { method: "DELETE" }),
};

// Reports
export const contactApi = {
  send: (body: { assunto: string; nome: string; email: string; mensagem: string; website?: string }) =>
    apiFetch("/api/v1/contact/", { method: "POST", body: JSON.stringify(body) }),
};

export const reportsApi = {
  list: (page = 1) => apiFetch(`/api/v1/reports/?page=${page}`),
};


// Users
export const usersApi = {
  /** Apaga a conta e todos os dados. Definitivo. */
  deleteAccount: () => apiFetch("/api/v1/users/me", { method: "DELETE" }),
  getProfile: () => apiFetch("/api/v1/users/me"),
  updateProfile: (data: Record<string, unknown>) =>
    apiFetch("/api/v1/users/me", { method: "PATCH", body: JSON.stringify(data) }),
  generateTelegramToken: () =>
    apiFetch("/api/v1/users/me/telegram/link", { method: "POST" }),
  disconnectTelegram: () =>
    apiFetch("/api/v1/users/me/telegram", { method: "DELETE" }),
};
