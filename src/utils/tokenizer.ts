import { Token, LanguageDefinition, HighlightRule } from '../types';
import { languages } from './syntax-highlighter';

/**
 * Resolves a language identifier to its definition, checking custom languages
 * first (so consumers can override built-ins), then the built-in registry.
 * Returns `undefined` for unknown languages (caller should treat as plaintext).
 */
function resolveLanguage(
  language: string | undefined,
  customLanguages?: Record<string, LanguageDefinition>
): LanguageDefinition | undefined {
  if (!language) return undefined;
  const key = language.toLowerCase();
  if (customLanguages && customLanguages[key]) {
    return customLanguages[key];
  }
  return (languages as Record<string, LanguageDefinition>)[key];
}

interface CompiledRule {
  className: string;
  /** Sticky regex – only matches at `lastIndex`. */
  sticky: RegExp;
  /** Global regex – used to scan forward for the next match. */
  global: RegExp;
}

/**
 * Pre-compiles a list of `HighlightRule`s into sticky + global regex pairs.
 * The original `g` flag is replaced with `y` (sticky) or `g` (global) respectively;
 * all other flags (`m`, `i`, `s`, …) are preserved.
 */
function compileRules(rules: HighlightRule[]): CompiledRule[] {
  return rules.map(rule => {
    const baseFlags = rule.pattern.flags.replace(/g/g, '');
    return {
      className: rule.className,
      sticky: new RegExp(rule.pattern.source, baseFlags + 'y'),
      global: new RegExp(rule.pattern.source, baseFlags + 'g'),
    };
  });
}

/**
 * Tokenizes `code` using the supplied rules.
 *
 * The algorithm walks the string left-to-right. At each position it tries every
 * rule in priority order (first match wins, respecting rule ordering so that
 * comments are matched before keywords, etc.). When a rule matches, its text is
 * emitted as a typed token and the cursor advances. When no rule matches at the
 * current position, the cursor advances to the next position where *any* rule
 * matches, emitting the intervening text as a `plain` token.
 *
 * This approach correctly handles multi-line constructs (block comments,
 * template literals, etc.) because the entire code string is tokenized as a
 * unit – callers can split the resulting tokens by `\n` afterwards.
 */
function tokenizeWithRules(code: string, rules: HighlightRule[]): Token[] {
  if (rules.length === 0) {
    return [{ type: 'plain', content: code }];
  }

  const compiled = compileRules(rules);
  const tokens: Token[] = [];
  let pos = 0;

  while (pos < code.length) {
    let matched = false;

    // Try each rule at the current position (priority by order).
    for (const rule of compiled) {
      rule.sticky.lastIndex = pos;
      const match = rule.sticky.exec(code);
      if (match && match[0].length > 0) {
        tokens.push({ type: rule.className, content: match[0] });
        pos = rule.sticky.lastIndex;
        matched = true;
        break;
      }
    }

    if (matched) continue;

    // No rule matched at `pos` – find the nearest position where any rule matches.
    let nextMatch = code.length;
    for (const rule of compiled) {
      rule.global.lastIndex = pos + 1;
      const match = rule.global.exec(code);
      if (match && match.index < nextMatch) {
        nextMatch = match.index;
      }
    }

    const plainEnd = Math.max(pos + 1, nextMatch);
    tokens.push({ type: 'plain', content: code.slice(pos, plainEnd) });
    pos = plainEnd;
  }

  return mergeAdjacentTokens(tokens);
}

/** Merges consecutive tokens that share the same `type` to reduce node count. */
function mergeAdjacentTokens(tokens: Token[]): Token[] {
  const merged: Token[] = [];
  for (const token of tokens) {
    const last = merged[merged.length - 1];
    if (last && last.type === token.type) {
      last.content += token.content;
    } else {
      merged.push({ type: token.type, content: token.content });
    }
  }
  return merged;
}

/**
 * Tokenizes source code into a stream of `Token`s using the unified
 * `LanguageDefinition` registry.
 *
 * - Built-in languages are resolved from the `languages` map in
 *   `syntax-highlighter.ts`.
 * - Custom languages supplied via `customLanguages` take precedence, allowing
 *   consumers to override built-ins or add new languages without mutating
 *   global state.
 * - Unknown or undefined languages produce a single `plain` token (safe
 *   plaintext rendering).
 *
 * The function is pure – it does not touch `window` or `document` and is safe
 * for server-side rendering.
 *
 * @param code            The source code to tokenize.
 * @param language        Language identifier (e.g. `'javascript'`, `'graphql'`).
 * @param customLanguages Optional map of custom language definitions.
 */
export function tokenize(
  code: string,
  language: string | undefined,
  customLanguages?: Record<string, LanguageDefinition>
): Token[] {
  if (!code) return [];

  const lang = resolveLanguage(language, customLanguages);
  if (!lang || lang.rules.length === 0) {
    return [{ type: 'plain', content: code }];
  }

  return tokenizeWithRules(code, lang.rules);
}

/**
 * Splits a flat token stream into an array of lines, where each line is itself
 * an array of tokens. Token types are preserved across line boundaries so that
 * multi-line constructs (block comments, template literals, …) remain correctly
 * highlighted on every line they span.
 */
export function splitTokensByLines(tokens: Token[]): Token[][] {
  const lines: Token[][] = [[]];

  for (const token of tokens) {
    const parts = token.content.split('\n');
    for (let i = 0; i < parts.length; i++) {
      if (i > 0) lines.push([]);
      if (parts[i].length > 0) {
        lines[lines.length - 1].push({ type: token.type, content: parts[i] });
      }
    }
  }

  return lines;
}
