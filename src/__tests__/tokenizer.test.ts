import { describe, it, expect } from 'vitest';
import { tokenize, splitTokensByLines } from '../utils/tokenizer';
import { LanguageDefinition } from '../types';

// ─── helpers ──────────────────────────────────────────────────────────────

/** Re-joins token contents – should equal the original code. */
function reconstruct(tokens: { content: string }[]): string {
  return tokens.map(t => t.content).join('');
}

/** Returns the set of token types that appear in the stream. */
function types(tokens: { type: string }[]): Set<string> {
  return new Set(tokens.map(t => t.type));
}

// ─── built-in languages ───────────────────────────────────────────────────

describe('tokenize – built-in languages', () => {
  it('tokenizes JavaScript with correct token types', () => {
    const tokens = tokenize('const x = 42;', 'javascript');
    expect(types(tokens)).toContain('keyword');   // const
    expect(types(tokens)).toContain('number');    // 42
    expect(reconstruct(tokens)).toBe('const x = 42;');
  });

  it('tokenizes TypeScript with interface keyword', () => {
    const tokens = tokenize('interface User { name: string }', 'typescript');
    expect(types(tokens)).toContain('keyword'); // interface
    expect(reconstruct(tokens)).toBe('interface User { name: string }');
  });

  it('tokenizes Python with def keyword and strings', () => {
    const tokens = tokenize('def hello():\n    return "hi"', 'python');
    expect(types(tokens)).toContain('keyword'); // def, return
    expect(types(tokens)).toContain('string');  // "hi"
    expect(reconstruct(tokens)).toBe('def hello():\n    return "hi"');
  });

  it('tokenizes JSON with keys, strings, and booleans', () => {
    const tokens = tokenize('{"active": true, "count": 3}', 'json');
    expect(types(tokens)).toContain('key');     // "active", "count"
    expect(types(tokens)).toContain('boolean'); // true
    expect(types(tokens)).toContain('number');  // 3
    expect(reconstruct(tokens)).toBe('{"active": true, "count": 3}');
  });

  it('tokenizes CSS with selectors, properties, and colors', () => {
    const tokens = tokenize('.btn { color: #fff; }', 'css');
    expect(types(tokens)).toContain('selector'); // .btn
    expect(types(tokens)).toContain('property'); // color
    expect(types(tokens)).toContain('color');    // #fff
    expect(reconstruct(tokens)).toBe('.btn { color: #fff; }');
  });

  it('tokenizes HTML with tags (attribute strings are part of the tag token)', () => {
    const tokens = tokenize('<div class="box">Hi</div>', 'html');
    expect(types(tokens)).toContain('tag'); // <div class="box"> and </div>
    // The tag regex consumes the entire opening tag including attributes,
    // so "box" is part of the tag token, not a separate string token.
    expect(reconstruct(tokens)).toBe('<div class="box">Hi</div>');
  });

  it('tokenizes Bash with comments, variables, and keywords', () => {
    const tokens = tokenize('# comment\nif [ $x ]; then echo hi; fi', 'bash');
    expect(types(tokens)).toContain('comment');   // # comment
    expect(types(tokens)).toContain('keyword');   // if, then, fi
    expect(types(tokens)).toContain('variable');  // $x (not inside a string)
    expect(reconstruct(tokens)).toBe('# comment\nif [ $x ]; then echo hi; fi');
  });

  it('tokenizes SQL with keywords (case-insensitive)', () => {
    const tokens = tokenize('select * from users', 'sql');
    expect(types(tokens)).toContain('keyword'); // select, from
    expect(reconstruct(tokens)).toBe('select * from users');
  });

  it('tokenizes every documented built-in language without errors', () => {
    const langs = [
      'javascript', 'typescript', 'jsx', 'tsx', 'html', 'css', 'json',
      'markdown', 'bash', 'python', 'java', 'cpp', 'sql', 'yaml', 'xml',
      'plaintext',
    ];
    for (const lang of langs) {
      const tokens = tokenize('sample code', lang);
      expect(tokens.length).toBeGreaterThan(0);
      expect(reconstruct(tokens)).toBe('sample code');
    }
  });
});

// ─── custom languages ─────────────────────────────────────────────────────

