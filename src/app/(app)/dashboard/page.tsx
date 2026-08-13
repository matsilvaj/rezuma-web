"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { reportsApi } from "@/lib/api";
import { Report } from "@/types";

export default function DashboardPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const limit = 10;

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await reportsApi.list(page);
        setReports(data.reports ?? []);
        setTotal(data.total ?? 0);
      } catch {
        toast.error("Erro ao carregar relatórios.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [page]);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Últimos resumos dos seus ativos monitorados.
        </p>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Carregando...</p>}

      {!loading && reports.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Nenhum relatório ainda. Adicione ativos para começar a receber resumos.
        </div>
      )}

      {!loading && reports.length > 0 && (
        <div className="space-y-4">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}

          {/* Pagination */}
          {total > limit && (
            <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
              <span>
                {(page - 1) * limit + 1}–{Math.min(page * limit, total)} de {total}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded border text-xs disabled:opacity-40 hover:bg-muted"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * limit >= total}
                  className="px-3 py-1 rounded border text-xs disabled:opacity-40 hover:bg-muted"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ReportCard({ report }: { report: Report }) {
  const date = new Date(report.published_at).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="rounded-lg border p-4 space-y-2">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold bg-muted px-1.5 py-0.5 rounded">
              {report.ticker}
            </span>
            <span className="text-xs text-muted-foreground">{report.document_type}</span>
          </div>
          <h3 className="text-sm font-medium mt-1 leading-snug">{report.title}</h3>
        </div>
        <span className="text-xs text-muted-foreground shrink-0">{date}</span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{report.summary}</p>
      <a
        href={report.source_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs underline underline-offset-4 hover:text-primary"
      >
        Ver documento original
      </a>
    </div>
  );
}
