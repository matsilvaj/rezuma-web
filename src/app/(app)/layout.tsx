import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
import { LogOut, LayoutDashboard, Briefcase, Settings } from "lucide-react";

async function getUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
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
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 border-r bg-muted/30 flex flex-col py-6 px-4 gap-2">
        <div className="text-lg font-bold tracking-tight mb-6 px-2">Summai</div>

        <nav className="flex flex-col gap-1 flex-1">
          <NavLink href="/dashboard" icon={<LayoutDashboard size={16} />}>
            Dashboard
          </NavLink>
          <NavLink href="/assets" icon={<Briefcase size={16} />}>
            Meus Ativos
          </NavLink>
          <NavLink href="/settings" icon={<Settings size={16} />}>
            Configurações
          </NavLink>
        </nav>

        <form action="/api/auth/signout" method="post">
          <button
            type="submit"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full px-2 py-1.5 rounded-md hover:bg-muted"
          >
            <LogOut size={16} />
            Sair
          </button>
        </form>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-md hover:bg-muted"
    >
      {icon}
      {children}
    </Link>
  );
}
