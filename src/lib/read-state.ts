"use client";

/**
 * Controle de "relatório já aberto", guardado no navegador.
 *
 * Fica em localStorage por enquanto: não exige coluna nova no banco nem
 * endpoint, e o custo de errar é baixo (um "novo" a mais em outro
 * dispositivo). Se virar problema, migra para o perfil do usuário.
 */

const KEY = "rezuma:read-reports";

function load(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function getReadIds(): Set<string> {
  return load();
}

export function markRead(id: string): void {
  if (typeof window === "undefined") return;
  const ids = load();
  if (ids.has(id)) return;
  ids.add(id);
  try {
    window.localStorage.setItem(KEY, JSON.stringify([...ids]));
  } catch {
    /* cota cheia ou modo privado: seguir sem marcar */
  }
}
