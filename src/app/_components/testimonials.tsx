"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const S = {
  surface:  "#0d0f11",
  border:   "rgba(237,237,234,0.07)",
  borderSt: "rgba(237,237,234,0.12)",
  textP:    "#ededea",
  textS:    "rgba(237,237,234,0.40)",
  textT:    "rgba(237,237,234,0.18)",
  sans:     "var(--font-sans)",
  mono:     "var(--font-mono)",
} as const;

/**
 * Depoimentos de usuários reais. O primeiro é do próprio fundador e vem
 * rotulado como tal, quem lê precisa saber de onde a fala vem.
 */
const QUOTES = [
  {
    text: "Tenho oito ativos entre FIIs e ações e minha dificuldade nunca foi achar informação, era entender o que estava realmente acontecendo com cada um. Eu caía no YouTube: às vezes o vídeo ajudava, às vezes cada analista dizia uma coisa diferente e eu saía mais confuso do que entrei. Cheguei a vender um ativo bom por causa de especulação de influenciador. Hoje o tempo que eu gastava em um único vídeo é o mesmo que gasto para saber o que aconteceu com os oito e decidir com base no documento, não na opinião de alguém.",
    name: "Matheus Silva",
    detail: "fundador do Rezuma · 8 ativos entre FIIs e ações",
  },
  {
    text: "Tenho onze FIIs e todo mês chegavam onze relatórios gerenciais que eu não lia. Na prática eu abria o do MXRF11, olhava o rendimento, achava que estava tudo bem e continuava aportando. Só fui perceber que um deles estava com a vacância subindo havia três meses quando o rendimento caiu de vez, e aí já era. Hoje cada relatório vira quatro parágrafos, então eu leio os onze no tempo em que antes lia nenhum.",
    name: "Eduardo Prado",
    detail: "carteira de 11 FIIs · começou em 2019",
  },
  {
    text: "Meu problema não era entender, era chegar tarde. Eu descobria emissão, mudança de gestor e fato relevante por grupo de WhatsApp, sempre depois de todo mundo. Perdi o direito de preferência de uma emissão porque vi o aviso no dia seguinte ao prazo. Agora chega no Telegram no mesmo dia em que o documento é publicado, e eu decido com dois dias de sobra em vez de duas horas.",
    name: "Juliana Nogueira",
    detail: "FIIs e ações · investindo há 4 anos",
  },
  {
    text: "Fora da temporada de balanços eu dou conta. O problema é quando quatro empresas divulgam na mesma semana: eu deixava para ler no fim de semana, o fim de semana chegava e eu lia zero. Fiquei quase um trimestre sem saber que uma delas tinha cortado a distribuição, segurando a posição por um motivo que não existia mais. Hoje abro o e-mail no fim do dia e sei o que mudou em cada uma antes de o assunto esfriar.",
    name: "Thiago Marques",
    detail: "acompanha 9 empresas · foco em dividendos",
  },
] as const;

function Arrow({
  dir, onClick, disabled,
}: { dir: "prev" | "next"; onClick: () => void; disabled: boolean }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "prev" ? "Depoimento anterior" : "Próximo depoimento"}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: "30px",
        height: "30px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "7px",
        background: hover && !disabled ? "rgba(237,237,234,0.05)" : "transparent",
        border: `1px solid ${hover && !disabled ? S.borderSt : S.border}`,
        color: S.textS,
        fontFamily: S.mono,
        fontSize: "13px",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.25 : 1,
        transition: "background 0.15s, border-color 0.15s, opacity 0.15s",
        padding: 0,
      }}
    >
      <span aria-hidden="true">{dir === "prev" ? "←" : "→"}</span>
    </button>
  );
}

export function Testimonials() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd,   setAtEnd]   = useState(false);

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    // Uma folga de 1px evita que o arredondamento do scroll deixe a seta
    // habilitada no fim do trilho.
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [sync]);

  const step = useCallback((dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    // Avança pela largura do primeiro card mais o gap, para o trilho parar
    // sempre com um depoimento alinhado à esquerda.
    const card = el.firstElementChild as HTMLElement | null;
    const amount = card ? card.offsetWidth + 16 : el.clientWidth;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  }, []);

  return (
    <section style={{ padding: "0 36px 120px", maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
        <p style={{ fontFamily: S.mono, fontSize: "10px", letterSpacing: "2px", color: S.textT, textTransform: "uppercase" }}>
          quem usa
        </p>
        <div style={{ display: "flex", gap: "8px" }}>
          <Arrow dir="prev" onClick={() => step(-1)} disabled={atStart} />
          <Arrow dir="next" onClick={() => step(1)}  disabled={atEnd} />
        </div>
      </div>

      <div
        ref={trackRef}
        onScroll={sync}
        className="rz-carousel"
        style={{
          display: "flex",
          gap: "16px",
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          scrollPaddingLeft: "0px",
          paddingBottom: "4px",
        }}
      >
        {QUOTES.map(q => (
          <figure
            key={q.name}
            style={{
              flex: "0 0 auto",
              width: "min(400px, 82vw)",
              scrollSnapAlign: "start",
              background: S.surface,
              border: `1px solid ${S.border}`,
              borderRadius: "12px",
              padding: "26px 24px",
              margin: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "22px",
            }}
          >
            <blockquote style={{ margin: 0 }}>
              <p style={{ fontFamily: S.sans, fontSize: "14px", color: S.textS, lineHeight: 1.8, margin: 0 }}>
                {q.text}
              </p>
            </blockquote>
            <figcaption>
              <div style={{ fontFamily: S.mono, fontSize: "12px", fontWeight: 700, color: S.textP, letterSpacing: "-0.3px" }}>
                {q.name}
              </div>
              <div style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, marginTop: "5px", lineHeight: 1.5 }}>
                {q.detail}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
