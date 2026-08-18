"use client";

import { useEffect, useState, useCallback, Fragment } from "react";
import { toast } from "sonner";
import { reportsApi, assetsApi } from "@/lib/api";
import { Report, Asset } from "@/types";

const S = {
  textP:   "#ededea",
  textS:   "rgba(237,237,234,0.55)",
  textT:   "rgba(237,237,234,0.22)",
  border:  "rgba(237,237,234,0.07)",
  borderS: "rgba(237,237,234,0.10)",
  accent:  "#5eb88a",
  accentD: "rgba(94,184,138,0.10)",
  accentB: "rgba(94,184,138,0.22)",
  mono:    "var(--font-mono)",
  sans:    "var(--font-sans)",
} as const;

const MONTHS_SHORT = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];

function fmtDate(dateStr: string) {
  const d = new Date(dateStr);
  return {
    day:   String(d.getDate()).padStart(2, "0"),
    month: MONTHS_SHORT[d.getMonth()],
    year:  d.getFullYear(),
    time:  d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
  };
}

function isNew(dateStr: string): boolean {
  return Date.now() - new Date(dateStr).getTime() < 86400000 * 2;
}

function relativeLabel(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "agora";
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `há ${d}d`;
  const t = fmtDate(dateStr);
  return `${t.day} ${t.month}`;
}

function normalizeDocType(raw: string): string {
  return raw.replace(/_/g, " ").toLowerCase();
}

function extractPeriod(title: string): string | null {
  const qm = title.match(/(\d+)[Tt](\d{2,4})/);
  if (qm) {
    const q = parseInt(qm[1]);
    const year = qm[2].length === 2 ? `20${qm[2]}` : qm[2];
    const ord = ["1º", "2º", "3º", "4º"][q - 1] ?? `${q}º`;
    return `resultado do ${ord} trimestre de ${year}`;
  }
  const sm = title.match(/(\d+)[Ss](\d{2,4})/);
  if (sm) {
    const s = parseInt(sm[1]);
    const year = sm[2].length === 2 ? `20${sm[2]}` : sm[2];
    return `resultado do ${s}º semestre de ${year}`;
  }
  return null;
}

// ── Text sanitizer ─────────────────────────────────────────────────────────

function sanitize(text: string): string {
  return text.replace(/\s*[—–]\s*/g, ", ");
}

// ── Rich text renderer (parses **bold** markdown) ──────────────────────────

function RichText({ text, style }: { text: string; style?: React.CSSProperties }) {
  const parts = sanitize(text).split(/\*\*(.*?)\*\*/g);
  return (
    <span style={style}>
      {parts.map((part, i) =>
        i % 2 === 1
          ? <strong key={i} style={{ color: S.textP, fontWeight: 700 }}>{part}</strong>
          : <Fragment key={i}>{part}</Fragment>
      )}
    </span>
  );
}

// ── Summary parser ─────────────────────────────────────────────────────────

interface ParsedSummary {
  destaque:      string;
  quote:         string | null;
  movimentacoes: string;
}

function parseSummary(summary: string): ParsedSummary {
  const dm = summary.match(/^DESTAQUE:\s*([\s\S]*?)(?=\n*MOVIMENTA|$)/mi);
  const mm = summary.match(/MOVIMENTA[ÇC][OÕ]ES:\s*([\s\S]*)$/mi);

  if (dm && mm) {
    const destaqueRaw = dm[1].trim();
    const movRaw      = mm[1].trim();

    const dLines  = destaqueRaw.split("\n");
    const quoteL  = dLines.find(l => l.trim().startsWith(">"));
    const quote   = quoteL ? quoteL.trim().replace(/^>\s*/, "") : null;
    const destaque = dLines.filter(l => !l.trim().startsWith(">")).join(" ").trim();

    const movimentacoes = movRaw.trim();

    return { destaque, quote, movimentacoes };
  }

  // Fallback para relatórios gerados antes do novo formato
  const blocks = summary.split(/\n\n+/).map(b => b.trim()).filter(Boolean);
  return {
    destaque: blocks[0] ?? summary,
    quote: null,
    movimentacoes: blocks.slice(1).join("\n\n"),
  };
}

// ── Metrics ────────────────────────────────────────────────────────────────

const METRIC_LABELS: Record<string, string> = {
  rendimento_por_cota:      "rend. distribuível por cota",
  dy_percentual:            "dividend yield",
  dy_anualizado:            "DY anualizado",
  valor_patrimonial_cota:   "valor patrimonial/cota",
  pvp:                      "P/VP",
  vacancia_percentual:      "vacância física",
  inadimplencia_percentual: "inadimplência",
  receita_liquida:          "receita líquida",
  lucro_liquido:            "lucro líquido",
  ebitda:                   "EBITDA",
  margem_ebitda_percentual: "margem EBITDA",
  margem_liquida_percentual:"margem líquida",
  divida_liquida_ebitda:    "dívida líq./EBITDA",
  dividendo_por_acao:       "dividendo por ação",
};

