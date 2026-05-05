// ConfirmDialog programático — uso via Promise em vez de JSX.
//
// Padrão: o `ConfirmDialogHost` (montado no `App.tsx`) observa este store
// e renderiza o `ConfirmDialog` shadcn pra cada request pendente. A função
// `confirmDialog(opts)` adiciona uma request, retorna uma Promise, e
// resolve quando o usuário clica (ou quando o host chama `resolveConfirm`).
//
// Uso:
//   const ok = await confirmDialog({ title: "Descartar?", variant: "danger" });
//   if (ok) doDangerousThing();

import { create } from "zustand";

export type ConfirmVariant = "default" | "danger";

export interface ConfirmOptions {
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  /**
   * Se passado, o dialog auto-resolve após esse intervalo. Usado pelo
   * auto-lock por inatividade — se o usuário não responde em N
   * segundos, o app prefere descartar e bloquear (segurança > UX).
   */
  autoResolveAfterMs?: number;
  /** Valor que o auto-resolve devolve. Default: `true` (= confirma). */
  autoResolveValue?: boolean;
}

interface ConfirmRequest extends ConfirmOptions {
  id: string;
  resolve: (value: boolean) => void;
}

interface ConfirmStore {
  pending: ConfirmRequest[];
}

export const useConfirmStore = create<ConfirmStore>(() => ({
  pending: [],
}));

let counter = 0;

/**
 * Mostra um ConfirmDialog modal e retorna `true` se o usuário confirmou,
 * `false` se cancelou (incluindo Esc / clique fora).
 *
 * Se `autoResolveAfterMs` for passado, dispara `resolveConfirm(id,
 * autoResolveValue ?? true)` automaticamente após o intervalo — útil
 * pra auto-lock onde "não responder" deve ser tratado como "descarta e
 * bloqueia".
 */
export function confirmDialog(opts: ConfirmOptions): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const id = `confirm-${++counter}`;
    useConfirmStore.setState((s) => ({
      pending: [...s.pending, { id, ...opts, resolve }],
    }));

    if (opts.autoResolveAfterMs && opts.autoResolveAfterMs > 0) {
      const fallback = opts.autoResolveValue ?? true;
      window.setTimeout(() => {
        // Se ainda está pendente, força a resolução.
        const stillPending = useConfirmStore
          .getState()
          .pending.some((r) => r.id === id);
        if (stillPending) resolveConfirm(id, fallback);
      }, opts.autoResolveAfterMs);
    }
  });
}

/** Chamada pelo host quando o usuário clica em confirm/cancel. */
export function resolveConfirm(id: string, value: boolean): void {
  const req = useConfirmStore.getState().pending.find((r) => r.id === id);
  if (!req) return;
  req.resolve(value);
  useConfirmStore.setState((s) => ({
    pending: s.pending.filter((r) => r.id !== id),
  }));
}
