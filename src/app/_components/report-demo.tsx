/**
 * Réplica do relatório do HGLG11 como ele aparece no painel, usada na
 * demonstração da landing.
 *
 * O conteúdo é o de um relatório de verdade, gerado pelo sistema. O layout
 * não usa as classes responsivas do app de propósito: aqui quem manda é o
 * aparelho desenhado em volta, não a largura da janela. Por isso a variante
 * vem por propriedade, e os tamanhos são fixos; quem encolhe tudo para caber
 * na moldura é o transform de escala em device-showcase.
 */

const D = {
  border:   "rgba(237,237,234,0.07)",
  borderSt: "rgba(237,237,234,0.12)",
  textP:    "#ededea",
  textS:    "rgba(237,237,234,0.55)",
  textT:    "rgba(237,237,234,0.22)",
  accent:   "#5eb88a",
  sans:     "var(--font-sans)",
  mono:     "var(--font-mono)",
} as const;

const ROTULO = {
  fontFamily: D.mono,
  fontSize: "9px",
  letterSpacing: "1.6px",
  textTransform: "uppercase" as const,
  color: D.textT,
  fontWeight: 600,
};

const METRICAS = [
  { valor: "R$1,17", rotulo: "rend. distribuído por cota", tamanho: 22 },
  { valor: "8,4%",   rotulo: "dividend yield",             tamanho: 18 },
  { valor: "R$7,6bi", rotulo: "patrimônio líquido",        tamanho: 16 },
];

function Ficha() {
  return (
    <>
      <div style={{ fontFamily: D.mono, fontSize: "46px", fontWeight: 700, color: D.textP, letterSpacing: "-2px", lineHeight: 1, marginBottom: "10px" }}>
        HGLG11
      </div>
      <div style={{ fontFamily: D.mono, fontSize: "10px", color: D.textT, lineHeight: 1.5 }}>HGLG11</div>
      <div style={{ fontFamily: D.mono, fontSize: "10px", color: D.textT, lineHeight: 1.5, marginBottom: "24px" }}>
        informe mensal
      </div>

      {METRICAS.map((m, i) => (
        <div key={m.rotulo} style={{ marginBottom: i < METRICAS.length - 1 ? "16px" : "0" }}>
          <div style={{ fontFamily: D.mono, fontSize: `${m.tamanho}px`, fontWeight: 700, color: D.textP, letterSpacing: i === 0 ? "-1px" : "-0.5px", lineHeight: 1 }}>
            {m.valor}
          </div>
          <div style={{ fontFamily: D.mono, fontSize: "9px", color: D.textT, marginTop: "4px" }}>{m.rotulo}</div>
        </div>
      ))}
    </>
  );
}

function Gerado() {
  return (
    <div style={{ fontFamily: D.mono, fontSize: "10px", color: D.textT, lineHeight: 1.8 }}>
      gerado em<br />31 jul 2026 · 21:00
    </div>
  );
}

