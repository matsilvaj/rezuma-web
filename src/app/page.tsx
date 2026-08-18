import Link from "next/link";
import { HeroSection } from "./_components/hero-section";

const S = {
  bg:         "#07080a",
  surface:    "#0d0f11",
  border:     "rgba(237,237,234,0.07)",
  borderSt:   "rgba(237,237,234,0.12)",
  textP:      "#ededea",
  textS:      "rgba(237,237,234,0.40)",
  textT:      "rgba(237,237,234,0.18)",
  accent:     "#5eb88a",
  accentDim:  "rgba(94,184,138,0.12)",
  accentBd:   "rgba(94,184,138,0.25)",
  sans:       "var(--font-sans)",
  mono:       "var(--font-mono)",
} as const;

const STEPS = [
  {
    n: "01",
    title: "Adicione seus ativos",
    desc: "Informe os FIIs e ações que você já tem na carteira. Pode ser só um ou vinte.",
  },
  {
    n: "02",
    title: "A IA lê os documentos",
    desc: "Quando um novo relatório é publicado na CVM, FNET ou StatusInvest, o sistema lê e processa automaticamente.",
  },
  {
    n: "03",
    title: "Você recebe o resumo",
    desc: "O que importa chega no seu e-mail e Telegram, em linguagem clara, sem precisar abrir o PDF de 80 páginas.",
  },
] as const;