// Metrics where a higher value is directly favorable for the investor
const ACCENT_METRICS = new Set([
  "rendimento_por_cota", "dy_percentual", "dy_anualizado",
  "dividendo_por_acao",  "margem_liquida_percentual", "margem_ebitda_percentual",
]);

function fmtMetric(key: string, value: number | string | null): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (key.includes("rendimento") || key.includes("valor_patrimonial") || key === "dividendo_por_acao")
    return `R$${value.toFixed(2).replace(".", ",")}`;
  if (key.includes("percentual") || key === "dy_percentual" || key === "dy_anualizado")
    return `${value.toFixed(1).replace(".", ",")}%`;
  if (key === "pvp" || key === "divida_liquida_ebitda")
    return `${value.toFixed(2).replace(".", ",")}x`;
  if (["receita_liquida","lucro_liquido","ebitda"].includes(key)) {
    const abs = Math.abs(value);
    if (abs >= 1e9) return `R$${(value / 1e9).toFixed(1).replace(".", ",")}bi`;
    if (abs >= 1e6) return `R$${(value / 1e6).toFixed(0)}mi`;
    return `R$${value.toFixed(0)}`;
  }
  return String(value);
}

const PRIORITY_METRICS = [
  "rendimento_por_cota","dy_percentual","dy_anualizado",
  "vacancia_percentual","pvp",
  "lucro_liquido","receita_liquida","margem_liquida_percentual","divida_liquida_ebitda",
  "dividendo_por_acao",
];

interface MetricItem { key: string; label: string; value: string; accent: boolean; }