function Texto() {
  return (
    <>
      <div style={{ ...ROTULO, marginBottom: "12px" }}>Destaque</div>
      <p style={{ fontFamily: D.sans, fontSize: "14px", color: D.textS, lineHeight: 1.85, margin: 0 }}>
        Rendimento estimado de <strong style={{ color: D.textP, fontWeight: 700 }}>R$ 1,17 por cota</strong> no
        mês de agosto de 2026, com dividend yield anualizado de{" "}
        <strong style={{ color: D.textP, fontWeight: 700 }}>8,44%</strong>. A rentabilidade patrimonial foi
        negativa em 0,21% no período, refletindo ajustes de mercado nos ativos imobiliários.
      </p>

      <div style={{ borderLeft: "2px solid rgba(94,184,138,0.35)", paddingLeft: "16px", marginTop: "16px" }}>
        <p style={{ fontFamily: D.sans, fontSize: "13px", color: "rgba(237,237,234,0.40)", lineHeight: 1.75, fontStyle: "italic", margin: 0 }}>
          <strong style={{ color: "rgba(237,237,234,0.62)", fontWeight: 700 }}>
            Patrimônio líquido de R$ 7,57 bilhões
          </strong>{" "}
          sustentado por imóveis de renda prontos que representam 93% dos investimentos totais do fundo.
        </p>
      </div>

      <div style={{ height: "1px", background: D.border, margin: "24px 0 20px" }} />

      <div style={{ ...ROTULO, marginBottom: "12px" }}>Movimentações</div>
      <p style={{ fontFamily: D.sans, fontSize: "14px", color: D.textS, lineHeight: 1.85, margin: 0 }}>
        O fundo mantém posição diversificada com 148,5 milhões investidos em outros FIIs e 31,7 milhões
        em CRI/CRA, ampliando fontes de renda além do portfólio imobiliário direto. Dívida securitizada
        representa 51% do passivo total, estrutura já contratada que não requer novas captações.
      </p>

      <div style={{ background: "rgba(237,80,50,0.05)", border: "1px solid rgba(237,80,50,0.12)", borderRadius: "6px", padding: "12px 14px", marginTop: "24px" }}>
        <div style={{ ...ROTULO, color: "rgba(237,100,80,0.55)", letterSpacing: "1.4px", marginBottom: "6px" }}>Atenção</div>
        <p style={{ fontFamily: D.sans, fontSize: "13px", color: "rgba(237,150,130,0.70)", lineHeight: 1.7, margin: 0 }}>
          Aluguéis a receber totalizam 59 milhões de reais, sinalizando potencial inadimplência ou
          atrasos que merecem acompanhamento nos próximos meses.
        </p>
      </div>

      <div style={{ background: "rgba(237,237,234,0.02)", border: `1px solid ${D.border}`, borderRadius: "6px", padding: "16px 18px", marginTop: "24px" }}>
        <div style={{ ...ROTULO, marginBottom: "14px" }}>Glossário</div>
        <div style={{ fontFamily: D.mono, fontSize: "11px", fontWeight: 700, color: D.textP, marginBottom: "4px" }}>CRI</div>
        <p style={{ fontFamily: D.sans, fontSize: "12px", color: "rgba(237,237,234,0.38)", lineHeight: 1.65, margin: 0 }}>
          Certificado de Recebíveis Imobiliários: um título de dívida em que o investidor empresta
          dinheiro para o setor imobiliário e recebe juros.
        </p>
      </div>

      <div style={{ height: "1px", background: D.border, margin: "24px 0 20px" }} />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
        <div>
          <div style={{ ...ROTULO, marginBottom: "10px" }}>Entregue via</div>
          <div style={{ display: "flex", gap: "8px" }}>
            {["e-mail", "telegram"].map(c => (
              <span key={c} style={{ fontFamily: D.mono, fontSize: "10px", color: D.textT, border: `1px solid ${D.borderSt}`, borderRadius: "5px", padding: "3px 10px" }}>
                {c}
              </span>
            ))}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ ...ROTULO, marginBottom: "10px" }}>Documento</div>
          <span style={{ fontFamily: D.mono, fontSize: "10px", color: D.textT, textDecoration: "underline", textUnderlineOffset: "3px" }}>
            ver original
          </span>
        </div>
      </div>
    </>
  );
}

export function ReportDemo({ layout }: { layout: "duas-colunas" | "empilhado" }) {
  const duasColunas = layout === "duas-colunas";

  return (
    <div style={{ background: "#07080a", padding: duasColunas ? "26px 28px" : "20px 18px" }}>
      {/* Cabeçalho */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "14px", marginBottom: "7px" }}>
        <p style={{ fontFamily: D.mono, fontSize: "10px", color: D.textT, margin: 0 }}>
          relatórios / hglg11 / informe mensal
        </p>
        <span style={{ fontFamily: D.mono, fontSize: "10px", color: D.textT, flexShrink: 0 }}>31 jul</span>
      </div>
      <p style={{ fontFamily: D.sans, fontSize: "14px", fontWeight: 500, color: "rgba(237,237,234,0.45)", lineHeight: 1.4, margin: 0 }}>
        Informe Mensal, PÁTRIA LOG, FUNDO DE INVESTIMENTO IMOBILIÁRIO (08/2026)
      </p>

      <div style={{ height: "1px", background: D.border, margin: "20px 0 28px" }} />

      {duasColunas ? (
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr" }}>
          <div style={{ borderRight: `1px solid ${D.border}`, paddingRight: "28px", display: "flex", flexDirection: "column" }}>
            <div style={{ flex: 1 }}><Ficha /></div>
            <div style={{ borderTop: `1px solid ${D.border}`, paddingTop: "16px", marginTop: "28px" }}>
              <Gerado />
            </div>
          </div>
          <div style={{ paddingLeft: "28px", minWidth: 0 }}>
            <Texto />
          </div>
        </div>
      ) : (
        <div>
          <div style={{ borderBottom: `1px solid ${D.border}`, paddingBottom: "22px", marginBottom: "22px" }}>
            <Ficha />
          </div>
          <Texto />
          <div style={{ borderTop: `1px solid ${D.border}`, paddingTop: "16px", marginTop: "24px" }}>
            <Gerado />
          </div>
        </div>
      )}
    </div>
  );
}
