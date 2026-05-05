// Host renderizador dos ConfirmDialogs programáticos.
//
// Montado uma única vez no `App.tsx` (ao lado do `Toaster`). Lê o store
// de `lib/confirm.ts` e renderiza um `ConfirmDialog` shadcn por request
// pendente. Permite empilhar múltiplos confirms (raro — caso de
// debounce ou race), mas o último adicionado fica visível por cima.

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { resolveConfirm, useConfirmStore } from "@/lib/confirm";

export function ConfirmDialogHost() {
  const pending = useConfirmStore((s) => s.pending);
  return (
    <>
      {pending.map((req) => (
        <ConfirmDialog
          key={req.id}
          open
          onOpenChange={(open) => {
            // Fechar via Esc ou clique no overlay = cancelar.
            if (!open) resolveConfirm(req.id, false);
          }}
          title={req.title}
          description={req.description}
          confirmLabel={req.confirmLabel}
          cancelLabel={req.cancelLabel}
          variant={req.variant ?? "default"}
          onConfirm={() => resolveConfirm(req.id, true)}
          onCancel={() => resolveConfirm(req.id, false)}
        />
      ))}
    </>
  );
}
