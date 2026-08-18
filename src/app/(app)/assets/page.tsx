"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { assetsApi } from "@/lib/api";
import { Asset } from "@/types";

const S = {
  textP:   "#ededea",
  textS:   "rgba(237,237,234,0.55)",
  textT:   "rgba(237,237,234,0.22)",
  border:  "rgba(237,237,234,0.07)",
  borderS: "rgba(237,237,234,0.10)",
  accent:  "#5eb88a",
  accentD: "rgba(94,184,138,0.10)",
  accentB: "rgba(94,184,138,0.22)",
  danger:  "rgba(237,80,60,0.70)",
  dangerD: "rgba(237,80,60,0.08)",
  mono:    "var(--font-mono)",
  sans:    "var(--font-sans)",
} as const;

interface Suggestion {
  ticker: string;
  name: string | null;
  type: string | null;
}

function sanitizeQuery(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 8);
}

export default function AssetsPage() {
  const [assets,       setAssets]       = useState<Asset[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [query,        setQuery]        = useState("");
  const [suggestions,  setSuggestions]  = useState<Suggestion[]>([]);
  const [searchLoad,   setSearchLoad]   = useState(false);
  const [showDrop,     setShowDrop]     = useState(false);
  const [adding,       setAdding]       = useState<string | null>(null);
  const [pendingRemove,setPendingRemove]= useState<string | null>(null);
  const [removing,     setRemoving]     = useState<string | null>(null);
  const [inputFocused, setInputFocused] = useState(false);

  async function loadAssets() {
    setLoading(true);
    try {
      const data = await assetsApi.list();
      setAssets(data ?? []);
    } catch {
      toast.error("Erro ao carregar ativos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAssets(); }, []);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setSuggestions([]); setShowDrop(false); return; }
    setSearchLoad(true);
    try {
      const data = await assetsApi.search(q);
      setSuggestions(data ?? []);
      setShowDrop(true);
    } catch {
      setSuggestions([]);
    } finally {
      setSearchLoad(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      const clean = sanitizeQuery(query);
      if (clean.length >= 2) search(clean);
      else { setSuggestions([]); setShowDrop(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [query, search]);

  async function handleAdd(ticker: string) {
    setAdding(ticker);
    setShowDrop(false);
    setQuery("");
    try {
      await assetsApi.add(ticker);
      await loadAssets();
      toast.success(`${ticker} adicionado.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      toast.error(msg.toLowerCase().includes("já") ? "Ativo já está na sua lista." : "Erro ao adicionar ativo.");
    } finally {
      setAdding(null);
    }
  }

  function handleRemoveClick(id: string, ticker: string) {
    if (pendingRemove === id) {
      doRemove(id, ticker);
    } else {
      setPendingRemove(id);
      setTimeout(() => setPendingRemove(prev => prev === id ? null : prev), 3000);
    }
  }

  async function doRemove(id: string, ticker: string) {
    setPendingRemove(null);
    setRemoving(id);
    try {
      await assetsApi.remove(id);
      setAssets(prev => prev.filter(a => a.id !== id));
      toast.success(`${ticker} removido.`);
    } catch {
      toast.error("Erro ao remover ativo.");
    } finally {
      setRemoving(null);
    }
  }

  const addedTickers = new Set(assets.map(a => a.ticker));

  return (
    <div style={{ maxWidth: "600px" }}>

      {/* Header */}
      <div style={{ marginBottom: "40px" }}>
        <p style={{ fontFamily: S.mono, fontSize: "10px", letterSpacing: "2px", color: S.textT, textTransform: "uppercase", marginBottom: "10px" }}>
          meus ativos
        </p>
        <h1 style={{ fontFamily: S.sans, fontSize: "22px", fontWeight: 700, color: S.textP, letterSpacing: "-0.5px" }}>
          Carteira monitorada
        </h1>
        <p style={{ fontFamily: S.sans, fontSize: "13px", color: S.textS, marginTop: "4px" }}>
          Adicione os ativos que quer acompanhar. Você recebe um resumo quando novos relatórios chegam.
        </p>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: "32px" }}>
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Buscar ativo — PETR4, HGLG11…"
            value={query}
            maxLength={8}
            autoComplete="off"
            spellCheck={false}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => { setInputFocused(true); if (suggestions.length > 0) setShowDrop(true); }}
            onBlur={() => { setInputFocused(false); setTimeout(() => setShowDrop(false), 150); }}
            style={{
              width: "100%",
              boxSizing: "border-box",
              background: "#0d0f11",
              border: `1px solid ${inputFocused ? "rgba(237,237,234,0.18)" : S.border}`,
              borderRadius: "8px",
              padding: "11px 40px 11px 14px",
              fontFamily: S.mono,
              fontSize: "13px",
              color: S.textP,
              outline: "none",
              transition: "border-color 0.15s",
            }}
          />
          <div style={{
            position: "absolute",
            right: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            fontFamily: S.mono,
            fontSize: "10px",
            color: S.textT,
          }}>
            {searchLoad ? "…" : "↵"}
          </div>
        </div>

        {/* Dropdown */}
        {showDrop && (searchLoad || suggestions.length > 0) && (
          <div style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: "#0d0f11",
            border: `1px solid ${S.borderS}`,
            borderRadius: "8px",
            overflow: "hidden",
            zIndex: 50,
          }}>
            {searchLoad && (
              <p style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, padding: "12px 14px" }}>
                buscando…
              </p>
            )}
            {!searchLoad && suggestions.length === 0 && (
              <p style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, padding: "12px 14px" }}>
                nenhum resultado
              </p>
            )}
            {suggestions.map(s => {
              const already = addedTickers.has(s.ticker);
              return (
                <button
                  key={s.ticker}
                  onMouseDown={() => !already && handleAdd(s.ticker)}
                  disabled={adding === s.ticker || already}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "11px 14px",
                    background: "transparent",
                    border: "none",
                    borderTop: `1px solid ${S.border}`,
                    cursor: already ? "default" : "pointer",
                    textAlign: "left",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontFamily: S.mono, fontSize: "13px", fontWeight: 700, color: S.textP }}>
                      {s.ticker}
                    </span>
                    {s.name && s.name !== s.ticker && (
                      <span style={{ fontFamily: S.sans, fontSize: "12px", color: S.textS }}>
                        {s.name}
                      </span>
                    )}
                    {s.type && (
                      <span style={{ fontFamily: S.mono, fontSize: "9px", color: S.textT, border: `1px solid ${S.border}`, borderRadius: "4px", padding: "1px 6px", letterSpacing: "0.4px" }}>
                        {s.type === "fii" ? "FII" : "AÇÃO"}
                      </span>
                    )}
                  </span>
                  <span style={{ fontFamily: S.mono, fontSize: "10px", color: already ? S.textT : S.accent }}>
                    {already ? "adicionado" : "+ adicionar"}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <p style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, letterSpacing: "1px" }}>
          carregando…
        </p>
      )}

      {/* Empty state */}
      {!loading && assets.length === 0 && (
        <div style={{ border: `1px dashed ${S.border}`, borderRadius: "10px", padding: "48px 32px", textAlign: "center" }}>
          <p style={{ fontFamily: S.sans, fontSize: "14px", color: S.textT, lineHeight: 1.7 }}>
            Nenhum ativo adicionado ainda.<br />
            Use a busca acima para encontrar o que você acompanha.
          </p>
        </div>
      )}

      {/* Asset list */}
      {!loading && assets.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {assets.map((asset, i) => {
            const isPending  = pendingRemove === asset.id;
            const isRemoving = removing === asset.id;

            return (
              <div
                key={asset.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 0",
                  borderBottom: i < assets.length - 1 ? `1px solid ${S.border}` : "none",
                  opacity: isRemoving ? 0.4 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontFamily: S.mono, fontSize: "15px", fontWeight: 700, color: S.textP, letterSpacing: "-0.5px" }}>
                    {asset.ticker}
                  </span>
                  {asset.type && (
                    <span style={{ fontFamily: S.mono, fontSize: "9px", color: S.textT, border: `1px solid ${S.border}`, borderRadius: "4px", padding: "1px 6px", letterSpacing: "0.4px" }}>
                      {asset.type === "fii" ? "FII" : "AÇÃO"}
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {isPending && (
                    <span style={{ fontFamily: S.mono, fontSize: "10px", color: S.danger }}>
                      confirmar?
                    </span>
                  )}
                  <button
                    disabled={isRemoving}
                    onClick={() => handleRemoveClick(asset.id, asset.ticker)}
                    aria-label={isPending ? `Confirmar remoção de ${asset.ticker}` : `Remover ${asset.ticker}`}
                    style={{
                      fontFamily: S.mono,
                      fontSize: "10px",
                      color: isPending ? S.danger : S.textT,
                      background: isPending ? S.dangerD : "transparent",
                      border: `1px solid ${isPending ? "rgba(237,80,60,0.20)" : S.border}`,
                      borderRadius: "5px",
                      padding: "4px 10px",
                      cursor: isRemoving ? "default" : "pointer",
                      letterSpacing: "0.3px",
                    }}
                  >
                    {isRemoving ? "…" : "remover"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Asset count */}
      {!loading && assets.length > 0 && (
        <p style={{ fontFamily: S.mono, fontSize: "10px", color: S.textT, marginTop: "24px" }}>
          {assets.length} ativo{assets.length !== 1 ? "s" : ""} monitorado{assets.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
