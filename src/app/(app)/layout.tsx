import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { AppTopNav } from "./_components/top-nav";

async function getUser() {
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
  return user;
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect("/login");

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#07080a", fontFamily: "var(--font-sans)" }}>
      <AppTopNav />
      <main style={{ flex: 1, padding: "48px 36px", maxWidth: "900px", width: "100%", margin: "0 auto" }}>
        {children}
      </main>
    </div>
  );
}
