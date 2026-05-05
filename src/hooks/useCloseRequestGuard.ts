// Intercepta o "fechar janela" do Tauri pra confirmar quando há draft
// não-salvo. Se o usuário confirma (ou o cofre não tem draft pendente),
// chama `getCurrentWindow().destroy()` — `close()` re-dispararia o
// evento `closeRequested` em loop.

import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect } from "react";

import { confirmDialog } from "@/lib/confirm";
import { getHasUnsavedChanges } from "@/stores/vault";

export function useCloseRequestGuard(): void {
  useEffect(() => {
    const w = getCurrentWindow();
    let unlisten: (() => void) | undefined;

    void w
      .onCloseRequested(async (event) => {
        if (!getHasUnsavedChanges()) return; // deixa o close padrão acontecer.
        event.preventDefault();
        const confirmed = await confirmDialog({
          title: "Mudanças não salvas",
          description:
            "Você tem mudanças não salvas. Fechar agora vai descartar essas mudanças. Continuar?",
          confirmLabel: "Descartar e fechar",
          cancelLabel: "Voltar",
          variant: "danger",
        });
        if (confirmed) {
          await w.destroy();
        }
      })
      .then((fn) => {
        unlisten = fn;
      });

    return () => {
      unlisten?.();
    };
  }, []);
}
