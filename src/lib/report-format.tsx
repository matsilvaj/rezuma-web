"use client";

import { Fragment } from "react";
import { Report } from "@/types";

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

/** "3t25" quando o título carrega o período; null quando não carrega. */
export function periodTag(title: string): string | null {
  const p = extractPeriod(title);
  if (!p) return null;
  return p
    .replace("resultado do ", "")
    .replace(" de ", " ")
    .replace("º trimestre", "t")
    .replace("º semestre", "s");
}

/** Igual ao periodTag, mas cai no tipo de documento quando não há período. */
export function shortPeriod(title: string, docType: string): string {
  return periodTag(title) ?? normalizeDocType(docType);
}

const DOC_TYPE_LABELS: Record<string, string> = {
  relatorio_gerencial:     "relatório gerencial",
  informe_mensal:          "informe mensal",
  fato_relevante:          "fato relevante",
  apresentacao_resultados: "apresentação de resultados",
  itr:                     "resultado trimestral",
  dfp:                     "resultado anual",
};

/** Nome legível do tipo de documento, com acento. */
export function docTypeLabel(docType: string): string {
  return DOC_TYPE_LABELS[docType] ?? normalizeDocType(docType);
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

// ── Metrics ───────────────────────────────────────────────────────────────

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
  patrimonio_liquido:       "patrimônio líquido",
  roe_percentual:           "retorno sobre patrimônio",
  indice_basileia:          "índice de Basileia",
  indice_eficiencia_percentual: "índice de eficiência",
  margem_financeira:        "margem financeira",
};

/** Métricas em que cair é a boa notícia. */
const LOWER_IS_BETTER = new Set([
  "vacancia_percentual", "inadimplencia_percentual", "divida_liquida_ebitda",
  // Eficiência bancária é despesa sobre receita: quanto menor, melhor
  "indice_eficiencia_percentual",
]);

/**
 * Métricas sem direção óbvia: P/VP caindo tanto pode ser oportunidade quanto
 * o mercado precificando risco. Sem cor, para não afirmar o que não se sabe.
 */
const AMBIGUOUS = new Set(["pvp"]);

function isPercent(key: string): boolean {
  return key.includes("percentual")
    || key === "dy_percentual"
    || key === "dy_anualizado"
    || key === "indice_basileia";
}

/** 1 → "1", 1.5 → "1,5" — sem casa decimal inútil. */
function dec1(n: number): string {
  return n.toFixed(1).replace(/\.0$/, "").replace(".", ",");
}

function fmtMoney(value: number): string {
  const abs = Math.abs(value);
  const sinal = value < 0 ? "-" : "";
  if (abs >= 1e9) return `${sinal}R$${dec1(abs / 1e9)}bi`;
  if (abs >= 1e6) return `${sinal}R$${dec1(abs / 1e6)}mi`;
  if (abs >= 1e3) return `${sinal}R$${(abs / 1e3).toFixed(0)} mil`;
  return `${sinal}R$${abs.toFixed(0)}`;
}

function fmtMetric(key: string, value: number | string | null): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (key.includes("rendimento") || key.includes("valor_patrimonial") || key === "dividendo_por_acao")
    return `R$${value.toFixed(2).replace(".", ",")}`;
  if (isPercent(key))
    return `${value.toFixed(1).replace(".", ",")}%`;
  if (key === "pvp" || key === "divida_liquida_ebitda")
    return `${value.toFixed(2).replace(".", ",")}x`;
  if (["receita_liquida","lucro_liquido","ebitda","patrimonio_liquido","margem_financeira"].includes(key))
    return fmtMoney(value);
  return String(value);
}

/**
 * A ordem certa depende do que o ativo é. Um banco não tem EBITDA nem margem
 * relevante; tem ROE, inadimplência e Basileia. Uma empresa comum é o oposto.
 * O tipo é deduzido das próprias métricas presentes, sem precisar consultar o
 * catálogo: só banco reporta Basileia, só FII reporta vacância.
 */
const PRIORITY_FII = [
  "rendimento_por_cota","dy_percentual","dy_anualizado","vacancia_percentual",
  "pvp","valor_patrimonial_cota","inadimplencia_percentual","patrimonio_liquido",
];

const PRIORITY_BANCO = [
  "lucro_liquido","roe_percentual","inadimplencia_percentual","indice_basileia",
  "margem_financeira","indice_eficiencia_percentual","margem_liquida_percentual",
  "dividendo_por_acao",
];

