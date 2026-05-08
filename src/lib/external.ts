// Helper para abrir URLs externas via Tauri shell plugin.
//
// Sessão 21: extraído como utilitário compartilhado depois que
// AboutDialog (S7) + EntryDetail (S4) + PoweredByBasis (S21) passaram
// a precisar do mesmo padrão try/catch + console.error.
//
// Permission: `shell:allow-open` já está em
// `src-tauri/capabilities/default.json` desde a Sessão 3 — adicionar
// um novo callsite NÃO exige edit em capabilities.

import { open as tauriOpen } from "@tauri-apps/plugin-shell";

/**
 * Abre URL externa no navegador padrão do sistema.
 *
 * Não lança — em caso de falha, loga no console e segue silenciosamente.
 * Padrão de log mantido (`[shell.open] falhou:`) para alinhar com os
 * 2 callsites pré-existentes.
 *
 * @example
 *   <button onClick={() => void openExternalSafe("https://example.com")}>
 *     Abrir
 *   </button>
 */
export async function openExternalSafe(url: string): Promise<void> {
  try {
    await tauriOpen(url);
  } catch (err) {
    console.error("[shell.open] falhou:", err);
  }
}
