"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { S } from "@/lib/report-format";

/**
 * QR e "copia e cola" do Pix, com a chave para quem prefere digitar.
 * Usado no cartão do canto e na seção de apoio das configurações.
 *
 * No celular o QR não serve para nada, a pessoa já está na tela do banco:
 * por isso o botão principal copia o código, e o QR fica para quem está no
 * computador com o celular na mão.
 */
export function PixDonation({ chave, codigo, qr = 120 }: { chave: string; codigo: string; qr?: number }) {
  const [copiado, setCopiado] = useState<"codigo" | "chave" | null>(null);

  async function copiar(texto: string, qual: "codigo" | "chave") {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(qual);
      setTimeout(() => setCopiado(null), 2200);
    } catch {
      // Clipboard bloqueado (http sem TLS, permissão negada): a chave segue
      // visível na tela para copiar à mão.
      setCopiado(null);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
        {/* Fundo claro de propósito: leitor de QR em tema escuro falha com frequência. */}
        <div style={{ background: "#ededea", borderRadius: "8px", padding: "9px", lineHeight: 0 }}>
          <QRCodeSVG value={codigo} size={qr} bgColor="#ededea" fgColor="#07080a" level="M" />
        </div>
        <span style={{ fontFamily: S.mono, fontSize: "9px", color: S.textT, letterSpacing: "0.3px" }}>
          aponte a câmera do app do banco
        </span>
      </div>

      <button
        type="button"
        onClick={() => copiar(codigo, "codigo")}
        style={{
          width: "100%",
          fontFamily: S.sans,
          fontSize: "12px",
          fontWeight: 600,
          color: "#07080a",
          background: copiado === "codigo" ? S.accent : S.textP,
          border: "none",
          borderRadius: "7px",
          padding: "9px 14px",
          cursor: "pointer",
          transition: "background 0.15s",
        }}
      >
        {copiado === "codigo" ? "código copiado" : "copiar Pix copia e cola"}
      </button>

      <div style={{ width: "100%" }}>
        <div style={{ fontFamily: S.mono, fontSize: "9px", letterSpacing: "1.4px", textTransform: "uppercase", color: S.textT, fontWeight: 600, marginBottom: "6px" }}>
          chave pix
        </div>
        {/* Numa linha só, cortada com reticências: a chave aleatória tem 36
            caracteres e quebrava em duas linhas soltas. Inteira ela vai para
            a área de transferência, e o title mostra ao passar o mouse. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            border: `1px solid ${S.border}`,
            borderRadius: "6px",
            padding: "6px 6px 6px 10px",
          }}
        >
          <span
            title={chave}
            style={{
              flex: 1,
              minWidth: 0,
              fontFamily: S.mono,
              fontSize: "10px",
              color: S.textS,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {chave}
          </span>
          <button
            type="button"
            onClick={() => copiar(chave, "chave")}
            style={{
              flexShrink: 0,
              fontFamily: S.mono,
              fontSize: "9px",
              letterSpacing: "0.3px",
              color: copiado === "chave" ? S.accent : S.textS,
              background: "transparent",
              border: `1px solid ${S.borderS}`,
              borderRadius: "4px",
              padding: "3px 8px",
              cursor: "pointer",
            }}
          >
            {copiado === "chave" ? "copiada" : "copiar"}
          </button>
        </div>
      </div>
    </div>
  );
}
