// Gerador de senhas criptograficamente seguro.
//
// Princípios:
// 1. Aleatoriedade vem APENAS de `crypto.getRandomValues` — NUNCA usar
//    `Math.random` (não é criptográfico, é previsível dado o seed).
// 2. Seleção de char usa **rejection sampling** para evitar viés modular:
//    `byte % poolSize` enviesa quando `256` não é múltiplo de `poolSize`
//    (chars iniciais do pool ganham probabilidade levemente maior).
//    Solução: descartar bytes acima do maior múltiplo de `poolSize` ≤ 256
//    e re-amostrar.
// 3. Por padrão, evita caracteres ambíguos (`l`, `I`, `1`, `O`, `0`)
//    porque o usuário tipicamente lê a senha gerada da tela e digita em
//    outro app — ambiguidade visual gera erro de digitação. Pode ser
//    desligado pra senhas usadas só programaticamente.
// 4. Garante pelo menos um caractere de cada categoria habilitada via
//    "seeding" + Fisher-Yates embaralhado com `crypto.getRandomValues`.
//    Isso reduz minimamente a entropia (alguns bits em senhas curtas)
//    em troca de garantir que toggles do usuário não sejam ignorados.
//    Negligível pra senhas ≥ 12 chars.

/** Conjuntos "limpos" — sem caracteres ambíguos. */
const LOWERCASE = "abcdefghijkmnopqrstuvwxyz"; // sem 'l'
const UPPERCASE = "ABCDEFGHJKLMNPQRSTUVWXYZ";  // sem 'I' e 'O'
const NUMBERS = "23456789";                     // sem '0' e '1'
const SYMBOLS = "!@#$%^&*()_+-=[]{};:,.<>?";

/** Caracteres ambíguos — adicionados ao pool quando avoidAmbiguous=false. */
const AMBIGUOUS_LOWERCASE = "l";
const AMBIGUOUS_UPPERCASE = "IO";
const AMBIGUOUS_NUMBERS = "01";

export interface GeneratorOptions {
  /** Comprimento da senha. Spec do gerador: 8-64. */
  length: number;
  useLowercase: boolean;
  useUppercase: boolean;
  useNumbers: boolean;
  useSymbols: boolean;
  /** `true` (default) → exclui `l/I/1/O/0`. `false` → inclui. */
  avoidAmbiguous: boolean;
}

export const DEFAULT_OPTIONS: GeneratorOptions = {
  length: 20,
  useLowercase: true,
  useUppercase: true,
  useNumbers: true,
  useSymbols: true,
  avoidAmbiguous: true,
};

/**
 * Gera uma senha aleatória conforme `options`.
 *
 * Retorna `""` se nenhum toggle de categoria estiver ligado (a UI
 * deveria desabilitar o botão "usar essa senha" nesse caso).
 *
 * Garante presença de pelo menos um caractere de cada categoria
 * habilitada — desde que `length` seja maior ou igual à quantidade de
 * categorias habilitadas (sempre verdade na faixa 8-64).
 */
export function generatePassword(options: GeneratorOptions): string {
  const { length, avoidAmbiguous } = options;

  // Monta o pool de cada categoria habilitada (separado, pra garantir
  // 1 char de cada).
  const buckets: string[] = [];
  if (options.useLowercase) {
    buckets.push(LOWERCASE + (avoidAmbiguous ? "" : AMBIGUOUS_LOWERCASE));
  }
  if (options.useUppercase) {
    buckets.push(UPPERCASE + (avoidAmbiguous ? "" : AMBIGUOUS_UPPERCASE));
  }
  if (options.useNumbers) {
    buckets.push(NUMBERS + (avoidAmbiguous ? "" : AMBIGUOUS_NUMBERS));
  }
  if (options.useSymbols) {
    buckets.push(SYMBOLS);
  }

  if (buckets.length === 0 || length <= 0) return "";

  // Pool combinado pra preencher as posições "livres".
  const fullPool = buckets.join("");

  // Etapa 1: 1 char de cada bucket habilitado (garantia de presença).
  const chars: string[] = [];
  for (const bucket of buckets) {
    if (chars.length >= length) break;
    chars.push(pickCharFromPool(bucket));
  }

  // Etapa 2: preencher o resto com chars do pool combinado.
  while (chars.length < length) {
    chars.push(pickCharFromPool(fullPool));
  }

  // Etapa 3: Fisher-Yates pra que os chars "obrigatórios" não fiquem
  // sempre no início.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = pickIndexBelow(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}

// ---------------------------------------------------------------------------
// Helpers internos — rejection sampling
// ---------------------------------------------------------------------------

/**
 * Sorteia um índice em `[0, max)` usando `crypto.getRandomValues` com
 * rejection sampling pra evitar viés modular. `max` deve ser >= 1.
 */
function pickIndexBelow(max: number): number {
  if (max <= 1) return 0;
  // Maior múltiplo de `max` que cabe em 1 byte (0-255).
  const ceiling = 256 - (256 % max);
  const buf = new Uint8Array(1);
  let byte: number;
  do {
    crypto.getRandomValues(buf);
    byte = buf[0];
  } while (byte >= ceiling);
  return byte % max;
}

/** Sorteia um char do pool (string) sem viés. */
function pickCharFromPool(pool: string): string {
  return pool[pickIndexBelow(pool.length)];
}
