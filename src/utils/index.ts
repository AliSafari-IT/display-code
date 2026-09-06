import { SupportedLanguage, LanguageDefinition } from '../types';
import { tokenize } from './tokenizer';

export { tokenize, splitTokensByLines } from './tokenizer';

/**
 * Escapes HTML special characters in a string so that code can be safely
 * embedded in `innerHTML` without executing embedded scripts.
 *
 * This is a **pure function** – it does not touch the DOM and is safe for
 * server-side rendering.
 */
export const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

/**
 * Highlights source code and returns an HTML string with `<span>` wrappers.
 *
 * Uses the same unified tokenizer as the `DisplayCode` component, ensuring
 * consistent output between the utility and the React component. Each token is
 * HTML-escaped before being wrapped, so the output cannot inject executable
 * HTML.
 *
 * @param code            The source code to highlight.
 * @param language        Language identifier (built-in or custom).
 * @param customLanguages Optional custom language definitions.
 */
export const highlightCode = (
  code: string,
  language: SupportedLanguage | string,
  customLanguages?: Record<string, LanguageDefinition>
): string => {
  const tokens = tokenize(code, language, customLanguages);

  return tokens
    .map(token => {
      const escaped = escapeHtml(token.content);
      if (token.type === 'plain') return escaped;
      return `<span class="highlight-${token.type}">${escaped}</span>`;
    })
    .join('');
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    }
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
};

const languageIcons: Record<string, string> = {
  javascript: '🟨',
  typescript: '🔷',
  jsx: '⚛️',
  tsx: '⚛️',
  html: '🌐',
  css: '🎨',
  json: '📄',
  markdown: '📝',
  bash: '💻',
  python: '🐍',
  java: '☕',
  cpp: '⚙️',
  sql: '🗃️',
  yaml: '📋',
  xml: '📊',
  plaintext: '📄',
};

/**
 * Returns an emoji icon for a language. Accepts any string so that custom
 * languages are handled gracefully (returns a default icon for unknowns).
 */
export const getLanguageIcon = (language: string): string => {
  return languageIcons[language.toLowerCase()] || '📄';
};
