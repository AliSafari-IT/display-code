import { describe, it, expect } from 'vitest';
import { highlightCode, escapeHtml } from '../utils';
import { LanguageDefinition } from '../types';

// ─── escapeHtml ───────────────────────────────────────────────────────────

describe('escapeHtml', () => {
  it('escapes ampersands', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });

  it('escapes angle brackets', () => {
    expect(escapeHtml('<div>')).toBe('&lt;div&gt;');
  });

  it('escapes quotes', () => {
    expect(escapeHtml('"hello" \'world\'')).toBe('&quot;hello&quot; &#39;world&#39;');
  });

  it('escapes a complete HTML tag', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt;'
    );
  });

  it('handles empty string', () => {
    expect(escapeHtml('')).toBe('');
  });

  it('handles strings with no special characters', () => {
    expect(escapeHtml('plain text 123')).toBe('plain text 123');
  });

  it('is a pure function (no DOM dependency)', () => {
    // Vitest runs in Node by default. If escapeHtml used document.createElement
    // it would throw. Running successfully here proves SSR-safety.
    expect(() => escapeHtml('<b>bold</b>')).not.toThrow();
  });
});

// ─── highlightCode – basic output ─────────────────────────────────────────

describe('highlightCode – basic output', () => {
  it('wraps keywords in highlight spans', () => {
    const html = highlightCode('const x = 1;', 'javascript');
    expect(html).toContain('<span class="highlight-keyword">const</span>');
    expect(html).toContain('<span class="highlight-number">1</span>');
  });

  it('wraps strings in highlight spans', () => {
    const html = highlightCode('const s = "hello";', 'javascript');
    // Quotes are escaped inside the span – the token content is HTML-escaped
    expect(html).toContain('<span class="highlight-string">&quot;hello&quot;</span>');
  });

  it('does not wrap plain text identifiers in spans', () => {
    const html = highlightCode('const x = 1;', 'javascript');
    // 'x' is a plain identifier – stripping all span tags should leave it intact
    const stripped = html.replace(/<\/?span[^>]*>/g, '');
    expect(stripped).toBe('const x = 1;');
  });

  it('preserves the original code content in the output', () => {
    const code = 'const x = 42;';
    const html = highlightCode(code, 'javascript');
    // Strip all HTML tags and compare
    const stripped = html.replace(/<[^>]*>/g, '');
    expect(stripped).toBe(code);
  });
});

// ─── highlightCode – unsafe input (XSS prevention) ────────────────────────

describe('highlightCode – unsafe input (XSS prevention)', () => {
  it('escapes HTML in code content so it cannot inject scripts', () => {
    const malicious = '<script>alert("xss")</script>';
    const html = highlightCode(malicious, 'javascript');
    // The raw <script> tag must never appear in the output
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('</script>');
    // Angle brackets must be escaped (possibly inside operator spans)
    expect(html).toContain('&lt;');
    expect(html).toContain('&gt;');
  });

  it('escapes HTML inside string tokens', () => {
    const code = 'const html = "<b>bold</b>";';
    const html = highlightCode(code, 'javascript');
    // The <b> tags inside the string should be escaped
    expect(html).not.toContain('<b>bold</b>');
    expect(html).toContain('&lt;b&gt;bold&lt;/b&gt;');
  });

  it('escapes HTML inside comment tokens', () => {
    const code = '// <img src=x onerror=alert(1)>';
    const html = highlightCode(code, 'javascript');
    expect(html).not.toContain('<img ');
    expect(html).toContain('&lt;img');
  });

  it('does not produce unescaped angle brackets outside span tags', () => {
    const code = 'const x = "<div>";';
    const html = highlightCode(code, 'javascript');
    // After removing all valid span tags, no < or > should remain
    const withoutSpans = html.replace(/<\/?span[^>]*>/g, '');
    expect(withoutSpans).not.toMatch(/[<>]/);
  });
});

// ─── highlightCode – unknown / plaintext ──────────────────────────────────

describe('highlightCode – unknown and plaintext', () => {
  it('returns escaped plaintext for unknown languages', () => {
    const html = highlightCode('some <text>', 'klingon');
    expect(html).toBe('some &lt;text&gt;');
    expect(html).not.toContain('<span');
  });

  it('returns escaped plaintext for plaintext language', () => {
    const html = highlightCode('no <highlighting> here', 'plaintext');
    expect(html).toBe('no &lt;highlighting&gt; here');
    expect(html).not.toContain('<span');
  });
});

// ─── highlightCode – custom languages ─────────────────────────────────────

describe('highlightCode – custom languages', () => {
  it('highlights using a custom language definition', () => {
    const graphqlDef: LanguageDefinition = {
      name: 'GraphQL',
      extensions: ['.graphql'],
      keywords: ['type'],
      rules: [
        { pattern: /\btype\b/g, className: 'keyword' },
      ],
    };
    const html = highlightCode('type User', 'graphql', { graphql: graphqlDef });
    expect(html).toContain('<span class="highlight-keyword">type</span>');
  });
});

// ─── highlightCode – multiline ────────────────────────────────────────────

describe('highlightCode – multiline constructs', () => {
  it('wraps multi-line block comments in a single span', () => {
    const code = '/* line 1\nline 2 */';
    const html = highlightCode(code, 'javascript');
    expect(html).toContain('<span class="highlight-comment">/* line 1\nline 2 */</span>');
  });

  it('wraps multi-line template literals in a single span', () => {
    const code = '`hello\nworld`';
    const html = highlightCode(code, 'javascript');
    expect(html).toContain('<span class="highlight-string">`hello\nworld`</span>');
  });
});

// ─── highlightCode – SSR safety ───────────────────────────────────────────

describe('highlightCode – SSR safety', () => {
  it('works without window or document (Node environment)', () => {
    // Vitest runs in Node. If highlightCode used DOM APIs it would throw.
    expect(() => highlightCode('const x = 1;', 'javascript')).not.toThrow();
  });
});
