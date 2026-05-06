// Estado vazio da EntryList quando a busca não retorna nenhum resultado.
// Estilo consistente com EmptyRecycleBinState (centralizado, ícone grande
// + mensagem) — mais simples porque só ecoa a query do usuário.

import { SearchX } from "lucide-react";

interface EmptySearchResultsProps {
  query: string;
}

export function EmptySearchResults({ query }: EmptySearchResultsProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <SearchX className="h-12 w-12 text-muted-foreground/50 mb-4" />
      <p className="text-muted-foreground">
        Nenhum resultado para{" "}
        <span className="font-medium text-foreground">&ldquo;{query}&rdquo;</span>
      </p>
    </div>
  );
}
