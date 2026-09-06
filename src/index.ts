export { DisplayCode } from './components/DisplayCode';
export type {
  DisplayCodeProps,
  SupportedLanguage,
  HighlightRule,
  LanguageDefinition,
  Token
} from './types';
export {
  highlightCode,
  copyToClipboard,
  getLanguageIcon,
  escapeHtml,
  tokenize,
  splitTokensByLines
} from './utils';
export {
  languages,
  detectLanguage
} from './utils/syntax-highlighter';
