import Link from "next/link";
import { HeroSection } from "./_components/hero-section";
import { Testimonials } from "./_components/testimonials";
import { DeviceShowcase } from "./_components/device-showcase";
import { SiteFooter } from "./_components/site-footer";
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
    desc: "Informe os FIIs e as ações que você acompanha. Leva um minuto.",
  },
  {
    n: "02",
    title: "Nós vigiamos as fontes oficiais",
    desc: "CVM, FNET e B3 conferidas todos os dias. Documento publicado é documento baixado na hora.",
  },
  {
    n: "03",
    title: "O documento vira quatro parágrafos",
    desc: "O documento inteiro é lido e devolvido no tamanho de uma mensagem, com cada termo técnico explicado.",
  },
  {
    n: "04",
    title: "Chega onde você já olha",
    desc: "E-mail e Telegram no mesmo dia, e tudo guardado no painel.",
  },
] as const;

const ANATOMY = [
  {
    label: "Destaque",
    desc: "O resultado do período logo na primeira linha: quanto rendeu e o que explica esse número.",
  },
  {
    label: "Movimentações",
    desc: "Aquisição, emissão, troca de gestor, corte de distribuição.",
  },
  {
    label: "Atenção",
    desc: "O que ainda não é problema, mas pode virar.",
  },
  {
    label: "Glossário",
    desc: "Todo termo técnico explicado em uma linha, ali mesmo.",
  },
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
      <section className="rz-pad" style={{ paddingTop: "88px", maxWidth: "900px", margin: "0 auto" }}>
        <p style={{ fontSize: "26px", fontWeight: 700, color: S.textP, letterSpacing: "-1px", lineHeight: 1.35, maxWidth: "620px", marginBottom: "20px" }}>
          Ninguém deixa de ler os relatórios por preguiça. Deixa porque são oitenta
          páginas de linguagem contábil por ativo, todo mês.
        </p>
        <p style={{ fontSize: "15px", color: S.textS, lineHeight: 1.8, maxWidth: "560px" }}>
          Ninguém lê oitenta páginas atrás de três frases. Você procura o
          rendimento, vê que veio parecido com o do mês passado e fecha. O que
          mudou de verdade continua lá dentro, escrito para contador.
        </p>
      </section>

      {/* Como funciona */}
      <section className="rz-pad" style={{ paddingTop: "64px", maxWidth: "900px", margin: "0 auto" }}>
        <SectionTag>como funciona</SectionTag>

        <div>
          {STEPS.map((step, i) => (
            <div
              key={step.n}
              className="rz-steps"
              style={{
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
      <section className="rz-pad" style={{ paddingTop: "64px", maxWidth: "900px", margin: "0 auto" }}>
        <SectionTag mb="16px">o que vem em cada resumo</SectionTag>
        <p style={{ fontSize: "14px", color: S.textS, lineHeight: 1.75, maxWidth: "520px", marginBottom: "36px" }}>
          Todo resumo sai na mesma estrutura, seja um FII ou uma ação.
        </p>

        <div className="rz-grid-2">
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
      </section>

      {/* Demonstração */}
      <section id="exemplo" className="rz-pad" style={{ paddingTop: "64px", maxWidth: "900px", margin: "0 auto" }}>
        <SectionTag mb="16px">como aparece</SectionTag>
        <p style={{ fontSize: "14px", color: S.textS, lineHeight: 1.75, maxWidth: "520px", marginBottom: "36px" }}>
          O informe mensal do HGLG11, do jeito que chega para quem acompanha o fundo.
        </p>

        <DeviceShowcase />
      </section>

      <div style={{ height: "72px" }} />

      {/* Depoimentos */}
      <Testimonials />

      {/* Fechamento */}
      <section className="rz-pad" style={{ paddingBottom: "80px", maxWidth: "900px", margin: "0 auto" }}>
        <SectionTag mb="16px">comece</SectionTag>

        <p style={{ fontSize: "26px", fontWeight: 700, color: S.textP, letterSpacing: "-1px", lineHeight: 1.35, maxWidth: "560px", marginBottom: "18px" }}>
          Cadastre seus ativos hoje e leia o próximo relatório em quatro
          parágrafos, não em oitenta páginas.
        </p>
        <p style={{ fontSize: "14px", color: S.textS, lineHeight: 1.8, maxWidth: "520px", marginBottom: "32px" }}>
          Leva dois minutos para começar. Daí em diante, cada documento novo dos
          seus FIIs e ações chega resumido no seu e-mail e no Telegram, no mesmo
          dia em que é publicado.
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
          {viewerName ? "Ir para os relatórios" : "Criar conta"}
        </Link>

        <p style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, letterSpacing: "0.3px", marginTop: "18px" }}>
          sem plano, sem cartão e sem anúncio
        </p>
      </section>

      <SiteFooter viewerName={viewerName} />
    </main>
  );
}