const PRIORITY_EMPRESA = [
  "lucro_liquido","receita_liquida","margem_liquida_percentual","divida_liquida_ebitda",
  "margem_ebitda_percentual","ebitda","roe_percentual","dividendo_por_acao",
];

function pickPriority(m: Record<string, number | string | null>): string[] {
  if (m.rendimento_por_cota != null || m.vacancia_percentual != null || m.pvp != null)
    return PRIORITY_FII;
  if (m.indice_basileia != null || m.indice_eficiencia_percentual != null || m.margem_financeira != null)
    return PRIORITY_BANCO;
  return PRIORITY_EMPRESA;
}

export interface MetricVariation {
  /** Ex: "▲ 3,5%" ou "▼ 0,3 p.p." */
  label: string;
  /** true melhorou, false piorou, null sem direção definida. */
  better: boolean | null;
}

export interface MetricItem {
  key: string;
  label: string;
  value: string;
  variation: MetricVariation | null;
}

/**
 * Variação frente ao período anterior.
 *
 * Para métricas que já são percentuais, a diferença sai em pontos percentuais:
 * vacância de 3,2% para 2,9% é uma queda de 0,3 p.p., não de 9,4%. Misturar as
 * duas leituras é a confusão clássica desse tipo de indicador.
 */
function variation(
  key: string,
  current: number | string | null,
  previous: number | string | null | undefined,
): MetricVariation | null {
  if (typeof current !== "number" || typeof previous !== "number") return null;

  const delta = current - previous;
  if (delta === 0) return { label: "estável", better: null };

  let texto: string;
  if (isPercent(key)) {
    texto = `${dec1(Math.abs(delta))} p.p.`;
  } else {
    if (previous === 0) return null;
    texto = `${dec1((Math.abs(delta) / Math.abs(previous)) * 100)}%`;
  }

  const better = AMBIGUOUS.has(key)
    ? null
    : LOWER_IS_BETTER.has(key) ? delta < 0 : delta > 0;

  return { label: `${delta > 0 ? "▲" : "▼"} ${texto}`, better };
}

export function topMetrics(
  m: Record<string, number | string | null>,
  previous?: Record<string, number | string | null> | null,
): MetricItem[] {
  const result: MetricItem[] = [];
  for (const key of pickPriority(m)) {
    if (m[key] !== null && m[key] !== undefined) {
      const fmt = fmtMetric(key, m[key]!);
      if (fmt) {
        result.push({
          key,
          label: METRIC_LABELS[key] ?? key,
          value: fmt,
          variation: variation(key, m[key]!, previous?.[key]),
        });
      }
    }
    if (result.length === 4) break;
  }
  return result;
}

/** Tamanhos em px para a hierarquia visual das métricas na coluna esquerda. */
export const METRIC_SIZES = [22, 18, 16, 14];


/**
 * Período de referência do relatório, para saber o que ele cobre.
 * Prefere o campo que a IA extraiu do documento; cai no período do título.
 */
export function periodKey(report: Report): string | null {
  const m = report.metrics ?? {};
  const ref = m.trimestre_referencia ?? m.ano_referencia ?? m.mes_referencia;
  if (typeof ref === "string" && ref.trim()) return ref.trim().toLowerCase();
  return periodTag(report.title);
}

/**
 * Relatório do período ANTERIOR do mesmo ativo e mesmo tipo de documento.
 *
 * O período diferente é a parte que importa: uma empresa publica vários
 * documentos sobre o mesmo trimestre (release, análise de desempenho,
 * balanço), e comparar 2T26 com 2T26 não significa nada. Quando o período não
 * é conhecido dos dois lados, exige ao menos meses distintos.
 *
 * A lista chega ordenada do mais recente para o mais antigo, então o primeiro
 * que casar já é o anterior.
 */
export function findPreviousReport(reports: Report[], current: Report): Report | undefined {
  const t = new Date(current.published_at);
  const periodoAtual = periodKey(current);

  return reports.find(r => {
    if (r.id === current.id) return false;
    if (r.ticker !== current.ticker) return false;
    if (r.document_type !== current.document_type) return false;

    const d = new Date(r.published_at);
    if (d.getTime() >= t.getTime()) return false;

    const periodoAnterior = periodKey(r);
    if (periodoAtual && periodoAnterior) return periodoAnterior !== periodoAtual;

    // Sem período declarado, mês diferente é a melhor aproximação disponível
    return d.getMonth() !== t.getMonth() || d.getFullYear() !== t.getFullYear();
  });
}
