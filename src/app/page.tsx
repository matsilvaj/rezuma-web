import Link from "next/link";
import { HeroSection } from "./_components/hero-section";
import { Testimonials } from "./_components/testimonials";
import { getViewerName } from "@/lib/session";

const S = {
  bg:         "#07080a",
  surface:    "#0d0f11",
  border:     "rgba(237,237,234,0.07)",
  borderSt:   "rgba(237,237,234,0.12)",
  textP:      "#ededea",
  textS:      "rgba(237,237,234,0.40)",
  textT:      "rgba(237,237,234,0.18)",
  accent:     "#5eb88a",
  danger:     "rgba(237,120,100,0.92)",
  sans:       "var(--font-sans)",
  mono:       "var(--font-mono)",
} as const;

const LABEL = {
  fontFamily: S.mono,
  fontSize: "9px",
  letterSpacing: "1.6px",
  textTransform: "uppercase" as const,
  color: S.textT,
  fontWeight: 600,
};

const STEPS = [
  {
    n: "01",
    title: "Você diz o que tem na carteira",
    desc: "Informe os FIIs e as ações que acompanha, até trinta por conta. Sem cartão, sem plano, sem custo.",
  },
  {
    n: "02",
    title: "Nós vigiamos as fontes oficiais",
    desc: "CVM, FNET e B3 são conferidas todos os dias. Relatório gerencial, informe mensal, fato relevante, resultado trimestral: quando um documento seu é publicado, ele é baixado na hora.",
  },
  {
    n: "03",
    title: "O documento vira quatro parágrafos",
    desc: "Um PDF de oitenta páginas é lido inteiro e devolvido no tamanho de uma mensagem, em português comum, com os números conferidos contra o próprio documento.",
  },
  {
    n: "04",
    title: "Chega onde você já olha",
    desc: "E-mail e Telegram, no mesmo dia da publicação. Tudo também fica guardado no painel, organizado por ativo e por período.",
  },
] as const;

const ANATOMY = [
  {
    label: "Destaque",
    desc: "O número que decide o trimestre, em uma frase. Se o lucro caiu, é a primeira coisa que você lê.",
  },
  {
    label: "Movimentações",
    desc: "O que mudou desde o documento anterior: aquisição, emissão, troca de gestor, corte de distribuição.",
  },
  {
    label: "Atenção",
    desc: "O que ainda não é problema, mas pode virar. Vacância subindo três meses seguidos aparece aqui antes de aparecer no seu rendimento.",
  },
  {
    label: "Glossário",
    desc: "Todo termo técnico do resumo vem explicado em uma linha. Você não precisa saber o que é build to suit para entender o que aconteceu.",
  },
] as const;

/* Métricas do exemplo, na ordem em que o painel prioriza para banco. */
const EXAMPLE_METRICS = [
  { value: "8,4%",  label: "retorno sobre patrimônio", size: 22, delta: null },
  { value: "5,6%",  label: "inadimplência",            size: 18, delta: null },
  { value: "11,3%", label: "índice de Basileia",       size: 16, delta: "▼ 2,6 p.p." },
  { value: "28,0%", label: "índice de eficiência",     size: 14, delta: null },
] as const;

function SectionTag({ children, mb = "40px" }: { children: React.ReactNode; mb?: string }) {
  return (
    <p style={{ fontFamily: S.mono, fontSize: "10px", letterSpacing: "2px", color: S.textT, textTransform: "uppercase", marginBottom: mb }}>
      {children}
    </p>
  );
}

