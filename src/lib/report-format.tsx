"use client";

import { Fragment } from "react";

/**
 * Formatação e parsing compartilhados entre a lista de relatórios
 * (/dashboard) e o relatório individual (/dashboard/[id]).
 */

export const S = {
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

export function fmtDate(dateStr: string) {
  const d = new Date(dateStr);
  return {
    day:   String(d.getDate()).padStart(2, "0"),
    month: MONTHS_SHORT[d.getMonth()],
    year:  d.getFullYear(),
    time:  d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
  };
}

export function relativeLabel(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "agora";
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `há ${d}d`;
  const t = fmtDate(dateStr);
  return `${t.day} ${t.month}`;
}

export function normalizeDocType(raw: string): string {
  return raw.replace(/_/g, " ").toLowerCase();
}

export function extractPeriod(title: string): string | null {
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

/** Rótulo curto do período para breadcrumb e lista: "3t25". */
export function shortPeriod(title: string, docType: string): string {
  const p = extractPeriod(title);
  if (!p) return normalizeDocType(docType);
  return p
    .replace("resultado do ", "")
    .replace(" de ", " ")
    .replace("º trimestre", "t")
    .replace("º semestre", "s");
}

// ── Text sanitizer ─────────────────────────────────────────────────────────

function sanitize(text: string): string {
  return text.replace(/\s*[—–]\s*/g, ", ");
}

// ── Rich text renderer (parses **bold** markdown) ──────────────────────────

export function RichText({ text, style }: { text: string; style?: React.CSSProperties }) {
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

export interface ParsedSummary {
  destaque:      string;
  quote:         string | null;
  movimentacoes: string;
  atencao:       string | null;
  impacto:       string | null;
}

/**
 * Seções do resumo gerado pela IA. DESTAQUE e MOVIMENTAÇÕES são sempre
 * esperados; ATENÇÃO e IMPACTO só existem em alguns tipos de documento, e
 * apenas quando há o que dizer. IMPACTO é sempre a última seção.
 */
export function parseSummary(summary: string): ParsedSummary {
  const dm = summary.match(/^DESTAQUE:\s*([\s\S]*?)(?=\n*MOVIMENTA)/im);
  const mm = summary.match(/MOVIMENTA[ÇC][OÕ]ES:\s*([\s\S]*?)(?=\n*(?:ATEN[ÇC][AÃ]O:|IMPACTO:)|$)/im);
  const am = summary.match(/ATEN[ÇC][AÃ]O:\s*([\s\S]*?)(?=\n*IMPACTO:|$)/im);
  const im = summary.match(/IMPACTO:\s*([\s\S]*)$/im);

  if (dm && mm) {
    const dLines   = dm[1].trim().split("\n");
    const quoteL   = dLines.find(l => l.trim().startsWith(">"));
    const quote    = quoteL ? quoteL.trim().replace(/^>\s*/, "") : null;
    const destaque = dLines.filter(l => !l.trim().startsWith(">")).join(" ").trim();

    return {
      destaque,
      quote,
      movimentacoes: mm[1].trim(),
      atencao: am ? am[1].trim() || null : null,
      impacto: im ? im[1].trim() || null : null,
    };
  }

  // Fallback para relatórios gerados antes do formato estruturado
  const blocks = summary.split(/\n\n+/).map(b => b.trim()).filter(Boolean);
  return {
    destaque: blocks[0] ?? summary,
    quote: null,
    movimentacoes: blocks.slice(1).join("\n\n"),
    atencao: null,
    impacto: null,
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

// Métricas em que um valor maior é diretamente favorável ao investidor
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

export interface MetricItem { key: string; label: string; value: string; accent: boolean; }

export function topMetrics(m: Record<string, number | string | null>): MetricItem[] {
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

/** Tamanhos em px para a hierarquia visual das métricas na coluna esquerda. */
export const METRIC_SIZES = [22, 18, 16, 14];
