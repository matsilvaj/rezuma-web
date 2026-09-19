import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Primeiro nome de quem está logado, ou null para visitante.
 *
 * Serve à landing: quem já tem conta não deveria ver "Criar conta" no topo
 * da própria home. Só o primeiro nome, porque "Olá, Matheus" cabe na barra
 * e o nome completo não.
 */
export async function getViewerName(): Promise<string | null> {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // O perfil pode não ter nome ainda, e a consulta pode falhar por RLS ou
  // rede. Nenhum desses casos justifica derrubar a home: caímos no trecho
  // do e-mail antes do arroba, que sempre existe.
  let fullName = "";
  try {
    const { data } = await supabase
      .from("user_profiles")
      .select("full_name")
      .eq("id", user.id)
      .limit(1)
      .maybeSingle();
    fullName = (data?.full_name ?? "").trim();
  } catch {
    fullName = "";
  }

  const first = fullName.split(/\s+/)[0];
  return first || user.email?.split("@")[0] || "investidor";
}