export default async function HomePage() {
  const viewerName = await getViewerName();

  return (
    <main style={{ background: S.bg, fontFamily: S.sans }}>
      <HeroSection viewerName={viewerName} />

      {/* O problema */}
      <section style={{ padding: "120px 36px 0", maxWidth: "900px", margin: "0 auto" }}>
        <p style={{ fontSize: "26px", fontWeight: 700, color: S.textP, letterSpacing: "-1px", lineHeight: 1.35, maxWidth: "620px", marginBottom: "20px" }}>
          Ninguém deixa de ler os relatórios por preguiça. Deixa porque são oitenta
          páginas de linguagem contábil por ativo, todo mês.
        </p>
        <p style={{ fontSize: "15px", color: S.textS, lineHeight: 1.8, maxWidth: "560px" }}>
          Então o investidor faz o que dá: olha o rendimento, acha que está tudo bem
          e continua aportando. O problema aparece um ou dois trimestres depois,
          quando já virou preço. O Rezuma existe para fechar essa distância: não
          para dizer o que comprar, mas para você saber o que aconteceu enquanto
          ainda dá tempo de decidir.
        </p>
      </section>

      {/* Como funciona */}
      <section style={{ padding: "88px 36px 0", maxWidth: "900px", margin: "0 auto" }}>
        <SectionTag>como funciona</SectionTag>

        <div>
          {STEPS.map((step, i) => (
            <div
              key={step.n}
              style={{
                display: "grid",
                gridTemplateColumns: "80px 1fr",
                gap: "32px",
                padding: "30px 0",
                borderTop: i === 0 ? `1px solid ${S.border}` : undefined,
                borderBottom: `1px solid ${S.border}`,
                alignItems: "start",
              }}
            >
              <div style={{ fontFamily: S.mono, fontSize: "13px", color: S.textT, letterSpacing: "0.5px", paddingTop: "3px" }}>
                {step.n}
              </div>
              <div>
                <div style={{ fontSize: "17px", fontWeight: 600, color: S.textP, letterSpacing: "-0.3px", marginBottom: "10px" }}>
                  {step.title}
                </div>
                <div style={{ fontSize: "14px", color: S.textS, lineHeight: 1.75, maxWidth: "560px" }}>
                  {step.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Anatomia do resumo */}
      <section style={{ padding: "88px 36px 0", maxWidth: "900px", margin: "0 auto" }}>
        <SectionTag mb="16px">o que vem em cada resumo</SectionTag>
        <p style={{ fontSize: "14px", color: S.textS, lineHeight: 1.75, maxWidth: "520px", marginBottom: "36px" }}>
          Todo resumo sai na mesma estrutura, seja um FII ou uma ação. Você aprende a
          ler uma vez e vale para os outros.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {ANATOMY.map(item => (
            <div
              key={item.label}
              style={{
                background: S.surface,
                border: `1px solid ${S.border}`,
                borderRadius: "10px",
                padding: "20px 22px",
              }}
            >
              <div style={{ ...LABEL, marginBottom: "10px" }}>{item.label}</div>
              <p style={{ fontSize: "13px", color: S.textS, lineHeight: 1.7, margin: 0 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <p style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, lineHeight: 1.8, marginTop: "20px" }}>
          números conferidos contra o texto do próprio documento: na dúvida, a
          métrica é omitida em vez de exibida errada
        </p>
      </section>

      {/* Exemplo real */}
      <section id="exemplo" style={{ padding: "88px 36px 0", maxWidth: "900px", margin: "0 auto" }}>
        <SectionTag mb="16px">exemplo real</SectionTag>
        <p style={{ fontSize: "14px", color: S.textS, lineHeight: 1.75, maxWidth: "520px", marginBottom: "36px" }}>
          Resultado do 2º trimestre do Banco do Brasil, exatamente como aparece no
          painel de quem acompanha BBAS3.
        </p>

        <div
          style={{
            background: S.surface,
            border: `1px solid ${S.borderSt}`,
            borderRadius: "12px",
            padding: "26px 28px",
          }}
        >
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "7px" }}>
            <p style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, letterSpacing: "0.3px", margin: 0 }}>
              relatórios / bbas3 / 2t 2026
            </p>
            <span style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, flexShrink: 0 }}>12 ago</span>
          </div>
          <p style={{ fontSize: "14px", fontWeight: 500, color: "rgba(237,237,234,0.45)", lineHeight: 1.4, margin: 0 }}>
            Apresentação do Resultado 2T26
          </p>

          <div style={{ height: "1px", background: S.border, margin: "20px 0 28px" }} />

          <div style={{ display: "grid", gridTemplateColumns: "220px 1fr" }}>
            {/* Coluna esquerda */}
            <div style={{ borderRight: `1px solid ${S.border}`, paddingRight: "28px", display: "flex", flexDirection: "column" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: S.mono, fontSize: "46px", fontWeight: 700, color: S.textP, letterSpacing: "-2px", lineHeight: 1, marginBottom: "10px" }}>
                  BBAS3
                </div>
                <div style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, letterSpacing: "0.2px", lineHeight: 1.5 }}>
                  BCO BRASIL S.A.
                </div>
                <div style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, letterSpacing: "0.2px", lineHeight: 1.5, marginBottom: "24px" }}>
                  2º trimestre de 2026
                </div>

                <div style={{ fontFamily: S.mono, fontSize: "9px", color: S.textT, letterSpacing: "0.4px", marginBottom: "14px" }}>
                  variação vs 1s26
                </div>

                {EXAMPLE_METRICS.map((m, i) => (
                  <div key={m.label} style={{ marginBottom: i < EXAMPLE_METRICS.length - 1 ? "16px" : "0" }}>
                    <div style={{
                      fontFamily: S.mono,
                      fontSize: `${m.size}px`,
                      fontWeight: 700,
                      color: m.delta ? S.danger : S.textP,
                      letterSpacing: i === 0 ? "-1px" : "-0.5px",
                      lineHeight: 1,
                    }}>
                      {m.value}
                    </div>
                    <div style={{ fontFamily: S.mono, fontSize: "9px", color: S.textT, letterSpacing: "0.2px", marginTop: "4px" }}>
                      {m.label}
                    </div>
                    {m.delta && (
                      <div style={{ fontFamily: S.mono, fontSize: "9px", color: S.danger, opacity: 0.85, marginTop: "3px" }}>
                        {m.delta}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ borderTop: `1px solid ${S.border}`, paddingTop: "16px", marginTop: "28px" }}>
                <div style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, letterSpacing: "0.2px", lineHeight: 1.8 }}>
                  gerado em<br />12 ago 2026 · 08:14
                </div>
              </div>
            </div>

            {/* Coluna direita */}
            <div style={{ paddingLeft: "28px" }}>
              <div style={{ ...LABEL, marginBottom: "12px" }}>Destaque</div>
              <p style={{ fontSize: "14px", color: "rgba(237,237,234,0.55)", lineHeight: 1.85, margin: 0 }}>
                Lucro líquido ajustado de{" "}
                <strong style={{ color: S.textP, fontWeight: 700 }}>R$ 3,9 bilhões</strong> no 2T26,
                crescimento de 13,9% frente ao 1T26 e alta de 3,3% na comparação anual.
                Margem financeira bruta atingiu{" "}
                <strong style={{ color: S.textP, fontWeight: 700 }}>R$ 27,5 bilhões</strong>,
                praticamente estável (+0,2% trimestral) mas forte na comparação com 2T25 (+9,6%).
              </p>

              <div style={{ borderLeft: "2px solid rgba(94,184,138,0.35)", paddingLeft: "16px", marginTop: "16px" }}>
                <p style={{ fontSize: "13px", color: "rgba(237,237,234,0.40)", lineHeight: 1.75, fontStyle: "italic", margin: 0 }}>
                  <strong style={{ color: "rgba(237,237,234,0.62)", fontWeight: 700 }}>
                    Carteira de crédito expandida em R$ 1,313 trilhão
                  </strong>
                  , crescimento de 1,5% em relação a junho de 2025, com destaque para a
                  carteira agro que soma R$ 422 bilhões (+4,1% anual).
                </p>
              </div>

              <div style={{ height: "1px", background: S.border, margin: "24px 0 20px" }} />

              <div style={{ ...LABEL, marginBottom: "12px" }}>Movimentações</div>
              <p style={{ fontSize: "14px", color: "rgba(237,237,234,0.55)", lineHeight: 1.85, margin: 0 }}>
                Inadimplência acima de 90 dias registrada em 5,61% em junho de 2026,
                queda de 2,1% frente ao trimestre anterior. Índice de Basileia (CET1)
                em 11,27%, redução de 0,32 ponto percentual em relação a março de 2026.
                Receitas com prestação de serviços subiram 3,4% trimestral (+4,2% anual)
                para R$ 9,1 bilhões.
              </p>

              {/* Glossário */}
              <div style={{ background: "rgba(237,237,234,0.02)", border: `1px solid ${S.border}`, borderRadius: "6px", padding: "16px 18px", marginTop: "24px" }}>
                <div style={{ ...LABEL, marginBottom: "14px" }}>Glossário</div>
                <div style={{ fontFamily: S.mono, fontSize: "11px", fontWeight: 700, color: S.textP, letterSpacing: "0.2px", marginBottom: "4px" }}>
                  índice de Basileia
                </div>
                <p style={{ fontSize: "12px", color: "rgba(237,237,234,0.38)", lineHeight: 1.65, margin: 0 }}>
                  Medida de segurança de um banco: mostra se ele tem capital próprio
                  suficiente para aguentar perdas. No Brasil o mínimo exigido é 8%.
                </p>
              </div>

              <div style={{ height: "1px", background: S.border, margin: "24px 0 20px" }} />

              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
                <div>
                  <div style={{ ...LABEL, marginBottom: "10px" }}>Entregue via</div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {["e-mail", "telegram"].map(ch => (
                      <span key={ch} style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, border: `1px solid ${S.borderSt}`, borderRadius: "5px", padding: "3px 10px", letterSpacing: "0.3px" }}>
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ ...LABEL, marginBottom: "10px" }}>Documento</div>
                  <span style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, textDecoration: "underline", textUnderlineOffset: "3px" }}>
                    ver original
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, lineHeight: 1.8, marginTop: "16px" }}>
          o documento original fica sempre a um clique: o resumo não substitui a
          fonte, encurta o caminho até ela
        </p>
      </section>

      <div style={{ height: "120px" }} />

      {/* Depoimentos */}
      <Testimonials />

      {/* Custo */}
      <section style={{ padding: "0 36px 120px", maxWidth: "900px", margin: "0 auto" }}>
        <SectionTag mb="16px">quanto custa</SectionTag>

        <p style={{ fontSize: "26px", fontWeight: 700, color: S.textP, letterSpacing: "-1px", lineHeight: 1.35, marginBottom: "18px" }}>
          Nada.
        </p>
        <p style={{ fontSize: "14px", color: S.textS, lineHeight: 1.8, maxWidth: "520px", marginBottom: "32px" }}>
          O Rezuma é gratuito, sem anúncios e sem plano pago. É um projeto
          independente: o servidor e a leitura dos documentos são pagos por
          quem mantém, e quem quiser ajudar pode mandar um Pix de qualquer valor
          de dentro do painel. Doar não libera nada a mais. Todo mundo usa o
          mesmo Rezuma.
        </p>

        <Link
          href={viewerName ? "/dashboard" : "/register"}
          style={{
            display: "inline-block",
            fontFamily: S.sans,
            fontSize: "13px",
            fontWeight: 600,
            textDecoration: "none",
            padding: "12px 26px",
            borderRadius: "8px",
            background: S.textP,
            color: S.bg,
            letterSpacing: "-0.1px",
          }}
        >
          {viewerName ? "Ir para os relatórios" : "Criar conta grátis"}
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${S.border}`, maxWidth: "900px", margin: "0 auto", padding: "28px 36px 40px" }}>
        {/* Logo e sessão nos cantos; o texto legal centralizado abaixo. */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px" }}>
          <img src="/logo.svg" alt="Rezuma" style={{ display: "block", height: "21px", width: "auto", opacity: 0.35 }} />
          <div style={{ display: "flex", gap: "24px" }}>
            {viewerName ? (
              <Link href="/dashboard" style={{ fontSize: "12px", color: S.textS, textDecoration: "none" }}>
                Olá, {viewerName}
              </Link>
            ) : (
              <>
                <Link href="/login"    style={{ fontSize: "12px", color: S.textT, textDecoration: "none" }}>Entrar</Link>
                <Link href="/register" style={{ fontSize: "12px", color: S.textT, textDecoration: "none" }}>Criar conta</Link>
              </>
            )}
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "32px" }}>
          <p style={{ fontSize: "11px", color: S.textT, lineHeight: 1.8, maxWidth: "560px", margin: "0 auto 14px" }}>
            O Rezuma resume documentos públicos divulgados pelas próprias companhias e
            fundos. Não é recomendação de investimento, análise de valores mobiliários
            nem consultoria financeira. Toda decisão é sua.
          </p>

          <p style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, letterSpacing: "0.3px", margin: 0 }}>
            © {new Date().getFullYear()} Rezuma. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </main>
  );
}
