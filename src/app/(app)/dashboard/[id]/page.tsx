"use client";

import { useEffect, useCallback, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useReports } from "@/lib/use-reports";
import { markRead } from "@/lib/read-state";
import {
  S, RichText, fmtDate, relativeLabel,
  extractPeriod, shortPeriod, docTypeLabel, parseSummary, topMetrics, METRIC_SIZES,
  findPreviousReport,
} from "@/lib/report-format";

const LABEL_STYLE = {
  fontFamily: S.mono,
  fontSize: "9px",
  letterSpacing: "1.6px",
  textTransform: "uppercase" as const,
  color: S.textT,
  fontWeight: 600,
};

function BackLink() {
  const [hover, setHover] = useState(false);
  return (
    <Link
      href="/dashboard"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "7px",
        fontFamily: S.mono,
        fontSize: "10px",
        letterSpacing: "0.3px",
        color: hover ? "rgba(237,237,234,0.55)" : S.textT,
        textDecoration: "none",
        border: `1px solid ${hover ? S.borderS : S.border}`,
        borderRadius: "6px",
        padding: "6px 12px",
        marginBottom: "22px",
        background: hover ? "rgba(237,237,234,0.03)" : "transparent",
      }}
    >
      <span aria-hidden="true">&#8592;</span> voltar
    </Link>
  );
}

