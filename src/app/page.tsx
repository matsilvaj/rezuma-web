import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">Bem-vindo ao Summai</h1>
        <p className="text-muted-foreground text-sm">
          Resumos de relatórios de ações e FIIs direto no seu e-mail ou Telegram.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/register"
            className="rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Começar grátis
          </Link>
          <Link
            href="/login"
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            Entrar
          </Link>
        </div>
      </div>
    </div>
  );
}
