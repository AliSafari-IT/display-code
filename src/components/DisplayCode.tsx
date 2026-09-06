import React, { useState, useEffect, useMemo } from 'react';
import { DisplayCodeProps } from '../types';
import { tokenize, splitTokensByLines } from '../utils/tokenizer';
import { detectLanguage } from '../utils/syntax-highlighter';
import { copyToClipboard, getLanguageIcon } from '../utils';

// Main component
export const DisplayCode: React.FC<DisplayCodeProps> = ({
  code,
  language,
  languages: customLanguages,
  theme = 'light',
  showLineNumbers = false,
  showCopyButton = true,
  title,
  maxHeight = '600px',
  wrapLines = false,
  className = '',
  onCopy,
  fontSize = 'medium',
  highlightLines = [],
  startLineNumber = 1,
  tabSize = 2,
  showLanguageLabel = true
}) => {
  const [copied, setCopied] = useState(false);
  const [actualTheme, setActualTheme] = useState(theme);

  // Handle auto theme detection
  useEffect(() => {
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setActualTheme(mediaQuery.matches ? 'dark' : 'light');

      const handleChange = (e: MediaQueryListEvent) => {
        setActualTheme(e.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      setActualTheme(theme);
    }
  }, [theme]);

  const detectedLanguage = useMemo(() => {
    return (language || detectLanguage(code)) as string;
  }, [code, language]);

  // Tokenize the full code (handles multi-line constructs), then split into lines.
  const processedLines = useMemo(() => {
    const normalizedCode = code.replace(/\t/g, ' '.repeat(tabSize));
    const tokens = tokenize(normalizedCode, detectedLanguage, customLanguages);
    const tokenLines = splitTokensByLines(tokens);

    return tokenLines.map((lineTokens, index) => {
      const lineNumber = index + startLineNumber;
      return {
        tokens: lineTokens,
        highlighted: highlightLines.includes(lineNumber),
        lineNumber
      };
    });
  }, [code, tabSize, startLineNumber, highlightLines, detectedLanguage, customLanguages]);

  const handleCopy = async () => {
    const success = await copyToClipboard(code);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopy?.(code);
    }
  };

  const isDark = actualTheme === 'dark';

  // Inline styles for the component
  const styles = {
    container: {
      position: 'relative' as const,
      borderRadius: '8px',
      overflow: 'hidden',
      margin: '1rem 0',
      maxWidth: '100%',
      boxShadow: isDark
        ? '0 2px 8px rgba(0, 0, 0, 0.3)'
        : '0 2px 8px rgba(0, 0, 0, 0.1)',
      backgroundColor: isDark ? '#1a202c' : '#ffffff',
      color: isDark ? '#e2e8f0' : '#1a202c',
      border: `1px solid ${isDark ? '#2d3748' : '#e2e8f0'}`
    },
    header: {
      display: 'flex' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      padding: '0.75rem 1rem',
      backgroundColor: isDark ? '#2d3748' : '#f8f9fa',
      borderBottom: `1px solid ${isDark ? '#4a5568' : '#e9ecef'}`
    },
    title: {
      margin: 0,
      fontSize: '0.9rem',
      fontWeight: 600,
      color: isDark ? '#e2e8f0' : '#1a202c'
    },
    languageLabel: {
      display: 'inline-flex' as const,
      alignItems: 'center' as const,
      padding: '0.25rem 0.5rem',
      borderRadius: '4px',
      fontSize: '0.75rem',
      fontWeight: 500,
      backgroundColor: isDark ? '#4a5568' : '#e9ecef',
      color: isDark ? '#e2e8f0' : '#1a202c'
    },
    copyButton: {
      display: 'inline-flex' as const,
      alignItems: 'center' as const,
      padding: '0.25rem 0.5rem',
      borderRadius: '4px',
      border: 'none',
      fontSize: '0.75rem',
      fontWeight: 500,
      backgroundColor: copied
        ? (isDark ? '#276749' : '#c6f6d5')
        : (isDark ? '#4a5568' : '#e9ecef'),
      color: copied
        ? (isDark ? '#c6f6d5' : '#276749')
        : (isDark ? '#e2e8f0' : '#1a202c'),
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    codeWrapper: {
      position: 'relative' as const,
      overflow: 'auto',
      maxHeight: maxHeight,
      backgroundColor: isDark ? '#1a202c' : '#ffffff'
    },
    pre: {
      margin: 0,
      padding: showLineNumbers ? '1rem 0 1rem 3rem' : '1rem',
      overflow: 'visible',
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      fontSize: fontSize === 'small' ? '0.75rem' : fontSize === 'large' ? '1rem' : '0.875rem',
      lineHeight: 1.5,
      tabSize: tabSize,
      whiteSpace: wrapLines ? 'pre-wrap' : 'pre',
      position: 'relative' as const
    },
    lineNumbers: {
      position: 'absolute' as const,
      left: 0,
      top: 0,
      bottom: 0,
      width: '2.5rem',
      textAlign: 'right' as const,
      padding: '1rem 0.5rem',
      backgroundColor: isDark ? '#2d3748' : '#f8f9fa',
      color: isDark ? '#718096' : '#a0aec0',
      userSelect: 'none' as const,
      borderRight: `1px solid ${isDark ? '#4a5568' : '#e9ecef'}`
    },
    line: {
      display: 'block',
      position: 'relative' as const,
      padding: '0 0.5rem'
    },
    lineHighlight: {
      backgroundColor: isDark ? 'rgba(66, 153, 225, 0.1)' : 'rgba(66, 153, 225, 0.05)',
      width: '100%',
      display: 'inline-block',
      borderLeft: `2px solid ${isDark ? '#4299e1' : '#63b3ed'}`
    },
    lineNumber: {
      display: 'block',
      textAlign: 'right' as const,
      paddingRight: '0.5rem',
      color: isDark ? '#718096' : '#a0aec0',
      userSelect: 'none' as const
    }
  };

  // CSS for syntax highlighting – covers every token type produced by the
  // unified tokenizer. Uses `highlight-*` class names that match the CSS Module
  // and the `highlightCode` utility, ensuring a stable token-class contract.
  const syntaxStyles = `
    .highlight-comment { color: ${isDark ? '#a0aec0' : '#6c757d'}; font-style: italic; }
    .highlight-keyword { color: ${isDark ? '#63b3ed' : '#0d6efd'}; font-weight: 600; }
    .highlight-boolean { color: ${isDark ? '#b794f6' : '#6f42c1'}; }
    .highlight-string { color: ${isDark ? '#f687b3' : '#d63384'}; }
    .highlight-number { color: ${isDark ? '#f093fb' : '#e83e8c'}; }
    .highlight-function { color: ${isDark ? '#fc8181' : '#dc3545'}; }
    .highlight-class-name { color: ${isDark ? '#f6ad55' : '#fd7e14'}; }
    .highlight-tag { color: ${isDark ? '#68d391' : '#198754'}; }
    .highlight-key { color: ${isDark ? '#63b3ed' : '#0d6efd'}; }
    .highlight-property { color: ${isDark ? '#b794f6' : '#6f42c1'}; }
    .highlight-selector { color: ${isDark ? '#68d391' : '#198754'}; }
    .highlight-color { color: ${isDark ? '#f093fb' : '#e83e8c'}; }
    .highlight-variable { color: ${isDark ? '#f6ad55' : '#fd7e14'}; }
    .highlight-header { color: ${isDark ? '#63b3ed' : '#0d6efd'}; font-weight: 600; }
    .highlight-bold { font-weight: 600; }
    .highlight-italic { font-style: italic; }
    .highlight-code { background: ${isDark ? '#2d3748' : '#f8f9fa'}; padding: 0.125rem 0.25rem; border-radius: 3px; }
    .highlight-code-block { background: ${isDark ? '#2d3748' : '#f8f9fa'}; padding: 0.5rem; border-radius: 4px; display: block; margin: 0.5rem 0; }
    .highlight-link { color: ${isDark ? '#63b3ed' : '#0d6efd'}; text-decoration: underline; }
    .highlight-processing-instruction { color: ${isDark ? '#a0aec0' : '#6c757d'}; font-style: italic; }
    .highlight-operator { color: ${isDark ? '#e2e8f0' : '#495057'}; }
    .highlight-punctuation { color: ${isDark ? '#e2e8f0' : '#495057'}; }
  `;

  return (
    <div style={styles.container} className={className || undefined}>
      <style>{syntaxStyles}</style>
      {(title || showLanguageLabel || showCopyButton) && (
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {title && (
              <h3 style={styles.title}>
                {title}
              </h3>
            )}
            {showLanguageLabel && (
              <span style={styles.languageLabel}>
                {getLanguageIcon(detectedLanguage)} {detectedLanguage}
              </span>
            )}
          </div>
          {showCopyButton && (
            <button
              style={styles.copyButton}
              onClick={handleCopy}
              aria-label="Copy code to clipboard"
            >
              {copied ? (
                <>
                  <span style={{ marginRight: '0.25rem' }}>✓</span>
                  Copied!
                </>
              ) : (
                <>
                  <span style={{ marginRight: '0.25rem' }}>📋</span>
                  Copy
                </>
              )}
            </button>
          )}
        </div>
      )}
      <div style={styles.codeWrapper}>
        {showLineNumbers && (
          <div style={styles.lineNumbers}>
            {processedLines.map((line, index) => (
              <span key={`ln-${index}`} style={styles.lineNumber}>
                {line.lineNumber}
              </span>
            ))}
          </div>
        )}
        <pre style={styles.pre}>
          <code>
            {processedLines.map((line, index) => (
              <div
                key={index}
                style={{
                  ...styles.line,
                  ...(line.highlighted ? styles.lineHighlight : {})
                }}
              >
                {line.tokens.length > 0 ? (
                  line.tokens.map((token, tokenIndex) => (
                    <span
                      key={tokenIndex}
                      className={token.type !== 'plain' ? `highlight-${token.type}` : undefined}
                    >
                      {token.content}
                    </span>
                  ))
                ) : (
                  ' '
                )}
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
};
