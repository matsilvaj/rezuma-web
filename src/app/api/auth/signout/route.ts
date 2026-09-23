import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.signOut();

  // O destino sai da própria requisição, não de variável de ambiente: assim
  // vale para localhost, para a pré-visualização e para o domínio final sem
  // ninguém precisar lembrar de configurar nada. Antes, uma variável errada
  // mandava quem saía para outro endereço.
  //
  // 303 é o status certo depois de um POST: obriga o navegador a buscar o
  // destino com GET, em vez de depender de ele converter o método por conta.
  const resposta = NextResponse.redirect(new URL("/", request.url), { status: 303 });

  // Sem isto, voltar pelo botão do navegador pode mostrar a tela de dentro do
  // app servida do cache, dando a impressão de que a sessão continua aberta.
  resposta.headers.set("Cache-Control", "no-store, must-revalidate");

  return resposta;
}
