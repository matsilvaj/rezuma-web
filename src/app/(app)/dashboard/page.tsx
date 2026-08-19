"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useReports } from "@/lib/use-reports";
import { getReadIds } from "@/lib/read-state";
import { S, relativeLabel, shortPeriod, normalizeDocType } from "@/lib/report-format";
import { Report } from "@/types";

function ReportRow({
  report,
  companyName,
  unread,
  last,
}: {
  report: Report;
  companyName: string;
  unread: boolean;
  last: boolean;
}) {
  const [hover, setHover] = useState(false);

  const period = shortPeriod(report.title, report.document_type ?? "");
  const label  = companyName || normalizeDocType(report.document_type ?? "") || report.title;

  return (
    <Link
      href={`/dashboard/${report.id}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "92px 1fr auto",
        alignItems: "center",
        gap: "16px",
        padding: "14px 12px",
        margin: "0 -12px",
        borderRadius: "8px",
        borderBottom: last ? "none" : `1px solid ${S.border}`,
        textDecoration: "none",
        background: hover ? "rgba(237,237,234,0.03)" : "transparent",
      }}
    >
      <span style={{
        fontFamily: S.mono,
        fontSize: "13px",
        fontWeight: 700,
        color: unread ? S.textP : "rgba(237,237,234,0.45)",
        letterSpacing: "-0.3px",
      }}>
        {report.ticker}
      </span>

      <span style={{ minWidth: 0 }}>
        <span style={{
          fontFamily: S.sans,
          fontSize: "13px",
          color: unread ? "rgba(237,237,234,0.72)" : "rgba(237,237,234,0.38)",
          display: "block",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {label}
        </span>
        <span style={{
          fontFamily: S.mono,
          fontSize: "10px",
          color: S.textT,
          letterSpacing: "0.2px",
        }}>
          {period}
        </span>
      </span>

      <span style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
        {unread && (
          <span style={{
            background: S.accentD,
            border: `1px solid ${S.accentB}`,
            color: S.accent,
            fontFamily: S.mono,
            fontSize: "9px",
            fontWeight: 600,
            padding: "3px 9px",
            borderRadius: "5px",
            letterSpacing: "0.6px",
          }}>
            novo
          </span>
        )}
        <span style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, minWidth: "48px", textAlign: "right" }}>
          {relativeLabel(report.published_at)}
        </span>
      </span>
    </Link>
  );
}

export default function ReportsListPage() {
  const { reports, nameMap, loading, failed } = useReports();
  const [readIds,  setReadIds]  = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  // localStorage só existe no cliente: ler depois da montagem evita
  // divergência entre o HTML do servidor e o do navegador.
  useEffect(() => {
    setReadIds(getReadIds());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (failed) toast.error("Erro ao carregar relatórios.");
  }, [failed]);

  if (loading) {
    return <p style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, letterSpacing: "1px", paddingTop: "8px" }}>carregando…</p>;
  }

  if (reports.length === 0) {
    return (
      <div style={{ border: `1px dashed ${S.border}`, borderRadius: "10px", padding: "64px 32px", textAlign: "center", maxWidth: "640px" }}>
        <p style={{ fontFamily: S.sans, fontSize: "14px", color: S.textT, lineHeight: 1.7 }}>
          Nenhum relatório ainda.<br />
          Adicione ativos em <strong style={{ color: "rgba(237,237,234,0.40)", fontWeight: 500 }}>Meus Ativos</strong> para começar.
        </p>
      </div>
    );
  }

  const unreadCount = hydrated ? reports.filter(r => !readIds.has(r.id)).length : 0;

  return (
    <div style={{ maxWidth: "860px" }}>

      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "16px", marginBottom: "7px" }}>
          <p style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, letterSpacing: "0.3px" }}>
            relatórios
          </p>
          <span style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT }}>
            {reports.length} {reports.length === 1 ? "relatório" : "relatórios"}
          </span>
        </div>
        <p style={{ fontFamily: S.sans, fontSize: "14px", fontWeight: 500, color: "rgba(237,237,234,0.45)", lineHeight: 1.4 }}>
          {hydrated && unreadCount > 0
            ? `${unreadCount} ${unreadCount === 1 ? "não lido" : "não lidos"}`
            : "tudo em dia"}
        </p>
      </div>

      <div style={{ height: "1px", background: S.border, marginBottom: "8px" }} />

      <div>
        {reports.map((report, i) => (
          <ReportRow
            key={report.id}
            report={report}
            companyName={nameMap.get(report.ticker) ?? ""}
            unread={hydrated && !readIds.has(report.id)}
            last={i === reports.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
