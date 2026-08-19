"use client";

import { useEffect, useState } from "react";
import { reportsApi, assetsApi } from "@/lib/api";
import { Report, Asset } from "@/types";

/**
 * Carrega todos os relatórios da carteira do usuário mais o mapa de nomes
 * dos ativos. Compartilhado entre a lista e o relatório individual, que
 * precisa da lista completa para navegar entre anterior e próximo.
 */
export function useReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [nameMap, setNameMap] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [failed,  setFailed]  = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [firstPage, assetsData] = await Promise.all([
          reportsApi.list(1),
          assetsApi.list(),
        ]);

        const all: Report[] = firstPage.reports ?? [];
        const total   = firstPage.total ?? 0;
        const perPage = (firstPage.reports ?? []).length || 20;

        if (total > perPage) {
          const pages = Math.ceil(total / perPage);
          const rest  = await Promise.all(
            Array.from({ length: pages - 1 }, (_, i) => reportsApi.list(i + 2))
          );
          rest.forEach(r => all.push(...(r.reports ?? [])));
        }

        if (cancelled) return;
        setReports(all);
        setNameMap(new Map((assetsData as Asset[]).map(a => [a.ticker, a.name ?? ""])));
      } catch {
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { reports, nameMap, loading, failed };
}
