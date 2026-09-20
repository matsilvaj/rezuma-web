"use client";

import { useState } from "react";

import { contactApi } from "@/lib/api";
import { validateEmail } from "@/lib/validation";

const S = {
  border:  "rgba(237,237,234,0.07)",
  borderS: "rgba(237,237,234,0.18)",
  textP:   "#ededea",
  textS:   "rgba(237,237,234,0.55)",
  textT:   "rgba(237,237,234,0.22)",
  accent:  "#5eb88a",
  erro:    "rgba(237,80,60,0.80)",
  mono:    "var(--font-mono)",
  sans:    "var(--font-sans)",
} as const;

type Erros = { nome?: string; email?: string; mensagem?: string; form?: string };

const MOTIVOS = [
  { valor: "erro",     rotulo: "Erro em um resumo" },
  { valor: "sugestao", rotulo: "Sugestão ou ideia" },
  { valor: "duvida",   rotulo: "Dúvida" },
  { valor: "outro",    rotulo: "Outro assunto" },
] as const;

type Motivo = typeof MOTIVOS[number]["valor"];

function Rotulo({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: S.mono, fontSize: "9px", letterSpacing: "1.6px", textTransform: "uppercase", color: S.textT, fontWeight: 600, marginBottom: "6px" }}>
      {children}
    </div>
  );
}

const campo: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  background: "#0d0f11",
  border: `1px solid ${S.border}`,
  borderRadius: "8px",
  padding: "11px 14px",
  fontFamily: S.sans,
  fontSize: "14px",
  color: S.textP,
  outline: "none",
};

export function ContactForm() {
  const [assunto, setAssunto] = useState<Motivo>("erro");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  // Campo isca: escondido de quem enxerga, preenchido por robô que preenche
  // tudo. O servidor descarta a mensagem quando ele vem cheio.
  const [website, setWebsite] = useState("");
  const [erros, setErros] = useState<Erros>({});
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();

    const novos: Erros = {};
    if (nome.trim().length < 2) novos.nome = "Informe seu nome.";
    const erroEmail = validateEmail(email);
    if (erroEmail) novos.email = erroEmail;
    if (mensagem.trim().length < 10) novos.mensagem = "Escreva um pouco mais, com pelo menos 10 caracteres.";
    if (mensagem.length > 2000) novos.mensagem = "Mensagem muito longa: máximo de 2000 caracteres.";
    setErros(novos);
    if (Object.keys(novos).length > 0) return;

    setEnviando(true);
    try {
      await contactApi.send({ assunto, nome: nome.trim(), email: email.trim().toLowerCase(), mensagem: mensagem.trim(), website });
      setEnviado(true);
    } catch (err) {
      const msg = (err instanceof Error ? err.message : "").toLowerCase();
      setErros({
        form: msg.includes("muitas")
          ? "Você enviou várias mensagens seguidas. Tente novamente mais tarde."
          : "Não foi possível enviar agora. Tente novamente em alguns minutos.",
      });
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <div style={{ background: "rgba(94,184,138,0.05)", border: `1px solid rgba(94,184,138,0.22)`, borderRadius: "10px", padding: "22px 24px" }}>
        <div style={{ fontFamily: S.mono, fontSize: "9px", letterSpacing: "1.6px", textTransform: "uppercase", color: S.accent, fontWeight: 600, marginBottom: "10px" }}>
          Mensagem enviada
        </div>
        <p style={{ fontFamily: S.sans, fontSize: "14px", color: S.textS, lineHeight: 1.8, margin: 0 }}>
          Obrigado. A resposta vai para <strong style={{ color: S.textP }}>{email}</strong>.
          Se for sobre um resumo específico, o retorno costuma sair no mesmo dia.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} noValidate style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: "520px" }}>
      <div>
        <Rotulo>motivo do contato</Rotulo>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {MOTIVOS.map(m => {
            const ativo = assunto === m.valor;
            return (
              <button
                key={m.valor}
                type="button"
                onClick={() => setAssunto(m.valor)}
                aria-pressed={ativo}
                style={{
                  fontFamily: S.sans,
                  fontSize: "12px",
                  fontWeight: ativo ? 600 : 400,
                  color: ativo ? "#07080a" : S.textS,
                  background: ativo ? S.textP : "transparent",
                  border: `1px solid ${ativo ? S.textP : S.borderS}`,
                  borderRadius: "999px",
                  padding: "7px 14px",
                  cursor: "pointer",
                }}
              >
                {m.rotulo}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Rotulo>nome</Rotulo>
        <input
          value={nome}
          onChange={e => { setNome(e.target.value); setErros({}); }}
          maxLength={80}
          autoComplete="name"
          style={{ ...campo, borderColor: erros.nome ? "rgba(237,80,60,0.40)" : S.border }}
        />
        {erros.nome && <p style={{ fontFamily: S.mono, fontSize: "10px", color: S.erro, margin: "6px 0 0" }}>{erros.nome}</p>}
      </div>

      <div>
        <Rotulo>e-mail para resposta</Rotulo>
        <input
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setErros({}); }}
          maxLength={160}
          autoComplete="email"
          style={{ ...campo, borderColor: erros.email ? "rgba(237,80,60,0.40)" : S.border }}
        />
        {erros.email && <p style={{ fontFamily: S.mono, fontSize: "10px", color: S.erro, margin: "6px 0 0" }}>{erros.email}</p>}
      </div>

      <div>
        <Rotulo>mensagem</Rotulo>
        <textarea
          value={mensagem}
          onChange={e => { setMensagem(e.target.value); setErros({}); }}
          rows={7}
          maxLength={2000}
          style={{ ...campo, resize: "vertical", lineHeight: 1.7, borderColor: erros.mensagem ? "rgba(237,80,60,0.40)" : S.border }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginTop: "6px" }}>
          <span style={{ fontFamily: S.mono, fontSize: "10px", color: erros.mensagem ? S.erro : S.textT }}>
            {erros.mensagem ?? "conte o que aconteceu, com o ticker se for sobre um resumo"}
          </span>
          <span style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, flexShrink: 0 }}>
            {mensagem.length}/2000
          </span>
        </div>
      </div>

      {/* Isca. aria-hidden e tabIndex para leitor de tela e teclado passarem direto. */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", overflow: "hidden" }}>
        <label htmlFor="website">Não preencha este campo</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} />
      </div>

      {erros.form && (
        <p style={{ fontFamily: S.sans, fontSize: "13px", color: S.erro, margin: 0 }}>{erros.form}</p>
      )}

      <div>
        <button
          type="submit"
          disabled={enviando}
          style={{
            fontFamily: S.sans,
            fontSize: "13px",
            fontWeight: 600,
            color: "#07080a",
            background: enviando ? "rgba(237,237,234,0.35)" : S.textP,
            border: "none",
            borderRadius: "8px",
            padding: "11px 24px",
            cursor: enviando ? "default" : "pointer",
          }}
        >
          {enviando ? "enviando…" : "enviar mensagem"}
        </button>
      </div>
    </form>
  );
}