describe('tokenize – custom languages', () => {
  const graphqlDefinition: LanguageDefinition = {
    name: 'GraphQL',
    extensions: ['.graphql', '.gql'],
    keywords: ['type', 'query', 'mutation', 'schema', 'input', 'interface', 'union'],
    rules: [
      { pattern: /#.*/g, className: 'comment' },
      { pattern: /\b(type|query|mutation|schema|input|interface|union)\b/g, className: 'keyword' },
      { pattern: /\b[A-Z][a-zA-Z0-9_]*\b/g, className: 'class-name' },
      { pattern: /"[^"]*"/g, className: 'string' },
    ],
  };

  it('uses a custom language definition', () => {
    const tokens = tokenize(
      'type User { name: String }',
      'graphql',
      { graphql: graphqlDefinition }
    );
    expect(types(tokens)).toContain('keyword');     // type
    expect(types(tokens)).toContain('class-name');  // User, String
    expect(reconstruct(tokens)).toBe('type User { name: String }');
  });

  it('custom language takes precedence over built-in with the same key', () => {
    const override: LanguageDefinition = {
      name: 'JavaScript Custom',
      extensions: ['.js'],
      keywords: ['custom'],
      rules: [
        { pattern: /\bcustom\b/g, className: 'keyword' },
      ],
    };
    const tokens = tokenize('custom const', 'javascript', { javascript: override });
    // 'const' should NOT be a keyword because the custom definition replaced the rules
    const keywordTokens = tokens.filter(t => t.type === 'keyword');
    expect(keywordTokens).toHaveLength(1);
    expect(keywordTokens[0].content).toBe('custom');
  });

  it('falls back to built-in when custom languages are provided but key is absent', () => {
    const tokens = tokenize('const x = 1;', 'javascript', { graphql: graphqlDefinition });
    expect(types(tokens)).toContain('keyword'); // const (from built-in JS)
  });
});

// ─── unknown languages ────────────────────────────────────────────────────

describe('tokenize – unknown languages', () => {
  it('renders unknown language as plaintext', () => {
    const tokens = tokenize('some random text', 'klingon');
    expect(tokens).toHaveLength(1);
    expect(tokens[0].type).toBe('plain');
    expect(tokens[0].content).toBe('some random text');
  });

  it('renders undefined language as plaintext', () => {
    const tokens = tokenize('plain code', undefined);
    expect(tokens).toHaveLength(1);
    expect(tokens[0].type).toBe('plain');
  });

  it('renders empty string as empty array', () => {
    expect(tokenize('', 'javascript')).toEqual([]);
  });

  it('plaintext language produces a single plain token', () => {
    const tokens = tokenize('no highlighting here', 'plaintext');
    expect(tokens).toHaveLength(1);
    expect(tokens[0].type).toBe('plain');
  });
});

// ─── multiline constructs ─────────────────────────────────────────────────

describe('tokenize – multiline constructs', () => {
  it('preserves block comments across lines (JavaScript)', () => {
    const code = '/* line 1\nline 2\nline 3 */';
    const tokens = tokenize(code, 'javascript');
    const commentTokens = tokens.filter(t => t.type === 'comment');
    expect(commentTokens).toHaveLength(1);
    expect(commentTokens[0].content).toBe(code);
  });

  it('preserves template literals across lines (JavaScript)', () => {
    const code = '`hello\nworld`';
    const tokens = tokenize(code, 'javascript');
    const stringTokens = tokens.filter(t => t.type === 'string');
    expect(stringTokens).toHaveLength(1);
    expect(stringTokens[0].content).toBe(code);
  });

  it('preserves Python triple-quoted strings across lines', () => {
    const code = '"""multi\nline\nstring"""';
    const tokens = tokenize(code, 'python');
    const stringTokens = tokens.filter(t => t.type === 'string');
    expect(stringTokens).toHaveLength(1);
    expect(stringTokens[0].content).toBe(code);
  });

  it('preserves HTML comments across lines', () => {
    const code = '<!-- comment\nspanning lines -->';
    const tokens = tokenize(code, 'html');
    const commentTokens = tokens.filter(t => t.type === 'comment');
    expect(commentTokens).toHaveLength(1);
    expect(commentTokens[0].content).toBe(code);
  });

  it('preserves C++ block comments across lines', () => {
    const code = '/* multi\nline\ncomment */';
    const tokens = tokenize(code, 'cpp');
    const commentTokens = tokens.filter(t => t.type === 'comment');
    expect(commentTokens).toHaveLength(1);
    expect(commentTokens[0].content).toBe(code);
  });
});

// ─── splitTokensByLines ───────────────────────────────────────────────────

describe('splitTokensByLines', () => {
  it('splits a single-line token stream into one line', () => {
    const tokens = tokenize('const x = 1;', 'javascript');
    const lines = splitTokensByLines(tokens);
    expect(lines).toHaveLength(1);
    expect(lines[0].map(t => t.content).join('')).toBe('const x = 1;');
  });

  it('splits multi-line block comments into per-line tokens with correct type', () => {
    const tokens = tokenize('/* a\nb\nc */', 'javascript');
    const lines = splitTokensByLines(tokens);
    expect(lines).toHaveLength(3);
    // Every line should have at least one comment token
    for (const line of lines) {
      expect(line.every(t => t.type === 'comment')).toBe(true);
    }
  });

  it('handles trailing newline correctly', () => {
    const tokens = tokenize('x\n', 'javascript');
    const lines = splitTokensByLines(tokens);
    expect(lines).toHaveLength(2);
    expect(lines[1]).toEqual([]); // empty line after trailing \n
  });

  it('handles empty input', () => {
    expect(splitTokensByLines([])).toEqual([[]]);
  });

  it('preserves token types across line boundaries', () => {
    const code = '`line1\nline2`';
    const tokens = tokenize(code, 'javascript');
    const lines = splitTokensByLines(tokens);
    expect(lines).toHaveLength(2);
    expect(lines[0][0].type).toBe('string');
    expect(lines[1][0].type).toBe('string');
  });
});

// ─── round-trip integrity ─────────────────────────────────────────────────

describe('tokenize – round-trip integrity', () => {
  it('reconstructing all token contents equals the original code', () => {
    const samples = [
      'const x = 42;',
      'function f() { return "hello"; }',
      '/* multi\nline */\nlet y = 10;',
      '<div>\n  <p>text</p>\n</div>',
      '{"a": 1, "b": [true, false]}',
      'def f():\n    """doc"""\n    return 42',
    ];
    for (const code of samples) {
      const tokens = tokenize(code, 'javascript');
      expect(reconstruct(tokens)).toBe(code);
    }
  });
});
