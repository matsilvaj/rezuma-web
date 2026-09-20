"use client";

import { useState } from "react";

import { ReportDemo } from "./report-demo";

/**
 * Demonstração do produto dentro de um notebook, com um celular à frente.
 *
 * O notebook mostra o relatório inteiro em duas colunas; o celular mostra a
 * mesma coisa empilhada e rola por dentro, porque no telefone o relatório não
 * cabe em uma tela só. Os dois usam o mesmo componente de conteúdo, então o
 * que aparece aqui é o relatório de verdade, não um desenho dele.
 *
 * O conteúdo é desenhado no tamanho real e encolhido por zoom, não por
 * transform: transform encolhe só a aparência, e o elemento continua ocupando
 * o tamanho original no layout. Era isso que sobrava como rolagem para o lado
 * e como espaço vazio depois do fim do relatório. Com zoom, o layout encolhe
 * junto, então a área de rolagem termina exatamente onde o conteúdo termina.
 */

const BORDA = "rgba(237,237,234,0.10)";
const MOLDURA = "#16191c";

// Largura em que o relatório é desenhado antes de encolher.
const LARGURA_NOTEBOOK = 880;
const LARGURA_CELULAR = 360;

// Tela do notebook, em px de projeto.
const TELA_NOTEBOOK_L = 620;
const TELA_NOTEBOOK_A = 430;

// A tela do celular e a escala do conteúdo dentro dela mudam com a largura da
// janela, então moram no CSS (.rz-mock-tela e --rz-esc-fone).

const escalaNotebook = TELA_NOTEBOOK_L / LARGURA_NOTEBOOK;

export function DeviceShowcase() {
  // A dica some no primeiro gesto: depois que a pessoa rolou, ela já sabe, e
  // o aviso só ficaria cobrindo a última linha do relatório.
  const [jaRolou, setJaRolou] = useState(false);

  return (
    <div className="rz-mock">
      {/* Notebook */}
      <div className="rz-mock-laptop" style={{ maxWidth: `${TELA_NOTEBOOK_L + 16}px` }}>
        <div
          style={{
            background: MOLDURA,
            border: `1px solid ${BORDA}`,
            borderRadius: "12px",
            padding: "8px 8px 10px",
          }}
        >
          <div
            style={{
              position: "relative",
              height: `${TELA_NOTEBOOK_A}px`,
              borderRadius: "6px",
              overflow: "hidden",
              background: "#07080a",
            }}
          >
            <div style={{ width: `${LARGURA_NOTEBOOK}px`, zoom: escalaNotebook }}>
              <ReportDemo layout="duas-colunas" />
            </div>
            {/* O relatório continua abaixo da dobra: o degradê diz isso sem
                cortar o texto num traço seco. */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: "72px",
                background: "linear-gradient(to bottom, rgba(7,8,10,0), #07080a)",
              }}
            />
          </div>
        </div>
        {/* Base do notebook */}
        <div
          aria-hidden="true"
          style={{
            width: "112%",
            marginLeft: "-6%",
            height: "11px",
            borderRadius: "0 0 10px 10px",
            background: "linear-gradient(to bottom, #16191c, #0b0d0f)",
            border: `1px solid ${BORDA}`,
            borderTop: "none",
          }}
        />
      </div>

      {/* Celular */}
      <div className="rz-mock-phone">
        <div
          style={{
            position: "relative",
            background: MOLDURA,
            border: `1px solid ${BORDA}`,
            borderRadius: "26px",
            padding: "9px",
            boxShadow: "0 18px 40px rgba(0,0,0,0.5)",
          }}
        >
          <div
            className="rz-scroll-oculto rz-mock-tela"
            onScroll={e => { if (!jaRolou && e.currentTarget.scrollTop > 12) setJaRolou(true); }}
            style={{
              borderRadius: "18px",
              overflowY: "auto",
              overflowX: "hidden",
              background: "#07080a",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <div style={{ width: `${LARGURA_CELULAR}px`, zoom: "var(--rz-esc-fone)" }}>
              <ReportDemo layout="empilhado" />
            </div>
          </div>

          <span
            style={{
              position: "absolute",
              left: "50%",
              bottom: "20px",
              transform: "translateX(-50%)",
              whiteSpace: "nowrap",
              fontFamily: "var(--font-mono)",
              fontSize: "9px",
              letterSpacing: "0.4px",
              color: "rgba(237,237,234,0.45)",
              background: "rgba(13,15,17,0.92)",
              border: `1px solid ${BORDA}`,
              borderRadius: "999px",
              padding: "4px 10px",
              pointerEvents: "none",
              opacity: jaRolou ? 0 : 1,
              transition: "opacity 0.25s",
            }}
          >
            role aqui
          </span>
        </div>
      </div>
    </div>
  );
}
