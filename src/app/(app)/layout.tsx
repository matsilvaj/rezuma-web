import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { AppTopNav } from "./_components/top-nav";
import { SupportWidget } from "./_components/support-widget";
import { SiteFooter } from "../_components/site-footer";

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
    <div style={{ minHeight: "var(--rz-vh)", display: "flex", flexDirection: "column", background: "#07080a", fontFamily: "var(--font-sans)" }}>
      <AppTopNav />
      <main className="rz-pad rz-app-main" style={{ flex: 1, maxWidth: "900px", width: "100%", margin: "0 auto" }}>
        {children}
      </main>
      <SiteFooter semConta />
      <SupportWidget />
    </div>
  );
}