export default function HomePage() {
  return (
    <main style={{ background: S.bg, fontFamily: S.sans }}>
      <HeroSection />

      {/* Como funciona */}
      <section
        style={{
          padding: "120px 36px",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <p
          style={{
            fontFamily: S.mono,
            fontSize: "10px",
            letterSpacing: "2px",
            color: S.textT,
            textTransform: "uppercase",
            marginBottom: "64px",
          }}
        >
          como funciona
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {STEPS.map((step, i) => (
            <div
              key={step.n}
              style={{
                display: "grid",
                gridTemplateColumns: "80px 1fr",
                gap: "32px",
                padding: "32px 0",
                borderTop: i === 0 ? `1px solid ${S.border}` : undefined,
                borderBottom: `1px solid ${S.border}`,
                alignItems: "start",
              }}
            >
              <div
                style={{
                  fontFamily: S.mono,
                  fontSize: "13px",
                  color: S.textT,
                  letterSpacing: "0.5px",
                  paddingTop: "3px",
                }}
              >
                {step.n}
              </div>
              <div>
                <div
                  style={{
                    fontSize: "17px",
                    fontWeight: 600,
                    color: S.textP,
                    letterSpacing: "-0.3px",
                    marginBottom: "10px",
                  }}
                >
                  {step.title}
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: S.textS,
                    lineHeight: 1.75,
                  }}
                >
                  {step.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Exemplo de relatório */}
      <section
        id="exemplo"
        style={{
          padding: "0 36px 120px",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <p
          style={{
            fontFamily: S.mono,
            fontSize: "10px",
            letterSpacing: "2px",
            color: S.textT,
            textTransform: "uppercase",
            marginBottom: "40px",
          }}
        >
          exemplo real
        </p>

        <div
          style={{
            background: S.surface,
            border: `1px solid ${S.borderSt}`,
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          {/* Report header */}
          <div
            style={{
              padding: "18px 24px",
              borderBottom: `1px solid ${S.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: S.mono,
                  fontSize: "10px",
                  color: S.textT,
                  letterSpacing: "0.5px",
                  marginBottom: "4px",
                }}
              >
                relatórios / knri11 / 3t25
              </div>
              <div style={{ fontSize: "13px", fontWeight: 500, color: S.textS }}>
                Kinea Renda Imobiliária — resultado do 3º trimestre de 2025
              </div>
            </div>
            <div
              style={{
                background: S.accentDim,
                border: `1px solid ${S.accentBd}`,
                color: S.accent,
                fontFamily: S.mono,
                fontSize: "10px",
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: "5px",
                letterSpacing: "0.3px",
                flexShrink: 0,
              }}
            >
              novo
            </div>
          </div>

          {/* Asymmetric split */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "200px 1fr",
            }}
          >
            <div
              style={{
                borderRight: `1px solid ${S.border}`,
                padding: "24px 20px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "24px",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: S.mono,
                    fontSize: "34px",
                    fontWeight: 700,
                    color: S.textP,
                    letterSpacing: "-1.5px",
                    lineHeight: 1,
                    marginBottom: "4px",
                  }}
                >
                  KNRI11
                </div>
                <div
                  style={{
                    fontFamily: S.mono,
                    fontSize: "10px",
                    color: S.textT,
                    letterSpacing: "0.3px",
                    marginBottom: "28px",
                  }}
                >
                  3T25 · agosto 2025
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  {[
                    { val: "R$0,89", label: "resultado distribuível por cota", positive: true },
                    { val: "3,2%",   label: "vacância física", positive: false },
                    { val: "+3,5%",  label: "variação vs 2T25", positive: true },
                    { val: "68%",    label: "contratos atípicos", positive: false },
                  ].map((m) => (
                    <div key={m.label}>
                      <div
                        style={{
                          fontFamily: S.mono,
                          fontSize: "18px",
                          fontWeight: 700,
                          color: m.positive ? S.accent : S.textP,
                          letterSpacing: "-0.6px",
                          lineHeight: 1,
                        }}
                      >
                        {m.val}
                      </div>
                      <div style={{ fontSize: "10px", color: S.textT, marginTop: "3px" }}>
                        {m.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  borderTop: `1px solid ${S.border}`,
                  paddingTop: "14px",
                }}
              >
                <div
                  style={{
                    fontFamily: S.mono,
                    fontSize: "10px",
                    color: S.textT,
                    lineHeight: 1.7,
                  }}
                >
                  gerado em<br />18 ago 2025 · 08:14
                </div>
              </div>
            </div>

            <div style={{ padding: "24px" }}>
              {[
                {
                  label: "Destaque",
                  content: (
                    <>
                      Resultado distribuível de{" "}
                      <strong style={{ color: S.textP, fontWeight: 600 }}>R$0,89 por cota</strong>, alta de
                      3,5% frente ao 2T25. Vacância física mantida em 3,2%, abaixo da média setorial de
                      6,1%. Fundo permanece entre os mais defensivos do segmento logístico.
                      <div
                        style={{
                          borderLeft: `2px solid ${S.borderSt}`,
                          padding: "9px 12px",
                          marginTop: "12px",
                          fontSize: "12px",
                          color: S.textT,
                          lineHeight: 1.7,
                          fontStyle: "italic",
                        }}
                      >
                        <strong style={{ color: S.textS, fontStyle: "normal" }}>
                          Contratos atípicos representam 68% da receita
                        </strong>
                        , conferindo previsibilidade de caixa até 2028.
                      </div>
                    </>
                  ),
                },
                {
                  label: "Movimentações",
                  content: (
                    <>
                      Gestão sinalizou{" "}
                      <strong style={{ color: S.textP, fontWeight: 600 }}>
                        aquisição de dois galpões em Guarulhos
                      </strong>
                      , com impacto positivo esperado no portfólio a partir do 1T26.
                    </>
                  ),
                },
              ].map((block, i) => (
                <div key={block.label}>
                  {i > 0 && (
                    <div
                      style={{
                        height: "1px",
                        background: S.border,
                        margin: "20px 0",
                      }}
                    />
                  )}
                  <div
                    style={{
                      fontSize: "9px",
                      letterSpacing: "1.4px",
                      textTransform: "uppercase",
                      color: S.textT,
                      fontWeight: 600,
                      marginBottom: "10px",
                    }}
                  >
                    {block.label}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: S.textS,
                      lineHeight: 1.75,
                    }}
                  >
                    {block.content}
                  </div>
                </div>
              ))}

              <div style={{ height: "1px", background: S.border, margin: "20px 0" }} />
              <div
                style={{
                  fontSize: "9px",
                  letterSpacing: "1.4px",
                  textTransform: "uppercase",
                  color: S.textT,
                  fontWeight: 600,
                  marginBottom: "10px",
                }}
              >
                Entregue via
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                {["e-mail", "telegram"].map((ch) => (
                  <div
                    key={ch}
                    style={{
                      fontFamily: S.mono,
                      fontSize: "10px",
                      color: S.textT,
                      border: `1px solid ${S.borderSt}`,
                      borderRadius: "5px",
                      padding: "4px 10px",
                    }}
                  >
                    {ch}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section
        style={{
          padding: "0 36px 120px",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <p
          style={{
            fontFamily: S.mono,
            fontSize: "10px",
            letterSpacing: "2px",
            color: S.textT,
            textTransform: "uppercase",
            marginBottom: "40px",
          }}
        >
          quem usa
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {[
            {
              text: "Eu tinha MXRF11, HGLG11 e KNRI11 e todo mês recebia um PDF de 40 páginas que nunca abria. Agora chega uma mensagem no Telegram e em dois minutos já sei se foi um bom mês ou não.",
              name: "Marcos R.",
              detail: "investidor de FIIs desde 2019",
            },
            {
              text: "Perdia muito tempo tentando entender os resultados trimestrais das ações. Agora quando sai o resultado da VALE3 eu já recebo o que importa direto no e-mail, sem precisar abrir o documento.",
              name: "Ana F.",
              detail: "carteira diversificada, investe há 4 anos",
            },
            {
              text: "Pensei duas vezes antes de assinar mais uma coisa. Mas R$4,90 é menos do que pago de taxa num único aporte. Pagou na primeira vez que recebi um alerta antes de ver a cota cair.",
              name: "Rafael S.",
              detail: "foco em renda passiva",
            },
          ].map((q, i, arr) => (
            <div
              key={q.name}
              style={{
                padding: "28px 0",
                borderTop: i === 0 ? `1px solid ${S.border}` : undefined,
                borderBottom: `1px solid ${S.border}`,
                display: "grid",
                gridTemplateColumns: "1fr 200px",
                gap: "48px",
                alignItems: "start",
              }}
            >
              <p style={{ fontSize: "15px", color: S.textS, lineHeight: 1.8, margin: 0 }}>
                "{q.text}"
              </p>
              <div>
                <div style={{ fontFamily: S.mono, fontSize: "12px", fontWeight: 700, color: S.textP, letterSpacing: "-0.3px" }}>
                  {q.name}
                </div>
                <div style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, marginTop: "4px", lineHeight: 1.5 }}>
                  {q.detail}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Preços */}
      <section
        style={{
          padding: "0 36px 120px",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <p
          style={{
            fontFamily: S.mono,
            fontSize: "10px",
            letterSpacing: "2px",
            color: S.textT,
            textTransform: "uppercase",
            marginBottom: "16px",
          }}
        >
          preço
        </p>

        <p style={{ fontSize: "14px", color: S.textS, lineHeight: 1.75, marginBottom: "40px", maxWidth: "480px" }}>
          Pensado para não competir com os seus aportes. Custa menos do que a maioria das taxas de corretagem.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}
        >
          {[
            {
              period: "Mensal",
              price: "R$4,90",
              unit: "/mês",
              desc: "Cancele quando quiser.",
              cta: "Começar agora",
              featured: false,
            },
            {
              period: "Anual",
              price: "R$49,90",
              unit: "/ano",
              desc: "Equivale a R$4,15/mês. Dois meses grátis.",
              cta: "Começar agora",
              featured: true,
            },
          ].map((plan) => (
            <div
              key={plan.period}
              style={{
                background: S.surface,
                border: `1px solid ${plan.featured ? S.borderSt : S.border}`,
                borderRadius: "12px",
                padding: "28px 24px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: S.textT,
                  letterSpacing: "0.3px",
                  marginBottom: "16px",
                }}
              >
                {plan.period}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "8px" }}>
                <span
                  style={{
                    fontFamily: S.mono,
                    fontSize: "32px",
                    fontWeight: 700,
                    color: S.textP,
                    letterSpacing: "-1px",
                  }}
                >
                  {plan.price}
                </span>
                <span style={{ fontSize: "13px", color: S.textT }}>{plan.unit}</span>
              </div>
              <div style={{ fontSize: "13px", color: S.textT, marginBottom: "28px", lineHeight: 1.6 }}>
                {plan.desc}
              </div>
              <Link
                href="/register"
                style={{
                  display: "block",
                  textAlign: "center",
                  fontFamily: S.sans,
                  fontSize: "13px",
                  fontWeight: 600,
                  textDecoration: "none",
                  padding: "11px 0",
                  borderRadius: "7px",
                  background: plan.featured ? S.textP : "transparent",
                  color: plan.featured ? S.bg : S.textS,
                  border: plan.featured ? "none" : `1px solid ${S.border}`,
                  letterSpacing: "-0.1px",
                }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p
          style={{
            fontSize: "12px",
            color: S.textT,
            marginTop: "20px",
            lineHeight: 1.6,
          }}
        >
          Garantia de reembolso em 30 dias. Sem perguntas.
        </p>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: `1px solid ${S.border}`,
          padding: "28px 36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <img src="/logo.svg" alt="Rezuma" height={18} style={{ display: "block", opacity: 0.35 }} />
        <div style={{ display: "flex", gap: "24px" }}>
          <Link href="/login"    style={{ fontSize: "12px", color: S.textT, textDecoration: "none" }}>Entrar</Link>
          <Link href="/register" style={{ fontSize: "12px", color: S.textT, textDecoration: "none" }}>Criar conta</Link>
        </div>
      </footer>
    </main>
  );
}
