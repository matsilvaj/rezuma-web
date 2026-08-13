import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente Supabase para uso no browser (componentes client-side).
 * Usa as variáveis públicas — nunca expor service_role aqui.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
