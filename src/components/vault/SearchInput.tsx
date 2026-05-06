// Input de busca em tempo real. Renderizado no VaultHeader (header
// global). Atalho de foco é registrado via useGlobalShortcuts.ts (não
// aqui). ESC dentro do input limpa + tira foco. Botão X aparece só
// quando há texto, limpa e mantém foco.

import { Search, X } from "lucide-react";
import { useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  /**
   * `id` opcional para o `<input>`. Útil pra o `useGlobalShortcuts`
   * focar o campo via `document.getElementById(...)`. Padrão usado no
   * VaultHeader: `"vault-search-input"`.
   */
  id?: string;
}

export function SearchInput({
  value,
  onChange,
  className,
  placeholder = "Buscar entradas...",
  id,
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // ESC dentro do input: clear + blur. Mesmo se o input estiver vazio,
  // ESC tira o foco (UX consistente: ESC sempre "saí da busca").
  function handleKeydown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      onChange("");
      inputRef.current?.blur();
    }
  }

  function handleClear() {
    onChange("");
    inputRef.current?.focus();
  }

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        ref={inputRef}
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeydown}
        placeholder={placeholder}
        className="pl-8 pr-8 h-9"
        aria-label="Buscar entradas"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
          aria-label="Limpar busca"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
