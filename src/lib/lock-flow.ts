// Wrapper pra `vault.lock()` com confirmação quando há mudanças não-salvas.
//
// Usado por:
//   - Atalho Ctrl+L (`useGlobalShortcuts`)
//   - Botão "Bloquear" do `VaultHeader`
//   - Auto-lock por inatividade (`useAutoLock`) — passa
//     `autoConfirmAfterMs: 30_000` pra que "não responder" → bloqueia
//     mesmo assim.

import { confirmDialog } from "@/lib/confirm";
import { getHasUnsavedChanges, useVaultStore } from "@/stores/vault";

export interface RequestLockOptions {
  /**
   * Se passado e há draft pendente, o dialog auto-resolve após esse
   * intervalo (descarta e bloqueia). Sem opção = espera indefinidamente
   * pelo usuário.
   */
  autoConfirmAfterMs?: number;
}

export async function requestLockWithGuard(
  opts: RequestLockOptions = {},
): Promise<void> {
  if (!getHasUnsavedChanges()) {
    useVaultStore.getState().lock();
    return;
  }

  const confirmed = await confirmDialog({
    title: "Mudanças não salvas",
    description:
      "Você tem mudanças não salvas. Bloquear o cofre vai descartar essas mudanças. Continuar?",
    confirmLabel: "Descartar e bloquear",
    cancelLabel: "Voltar e salvar",
    variant: "danger",
    autoResolveAfterMs: opts.autoConfirmAfterMs,
    autoResolveValue: true, // timeout = descarta e bloqueia (segurança).
  });

  if (confirmed) {
    useVaultStore.getState().lock();
  }
}
