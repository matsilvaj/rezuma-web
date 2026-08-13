"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { assetsApi } from "@/lib/api";
import { Asset } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Search, Check } from "lucide-react";

interface Suggestion {
  ticker: string;
  name: string | null;
  type: string | null;
}

function sanitizeQuery(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 8);
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [adding, setAdding] = useState<string | null>(null);
  const [pendingRemove, setPendingRemove] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

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

  useEffect(() => {
    loadAssets();
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    setSearchLoading(true);
    try {
      const data = await assetsApi.search(q);
      setSuggestions(data ?? []);
      setShowDropdown(true);
    } catch {
      setSuggestions([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const clean = sanitizeQuery(query);
      if (clean.length >= 2) search(clean);
      else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  async function handleAdd(ticker: string) {
    setAdding(ticker);
    setShowDropdown(false);
    setQuery("");
    try {
      await assetsApi.add(ticker);
      await loadAssets();
      toast.success(`${ticker} adicionado à sua carteira.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.toLowerCase().includes("já")) {
        toast.error("Este ativo já está na sua lista.");
      } else {
        toast.error("Erro ao adicionar ativo.");
      }
    } finally {
      setAdding(null);
    }
  }

  function handleRemoveClick(id: string, ticker: string) {
    if (pendingRemove === id) {
      doRemove(id, ticker);
    } else {
      setPendingRemove(id);
      setTimeout(() => setPendingRemove((prev) => (prev === id ? null : prev)), 3000);
    }
  }

  async function doRemove(id: string, ticker: string) {
    setPendingRemove(null);
    setRemoving(id);
    try {
      await assetsApi.remove(id);
      setAssets((prev) => prev.filter((a) => a.id !== id));
      toast.success(`${ticker} removido da sua carteira.`);
    } catch {
      toast.error("Erro ao remover ativo.");
    } finally {
      setRemoving(null);
    }
  }

  const addedTickers = new Set(assets.map((a) => a.ticker));

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Meus Ativos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie os ativos que você quer monitorar.
        </p>
      </div>

      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-9"
            placeholder="Buscar ativo (ex: PETR4, HGLG11…)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            autoComplete="off"
            spellCheck={false}
            maxLength={8}
          />
        </div>

        {showDropdown && (searchLoading || suggestions.length > 0) && (
          <div
            role="listbox"
            aria-label="Sugestões de ativos"
            className="border rounded-md overflow-hidden bg-background shadow-sm"
          >
            {searchLoading && (
              <p className="text-xs text-muted-foreground px-3 py-2">Buscando…</p>
            )}
            {!searchLoading && suggestions.length === 0 && (
              <p className="text-xs text-muted-foreground px-3 py-2">Nenhum resultado.</p>
            )}
            {suggestions.map((s) => {
              const alreadyAdded = addedTickers.has(s.ticker);
              return (
                <button
                  key={s.ticker}
                  role="option"
                  aria-selected={alreadyAdded}
                  onMouseDown={() => !alreadyAdded && handleAdd(s.ticker)}
                  disabled={adding === s.ticker || alreadyAdded}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm transition-colors hover:bg-muted disabled:cursor-default disabled:hover:bg-transparent"
                >
                  <span>
                    <span className="font-mono font-semibold">{s.ticker}</span>
                    {s.name && s.name !== s.ticker && (
                      <span className="ml-2 text-muted-foreground">{s.name}</span>
                    )}
                  </span>
                  {alreadyAdded ? (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Check size={12} /> Adicionado
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">+ Adicionar</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {loading && <p className="text-sm text-muted-foreground">Carregando…</p>}

      {!loading && assets.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Nenhum ativo adicionado. Use a busca acima para adicionar.
        </div>
      )}

      {!loading && assets.length > 0 && (
        <div className="space-y-2">
          {assets.map((asset) => {
            const isPending = pendingRemove === asset.id;
            const isRemoving = removing === asset.id;
            return (
              <div
                key={asset.id}
                className="flex items-center justify-between rounded-lg border px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-semibold text-sm">{asset.ticker}</span>
                  {asset.name && asset.name !== asset.ticker && (
                    <span className="text-sm text-muted-foreground">{asset.name}</span>
                  )}
                  {asset.type && (
                    <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                      {asset.type === "fii" ? "FII" : "Ação"}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {isPending && (
                    <span className="text-xs text-destructive">Clique para confirmar</span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={isRemoving}
                    onClick={() => handleRemoveClick(asset.id, asset.ticker)}
                    aria-label={isPending ? `Confirmar remoção de ${asset.ticker}` : `Remover ${asset.ticker}`}
                    className={`h-8 w-8 transition-colors ${
                      isPending
                        ? "text-destructive hover:text-destructive hover:bg-destructive/10"
                        : "text-muted-foreground hover:text-destructive"
                    }`}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