export default function ReportDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { reports, nameMap, loading, failed } = useReports();

  const id    = params?.id;
  const index = reports.findIndex(r => r.id === id);

  // Abrir o relatório é o que o marca como lido
  useEffect(() => {
    if (id) markRead(id);
  }, [id]);

  useEffect(() => {
    if (failed) toast.error("Erro ao carregar relatórios.");
  }, [failed]);

  const goTo = useCallback((i: number) => {
    const target = reports[i];
    if (target) router.push(`/dashboard/${target.id}`);
  }, [reports, router]);

  const prev = useCallback(() => { if (index > 0) goTo(index - 1); }, [index, goTo]);
  const next = useCallback(() => {
    if (index >= 0 && index < reports.length - 1) goTo(index + 1);
  }, [index, reports.length, goTo]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft"  || e.key === "ArrowUp")   prev();
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  if (loading) {
    return <p style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, letterSpacing: "1px", paddingTop: "8px" }}>carregando…</p>;
  }

  const report = index >= 0 ? reports[index] : undefined;

  if (!report) {
    return (
      <div style={{ border: `1px dashed ${S.border}`, borderRadius: "10px", padding: "64px 32px", textAlign: "center", maxWidth: "640px" }}>
        <p style={{ fontFamily: S.sans, fontSize: "14px", color: S.textT, lineHeight: 1.7, marginBottom: "16px" }}>
          Relatório não encontrado.
        </p>
        <Link href="/dashboard" style={{ fontFamily: S.mono, fontSize: "11px", color: S.accent, textDecoration: "none" }}>
          ver todos os relatórios
        </Link>
      </div>
    );
  }

  const docType   = docTypeLabel(report.document_type ?? "");
  const relTime   = relativeLabel(report.published_at);
  const { day, month, year, time } = fmtDate(report.published_at);
  const period    = extractPeriod(report.title);
  const compName  = nameMap.get(report.ticker) ?? "";
  // O título do documento identifica o relatório; empresa e período se
  // repetem entre todos os documentos do mesmo trimestre.
  const titleLine = report.title;
  const parsed    = parseSummary(report.summary);
  const anterior  = findPreviousReport(reports, report);
  const metrics   = report.metrics ? topMetrics(report.metrics, anterior?.metrics) : [];
  const compara   = metrics.some(m => m.variation) && anterior
    ? shortPeriod(anterior.title, anterior.document_type ?? "")
    : null;
  const glossary  = report.glossary ?? [];

  return (
    <div style={{ maxWidth: "860px" }}>

      <BackLink />

      {/* Breadcrumb header */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "7px" }}>
          <p style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, letterSpacing: "0.3px" }}>
            <Link href="/dashboard" style={{ color: S.textT, textDecoration: "none" }}>relatórios</Link>
            {" / "}{report.ticker.toLowerCase()}{" / "}{shortPeriod(report.title, report.document_type ?? "")}
          </p>
          <span style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, flexShrink: 0 }}>{relTime}</span>
        </div>
        <p style={{ fontFamily: S.sans, fontSize: "14px", fontWeight: 500, color: "rgba(237,237,234,0.45)", lineHeight: 1.4 }}>
          {titleLine}
        </p>
      </div>

      <div style={{ height: "1px", background: S.border, marginBottom: "32px" }} />

      {/* Corpo: coluna esquerda + direita */}
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "320px" }}>

        {/* Coluna esquerda */}
        <div style={{ borderRight: `1px solid ${S.border}`, paddingRight: "28px", display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: S.mono, fontSize: "46px", fontWeight: 700, color: S.textP, letterSpacing: "-2px", lineHeight: 1, marginBottom: "10px" }}>
              {report.ticker}
            </div>
            {compName && (
              <div style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, letterSpacing: "0.2px", lineHeight: 1.5 }}>
                {compName}
              </div>
            )}
            <div style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, letterSpacing: "0.2px", lineHeight: 1.5, marginBottom: metrics.length > 0 ? "24px" : "0" }}>
              {period ? period.replace("resultado do ", "") : docType}
            </div>

            {compara && (
              <div style={{ fontFamily: S.mono, fontSize: "9px", color: S.textT, letterSpacing: "0.4px", marginBottom: "14px" }}>
                variação vs {compara}
              </div>
            )}

            {metrics.map((m, i) => {
              // Verde e vermelho só quando a variação diz algo: sem período
              // anterior, ou em métrica sem direção óbvia, o número fica neutro
              const cor =
                m.variation?.better === true  ? S.accent :
                m.variation?.better === false ? "rgba(237,120,100,0.92)" :
                S.textP;
              return (
                <div key={m.key} style={{ marginBottom: i < metrics.length - 1 ? "16px" : "0" }}>
                  <div style={{
                    fontFamily: S.mono,
                    fontSize: `${METRIC_SIZES[i] ?? 14}px`,
                    fontWeight: 700,
                    color: cor,
                    letterSpacing: i === 0 ? "-1px" : "-0.5px",
                    lineHeight: 1,
                  }}>
                    {m.value}
                  </div>
                  <div style={{ fontFamily: S.mono, fontSize: "9px", color: S.textT, letterSpacing: "0.2px", marginTop: "4px" }}>
                    {m.label}
                  </div>
                  {m.variation && (
                    <div style={{
                      fontFamily: S.mono,
                      fontSize: "9px",
                      color: m.variation.better === null ? S.textT : cor,
                      opacity: m.variation.better === null ? 1 : 0.85,
                      marginTop: "3px",
                    }}>
                      {m.variation.label}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ borderTop: `1px solid ${S.border}`, paddingTop: "16px", marginTop: "28px" }}>
            <div style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, letterSpacing: "0.2px", lineHeight: 1.8 }}>
              gerado em<br />{day} {month} {year} · {time}
            </div>
          </div>
        </div>

        {/* Coluna direita */}
        <div style={{ paddingLeft: "28px", display: "flex", flexDirection: "column" }}>

          {/* DESTAQUE */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ ...LABEL_STYLE, marginBottom: "12px" }}>Destaque</div>
            <p style={{ fontFamily: S.sans, fontSize: "14px", color: S.textS, lineHeight: 1.85, margin: 0 }}>
              <RichText text={parsed.destaque} />
            </p>

            {parsed.quote && (
              <div style={{ borderLeft: "2px solid rgba(94,184,138,0.35)", paddingLeft: "16px", marginTop: "16px" }}>
                <p style={{ fontFamily: S.sans, fontSize: "13px", color: "rgba(237,237,234,0.40)", lineHeight: 1.75, fontStyle: "italic", margin: 0 }}>
                  <RichText text={parsed.quote} />
                </p>
              </div>
            )}
          </div>

          {/* MOVIMENTAÇÕES */}
          {parsed.movimentacoes && (
            <div style={{ marginBottom: "24px" }}>
              <div style={{ height: "1px", background: S.border, marginBottom: "20px" }} />
              <div style={{ ...LABEL_STYLE, marginBottom: "12px" }}>Movimentações</div>
              <p style={{ fontFamily: S.sans, fontSize: "14px", color: S.textS, lineHeight: 1.85, margin: 0 }}>
                <RichText text={parsed.movimentacoes} />
              </p>
            </div>
          )}

          {/* ATENÇÃO */}
          {parsed.atencao && (
            <div style={{ marginBottom: "24px" }}>
              <div style={{ background: "rgba(237,80,50,0.05)", border: "1px solid rgba(237,80,50,0.12)", borderRadius: "6px", padding: "12px 14px" }}>
                <div style={{ ...LABEL_STYLE, color: "rgba(237,100,80,0.55)", letterSpacing: "1.4px", marginBottom: "6px" }}>
                  Atenção
                </div>
                <p style={{ fontFamily: S.sans, fontSize: "13px", color: "rgba(237,150,130,0.70)", lineHeight: 1.7, margin: 0 }}>
                  <RichText text={parsed.atencao} />
                </p>
              </div>
            </div>
          )}

          {/* IMPACTO */}
          {parsed.impacto && (
            <div style={{ marginBottom: "24px" }}>
              <div style={{ height: "1px", background: S.border, marginBottom: "20px" }} />
              <div style={{ ...LABEL_STYLE, marginBottom: "12px" }}>O que muda para você</div>
              <p style={{ fontFamily: S.sans, fontSize: "14px", color: S.textS, lineHeight: 1.85, margin: 0 }}>
                <RichText text={parsed.impacto} />
              </p>
            </div>
          )}

          {/* GLOSSÁRIO */}
          {glossary.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <div style={{ background: "rgba(237,237,234,0.02)", border: `1px solid ${S.border}`, borderRadius: "6px", padding: "16px 18px" }}>
                <div style={{ ...LABEL_STYLE, marginBottom: "14px" }}>Glossário</div>
                {glossary.map((entry, i) => (
                  <div key={entry.term} style={{ marginBottom: i < glossary.length - 1 ? "14px" : "0" }}>
                    <div style={{ fontFamily: S.mono, fontSize: "11px", fontWeight: 700, color: S.textP, letterSpacing: "0.2px", marginBottom: "4px" }}>
                      {entry.term}
                    </div>
                    <p style={{ fontFamily: S.sans, fontSize: "12px", color: "rgba(237,237,234,0.38)", lineHeight: 1.65, margin: 0 }}>
                      {entry.definition}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ENTREGUE VIA + DOCUMENTO */}
          <div>
            <div style={{ height: "1px", background: S.border, marginBottom: "20px" }} />
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
              <div>
                <div style={{ ...LABEL_STYLE, marginBottom: "10px" }}>Entregue via</div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {(["e-mail", "telegram"] as const).map(ch => (
                    <span key={ch} style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, border: `1px solid ${S.borderS}`, borderRadius: "5px", padding: "3px 10px", letterSpacing: "0.3px" }}>
                      {ch}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ ...LABEL_STYLE, marginBottom: "10px" }}>Documento</div>
                <a href={report.source_url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, textDecoration: "underline", textUnderlineOffset: "3px" }}>
                  ver original
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navegação */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "40px", marginTop: "40px", borderTop: `1px solid ${S.border}` }}>
        <button
          onClick={prev} disabled={index <= 0} aria-label="Relatório anterior"
          style={{ fontFamily: S.mono, fontSize: "10px", color: index <= 0 ? S.textT : "rgba(237,237,234,0.35)", background: "transparent", border: "none", padding: 0, cursor: index <= 0 ? "default" : "pointer", opacity: index <= 0 ? 0.3 : 1, letterSpacing: "0.3px" }}
        >
          relatório anterior
        </button>
        <Link href="/dashboard" style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, letterSpacing: "0.3px", textDecoration: "none" }}>
          {index + 1} de {reports.length} relatórios
        </Link>
        <button
          onClick={next} disabled={index >= reports.length - 1} aria-label="Próximo relatório"
          style={{ fontFamily: S.mono, fontSize: "10px", color: index >= reports.length - 1 ? S.textT : "rgba(237,237,234,0.35)", background: "transparent", border: "none", padding: 0, cursor: index >= reports.length - 1 ? "default" : "pointer", opacity: index >= reports.length - 1 ? 0.3 : 1, letterSpacing: "0.3px" }}
        >
          próximo relatório
        </button>
      </div>
    </div>
  );
}
