"use client";

import { useEffect, useState } from "react";
import { pixConfigurado } from "@/lib/pix";
import { S } from "@/lib/report-format";
import { PixDonation } from "./pix-donation";

const LS_KEY = "rz-apoio-recolhido";

function lerRecolhido(): boolean | null {
  try {
    const v = localStorage.getItem(LS_KEY);
    return v === null ? null : v === "1";
  } catch {
    return null;
  }
}

function gravarRecolhido(v: boolean) {
  try { localStorage.setItem(LS_KEY, v ? "1" : "0"); } catch { /* ignorar */ }
}

/**
 * Pedido de doação no canto inferior esquerdo.
 *
 * Nunca cobre o conteúdo nem bloqueia a leitura: aberto é um cartão pequeno,
 * recolhido vira uma aba que continua visível. O canto esquerdo é porque o
 * direito já é dos avisos (sonner), e os dois disputariam o mesmo espaço.
 *
 * A escolha de recolher fica lembrada. Em tela estreita nasce recolhido,
 * porque ali até o cartão pequeno ocupa boa parte da largura.
 */
export function SupportWidget() {
  const [montado,   setMontado]   = useState(false);
  const [recolhido, setRecolhido] = useState(true);

  const pix = pixConfigurado();

  // localStorage e largura da janela só existem no cliente: decidir o estado
  // inicial depois da montagem evita divergência com o HTML do servidor.
  useEffect(() => {
    const salvo = lerRecolhido();
    setRecolhido(salvo ?? window.innerWidth < 640);
    setMontado(true);
  }, []);

  if (!pix || !montado) return null;

  function recolher() {
    setRecolhido(true);
    gravarRecolhido(true);
  }

  function abrir() {
    setRecolhido(false);
    gravarRecolhido(false);
  }

  const base: React.CSSProperties = {
    position: "fixed",
    left: "20px",
    bottom: "20px",
    zIndex: 30,
    fontFamily: S.sans,
  };

  if (recolhido) {
    return (
      <button
        type="button"
        onClick={abrir}
        aria-label="Apoiar o projeto"
        style={{
          ...base,
          display: "flex",
          alignItems: "center",
          gap: "7px",
          background: "#0d0f11",
          border: `1px solid ${S.borderS}`,
          borderRadius: "999px",
          padding: "7px 13px",
          fontFamily: S.mono,
          fontSize: "10px",
          letterSpacing: "0.3px",
          color: S.textS,
          cursor: "pointer",
          boxShadow: "0 4px 18px rgba(0,0,0,0.35)",
        }}
      >
        <span aria-hidden="true" style={{ width: "5px", height: "5px", borderRadius: "50%", background: S.accent }} />
        apoiar o projeto
      </button>
    );
  }

  return (
    <aside
      aria-label="Apoie o Rezuma"
      style={{
        ...base,
        width: "248px",
        background: "#0d0f11",
        border: `1px solid ${S.borderS}`,
        borderRadius: "10px",
        padding: "14px 16px 18px",
        boxShadow: "0 8px 28px rgba(0,0,0,0.45)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
        <div style={{ fontFamily: S.mono, fontSize: "9px", letterSpacing: "1.6px", textTransform: "uppercase", color: S.accent, fontWeight: 600 }}>
          Apoie o Rezuma
        </div>
        <button
          type="button"
          onClick={recolher}
          aria-label="Recolher"
          title="Recolher"
          style={{
            width: "22px",
            height: "22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            border: `1px solid ${S.border}`,
            borderRadius: "5px",
            color: S.textT,
            fontFamily: S.mono,
            fontSize: "12px",
            lineHeight: 1,
            cursor: "pointer",
            padding: 0,
          }}
        >
          <span aria-hidden="true">−</span>
        </button>
      </div>

      <p style={{ fontSize: "12px", color: "rgba(237,237,234,0.55)", lineHeight: 1.6, margin: 0 }}>
        Gratuito e sem anúncios. Se o Rezuma te poupa tempo, um Pix de
        qualquer valor ajuda a mantê-lo no ar.
      </p>

      <div style={{ height: "1px", background: S.border, margin: "14px 0 16px" }} />

      <PixDonation chave={pix.chave} codigo={pix.codigo} />
    </aside>
  );
}