function topMetrics(m: Record<string, number | string | null>): MetricItem[] {
  const result: MetricItem[] = [];
  for (const key of PRIORITY_METRICS) {
    if (m[key] !== null && m[key] !== undefined) {
      const fmt = fmtMetric(key, m[key]!);
      if (fmt) result.push({ key, label: METRIC_LABELS[key] ?? key, value: fmt, accent: ACCENT_METRICS.has(key) });
    }
    if (result.length === 4) break;
  }
  return result;
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [nameMap, setNameMap] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [index,   setIndex]   = useState(0);

  useEffect(() => {
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

        setReports(all);
        setNameMap(new Map((assetsData as Asset[]).map(a => [a.ticker, a.name ?? ""])));
        setIndex(0);
      } catch {
        toast.error("Erro ao carregar relatórios.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const prev = useCallback(() => setIndex(i => Math.max(0, i - 1)), []);
  const next = useCallback(() => setIndex(i => Math.min(reports.length - 1, i + 1)), [reports.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft"  || e.key === "ArrowUp")    prev();
      if (e.key === "ArrowRight" || e.key === "ArrowDown")   next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

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

  const report   = reports[index]!;
  const docType  = normalizeDocType(report.document_type ?? "");
  const novel    = isNew(report.published_at);
  const relTime  = relativeLabel(report.published_at);
  const { day, month, year, time } = fmtDate(report.published_at);
  const period   = extractPeriod(report.title);
  const compName = nameMap.get(report.ticker) ?? "";
  const titleLine = compName
    ? period ? `${compName} - ${period}` : compName
    : period ?? report.title;
  const parsed  = parseSummary(report.summary);
  const metrics = report.metrics ? topMetrics(report.metrics) : [];

  // Visual size hierarchy for metrics
  const METRIC_SIZES = [22, 18, 16, 14];

  return (
    <div style={{ maxWidth: "860px" }}>

      {/* Breadcrumb header */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "7px" }}>
          <p style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, letterSpacing: "0.3px" }}>
            relatórios / {report.ticker.toLowerCase()} / {period ? period.replace("resultado do ", "").replace(" de ", " ").replace("º trimestre", "t").replace("º semestre", "s") : docType}
          </p>
          {novel ? (
            <div style={{ background: S.accentD, border: `1px solid ${S.accentB}`, color: S.accent, fontFamily: S.mono, fontSize: "9px", fontWeight: 600, padding: "3px 10px", borderRadius: "5px", letterSpacing: "0.6px", flexShrink: 0 }}>
              novo
            </div>
          ) : (
            <span style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, flexShrink: 0 }}>{relTime}</span>
          )}
        </div>
        <p style={{ fontFamily: S.sans, fontSize: "14px", fontWeight: 500, color: "rgba(237,237,234,0.45)", lineHeight: 1.4 }}>
          {titleLine}
        </p>
      </div>

      <div style={{ height: "1px", background: S.border, marginBottom: "32px" }} />

      {/* Body: left + right */}
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "320px" }}>

        {/* Left column */}
        <div style={{ borderRight: `1px solid ${S.border}`, paddingRight: "28px", display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1 }}>
            {/* Ticker */}
            <div style={{ fontFamily: S.mono, fontSize: "46px", fontWeight: 700, color: S.textP, letterSpacing: "-2px", lineHeight: 1, marginBottom: "10px" }}>
              {report.ticker}
            </div>
            {/* Period label */}
            <div style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, letterSpacing: "0.2px", lineHeight: 1.5, marginBottom: metrics.length > 0 ? "24px" : "0" }}>
              {period ? period.replace("resultado do ", "") : docType}
            </div>

            {/* Metrics with visual hierarchy */}
            {metrics.map((m, i) => (
              <div key={m.key} style={{ marginBottom: i < metrics.length - 1 ? "16px" : "0" }}>
                <div style={{
                  fontFamily: S.mono,
                  fontSize: `${METRIC_SIZES[i] ?? 14}px`,
                  fontWeight: 700,
                  color: m.accent ? S.accent : S.textP,
                  letterSpacing: i === 0 ? "-1px" : "-0.5px",
                  lineHeight: 1,
                }}>
                  {m.value}
                </div>
                <div style={{ fontFamily: S.mono, fontSize: "9px", color: S.textT, letterSpacing: "0.2px", marginTop: "4px" }}>
                  {m.label}
                </div>
              </div>
            ))}
          </div>

          {/* Generated date */}
          <div style={{ borderTop: `1px solid ${S.border}`, paddingTop: "16px", marginTop: "28px" }}>
            <div style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, letterSpacing: "0.2px", lineHeight: 1.8 }}>
              gerado em<br />{day} {month} {year} · {time}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ paddingLeft: "28px", display: "flex", flexDirection: "column", gap: "0" }}>

          {/* DESTAQUE */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontFamily: S.mono, fontSize: "9px", letterSpacing: "1.6px", textTransform: "uppercase" as const, color: S.textT, fontWeight: 600, marginBottom: "12px" }}>
              Destaque
            </div>
            <p style={{ fontFamily: S.sans, fontSize: "14px", color: S.textS, lineHeight: 1.85, margin: 0 }}>
              <RichText text={parsed.destaque} />
            </p>

            {/* Blockquote callout */}
            {parsed.quote && (
              <div style={{
                borderLeft: `2px solid rgba(94,184,138,0.35)`,
                paddingLeft: "16px",
                marginTop: "16px",
              }}>
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
              <div style={{ fontFamily: S.mono, fontSize: "9px", letterSpacing: "1.6px", textTransform: "uppercase" as const, color: S.textT, fontWeight: 600, marginBottom: "12px" }}>
                Movimentações
              </div>
              <p style={{ fontFamily: S.sans, fontSize: "14px", color: S.textS, lineHeight: 1.85, margin: 0 }}>
                <RichText text={parsed.movimentacoes} />
              </p>
            </div>
          )}

          {/* ENTREGUE VIA + DOCUMENTO */}
          <div>
            <div style={{ height: "1px", background: S.border, marginBottom: "20px" }} />
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
              <div>
                <div style={{ fontFamily: S.mono, fontSize: "9px", letterSpacing: "1.6px", textTransform: "uppercase" as const, color: S.textT, fontWeight: 600, marginBottom: "10px" }}>
                  Entregue via
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {(["e-mail", "telegram"] as const).map(ch => (
                    <span key={ch} style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, border: `1px solid ${S.borderS}`, borderRadius: "5px", padding: "3px 10px", letterSpacing: "0.3px" }}>
                      {ch}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: S.mono, fontSize: "9px", letterSpacing: "1.6px", textTransform: "uppercase" as const, color: S.textT, fontWeight: 600, marginBottom: "10px" }}>
                  Documento
                </div>
                <a href={report.source_url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, textDecoration: "underline", textUnderlineOffset: "3px" }}>
                  ver original
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "40px", marginTop: "40px", borderTop: `1px solid ${S.border}` }}>
        <button
          onClick={prev} disabled={index === 0} aria-label="Relatório anterior"
          style={{ fontFamily: S.mono, fontSize: "10px", color: index === 0 ? S.textT : "rgba(237,237,234,0.35)", background: "transparent", border: "none", padding: "0", cursor: index === 0 ? "default" : "pointer", opacity: index === 0 ? 0.3 : 1, letterSpacing: "0.3px" }}
        >
          relatório anterior
        </button>
        <span style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, letterSpacing: "0.3px" }}>
          {index + 1} de {reports.length} relatórios
        </span>
        <button
          onClick={next} disabled={index === reports.length - 1} aria-label="Próximo relatório"
          style={{ fontFamily: S.mono, fontSize: "10px", color: index === reports.length - 1 ? S.textT : "rgba(237,237,234,0.35)", background: "transparent", border: "none", padding: "0", cursor: index === reports.length - 1 ? "default" : "pointer", opacity: index === reports.length - 1 ? 0.3 : 1, letterSpacing: "0.3px" }}
        >
          próximo relatório
        </button>
      </div>
    </div>
  );
}
