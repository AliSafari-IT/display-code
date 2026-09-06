import { useState, useRef, useCallback } from "react";
import { DisplayCode } from "@asafarim/display-code";
import { useTheme } from "@asafarim/react-themes";

// ─── Icons ────────────────────────────────────────────────────────────────

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    // Eye-off icon
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    );
  }
  // Eye icon
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function CopyIcon({ copied }: { copied: boolean }) {
  if (copied) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

// ─── Source code reveal card ──────────────────────────────────────────────

function SourceReveal({ code, isDark }: { code: string; isDark: boolean }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1800);
    });
  }, [code]);

  return (
    <div className="howto-source">
      <div className="howto-source__toolbar">
        <button
          type="button"
          className="howto-source__btn howto-source__btn--toggle"
          onClick={() => setRevealed((v) => !v)}
          aria-expanded={revealed}
          aria-label={revealed ? "Hide source code" : "Show source code"}
        >
          <EyeIcon open={revealed} />
          <span>{revealed ? "Hide source" : "Show source"}</span>
        </button>
        {revealed && (
          <button
            type="button"
            className="howto-source__btn howto-source__btn--copy"
            onClick={copy}
            aria-label="Copy source code to clipboard"
          >
            <CopyIcon copied={copied} />
            <span>{copied ? "Copied!" : "Copy"}</span>
          </button>
        )}
      </div>
      {revealed && (
        <div className="howto-source__code">
          <DisplayCode
            code={code}
            language="tsx"
            theme={isDark ? "dark" : "light"}
            showLineNumbers={true}
            showCopyButton={false}
            fontSize="small"
            maxHeight="400px"
          />
        </div>
      )}
    </div>
  );
}

// ─── Use case card ────────────────────────────────────────────────────────

interface UseCase {
  id: string;
  title: string;
  description: string;
  badge?: string;
  code: string;        // The source code that produces the demo
  demoCode: string;    // The code to display inside the DisplayCode demo
  demoLanguage: string;
  demoProps: Record<string, unknown>;
}

function UseCaseCard({ useCase, isDark }: { useCase: UseCase; isDark: boolean }) {
  return (
    <div className="howto-card" id={useCase.id}>
      <div className="howto-card__header">
        <h3 className="howto-card__title">{useCase.title}</h3>
        {useCase.badge && <span className="howto-card__badge">{useCase.badge}</span>}
      </div>
      <p className="howto-card__desc">{useCase.description}</p>
      <div className="howto-card__demo">
        <DisplayCode
          code={useCase.demoCode}
          language={useCase.demoLanguage}
          theme={isDark ? "dark" : "light"}
          {...useCase.demoProps}
        />
      </div>
      <SourceReveal code={useCase.code} isDark={isDark} />
    </div>
  );
}

// ─── Installation steps ───────────────────────────────────────────────────

const INSTALL_COMMANDS = [
  {
    label: "npm",
    command: "npm install @asafarim/display-code",
  },
  {
    label: "pnpm",
    command: "pnpm add @asafarim/display-code",
  },
  {
    label: "yarn",
    command: "yarn add @asafarim/display-code",
  },
];

function InstallSection({ isDark }: { isDark: boolean }) {
  const [activeMgr, setActiveMgr] = useState("pnpm");

  return (
    <section className="howto-section">
      <h2 className="howto-section__title">📦 Installation</h2>
      <p className="howto-section__lead">
        Choose your preferred package manager:
      </p>
      <div className="howto-install">
        <div className="howto-install__tabs" role="tablist">
          {INSTALL_COMMANDS.map((mgr) => (
            <button
              key={mgr.label}
              type="button"
              role="tab"
              aria-selected={activeMgr === mgr.label}
              className={`howto-install__tab${
                activeMgr === mgr.label ? " howto-install__tab--active" : ""
              }`}
              onClick={() => setActiveMgr(mgr.label)}
            >
              {mgr.label}
            </button>
          ))}
        </div>
        <DisplayCode
          code={INSTALL_COMMANDS.find((m) => m.label === activeMgr)!.command}
          language="bash"
          theme={isDark ? "dark" : "light"}
          showLineNumbers={false}
          showCopyButton={true}
          fontSize="medium"
        />
      </div>
      <div className="howto-card">
        <div className="howto-card__header">
          <h3 className="howto-card__title">Basic Import</h3>
        </div>
        <p className="howto-card__desc">Import the component and its styles, then use it anywhere.</p>
        <SourceReveal
          isDark={isDark}
          code={`import { DisplayCode } from '@asafarim/display-code';

function App() {
  return (
    <DisplayCode
      code="console.log('Hello, World!');"
      language="javascript"
      theme="light"
      showLineNumbers={true}
      showCopyButton={true}
    />
  );
}`}
        />
      </div>
    </section>
  );
}

// ─── All use cases ────────────────────────────────────────────────────────

const USE_CASES: UseCase[] = [
  {
    id: "themes",
    title: "Light & Dark Themes",
    description: "Switch between light, dark, or auto theme based on user preference.",
    badge: "theme",
    demoCode: `const greeting = "Hello, World!";
console.log(greeting);

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}`,
    demoLanguage: "javascript",
    demoProps: { showLineNumbers: true, showCopyButton: true, title: "fibonacci.js" },
    code: `<DisplayCode
  code={code}
  language="javascript"
  theme="dark"
  showLineNumbers={true}
  showCopyButton={true}
  title="fibonacci.js"
/>`,
  },
  {
    id: "line-highlighting",
    title: "Line Highlighting",
    description: "Emphasize specific lines with highlightLines. Great for pointing out important code.",
    badge: "highlight",
    demoCode: `function authenticate(user, token) {
  if (!user) throw new Error("No user");
  const decoded = verifyToken(token);  // highlighted
  if (!decoded.valid) return null;     // highlighted
  return { user, session: decoded };
}`,
    demoLanguage: "javascript",
    demoProps: { showLineNumbers: true, highlightLines: [3, 4], title: "auth.ts" },
    code: `<DisplayCode
  code={code}
  language="javascript"
  showLineNumbers={true}
  highlightLines={[3, 4]}
  title="auth.ts"
/>`,
  },
  {
    id: "font-sizes",
    title: "Font Sizes",
    description: "Choose small, medium, or large font size for different contexts.",
    badge: "fontSize",
    demoCode: `export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "guest";
}`,
    demoLanguage: "typescript",
    demoProps: { fontSize: "large" as const, showLineNumbers: true, title: "types.ts" },
    code: `<DisplayCode
  code={code}
  language="typescript"
  fontSize="large"
  showLineNumbers={true}
  title="types.ts"
/>`,
  },
  {
    id: "line-numbers-offset",
    title: "Custom Start Line Number",
    description: "Start line numbers from a custom value — useful when showing a snippet from the middle of a file.",
    badge: "startLineNumber",
    demoCode: `  // This snippet starts at line 42
  const result = processData(input);
  return result.map(item => ({
    ...item,
    processed: true,
  }));`,
    demoLanguage: "javascript",
    demoProps: { showLineNumbers: true, startLineNumber: 42, title: "snippet.js" },
    code: `<DisplayCode
  code={code}
  language="javascript"
  showLineNumbers={true}
  startLineNumber={42}
  title="snippet.js"
/>`,
  },
  {
    id: "wrap-lines",
    title: "Line Wrapping",
    description: "Enable wrapLines to wrap long lines instead of horizontal scrolling.",
    badge: "wrapLines",
    demoCode: `const veryLongUrl = "https://api.example.com/v2/users?fields=id,name,email,role,permissions,createdAt,updatedAt,lastLogin,preferences,settings,metadata&limit=100&offset=0&sort=createdAt&order=desc";`,
    demoLanguage: "javascript",
    demoProps: { wrapLines: true, showLineNumbers: true, title: "config.js" },
    code: `<DisplayCode
  code={code}
  language="javascript"
  wrapLines={true}
  showLineNumbers={true}
  title="config.js"
/>`,
  },
  {
    id: "max-height",
    title: "Scrollable Max Height",
    description: "Set a maxHeight to create a scrollable container for long code blocks.",
    badge: "maxHeight",
    demoCode: `// A long file with many lines
function line1() { return 1; }
function line2() { return 2; }
function line3() { return 3; }
function line4() { return 4; }
function line5() { return 5; }
function line6() { return 6; }
function line7() { return 7; }
function line8() { return 8; }
function line9() { return 9; }
function line10() { return 10; }
function line11() { return 11; }
function line12() { return 12; }
function line13() { return 13; }
function line14() { return 14; }
function line15() { return 15; }`,
    demoLanguage: "javascript",
    demoProps: { maxHeight: "200px", showLineNumbers: true, title: "long-file.js" },
    code: `<DisplayCode
  code={code}
  language="javascript"
  maxHeight="200px"
  showLineNumbers={true}
  title="long-file.js"
/>`,
  },
  {
    id: "language-label",
    title: "Language Label",
    description: "Show a language badge in the header with showLanguageLabel.",
    badge: "showLanguageLabel",
    demoCode: `SELECT u.name, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at > '2025-01-01'
GROUP BY u.id
ORDER BY order_count DESC;`,
    demoLanguage: "sql",
    demoProps: { showLanguageLabel: true, showLineNumbers: true, title: "top-users.sql" },
    code: `<DisplayCode
  code={code}
  language="sql"
  showLanguageLabel={true}
  showLineNumbers={true}
  title="top-users.sql"
/>`,
  },
  {
    id: "custom-languages",
    title: "Custom Language Definitions",
    description: "Define your own language with custom keywords and highlighting rules via the languages prop.",
    badge: "custom",
    demoCode: `type User {
  id: ID!
  name: String!
  email: String
  role: Role
}

type Query {
  user(id: ID!): User
  users: [User]
}`,
    demoLanguage: "graphql",
    demoProps: {
      showLineNumbers: true,
      title: "schema.graphql",
      languages: {
        graphql: {
          name: "GraphQL",
          extensions: [".graphql"],
          keywords: ["type", "Query", "Mutation", "ID", "String", "Int", "Boolean"],
          rules: [
            { pattern: /\b(type|Query|Mutation|ID|String|Int|Boolean)\b/g, className: "keyword" },
            { pattern: /\b[A-Z][a-zA-Z0-9]*\b/g, className: "class-name" },
            { pattern: /![\s]/g, className: "operator" },
          ],
        },
      },
    },
    code: `import { DisplayCode } from '@asafarim/display-code';

const graphqlDef = {
  name: 'GraphQL',
  extensions: ['.graphql'],
  keywords: ['type', 'Query', 'Mutation', 'ID', 'String', 'Int', 'Boolean'],
  rules: [
    { pattern: /\\b(type|Query|Mutation|ID|String|Int|Boolean)\\b/g, className: 'keyword' },
    { pattern: /\\b[A-Z][a-zA-Z0-9]*\\b/g, className: 'class-name' },
    { pattern: /![\\s]/g, className: 'operator' },
  ],
};

<DisplayCode
  code={code}
  language="graphql"
  languages={{ graphql: graphqlDef }}
  showLineNumbers={true}
  title="schema.graphql"
/>`,
  },
  {
    id: "python",
    title: "Python with Triple-Quoted Strings",
    description: "Multiline constructs like triple-quoted strings and block comments are preserved across lines.",
    badge: "multiline",
    demoCode: `def calculate_fibonacci(n):
    """Calculate the nth Fibonacci number.
    
    Uses memoization for efficiency.
    Returns 0 for n <= 0.
    """
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    return calculate_fibonacci(n - 1) + calculate_fibonacci(n - 2)`,
    demoLanguage: "python",
    demoProps: { showLineNumbers: true, showCopyButton: true, title: "fibonacci.py" },
    code: `<DisplayCode
  code={code}
  language="python"
  showLineNumbers={true}
  showCopyButton={true}
  title="fibonacci.py"
/>`,
  },
  {
    id: "jsx",
    title: "JSX / TSX Support",
    description: "Full JSX and TSX syntax highlighting with component tags and expressions.",
    badge: "jsx",
    demoCode: `import React, { useState } from 'react';

interface CounterProps {
  initial?: number;
}

export function Counter({ initial = 0 }: CounterProps) {
  const [count, setCount] = useState(initial);
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}`,
    demoLanguage: "tsx",
    demoProps: { showLineNumbers: true, showCopyButton: true, title: "Counter.tsx" },
    code: `<DisplayCode
  code={code}
  language="tsx"
  showLineNumbers={true}
  showCopyButton={true}
  title="Counter.tsx"
/>`,
  },
  {
    id: "css",
    title: "CSS with Custom Properties",
    description: "CSS highlighting includes selectors, properties, values, and at-rules.",
    badge: "css",
    demoCode: `:root {
  --primary: #3b82f6;
  --radius: 8px;
  --transition: transform 0.2s ease;
}

.button {
  background: var(--primary);
  border-radius: var(--radius);
  padding: 0.5rem 1rem;
  transition: var(--transition);
}

.button:hover {
  transform: translateY(-2px);
}`,
    demoLanguage: "css",
    demoProps: { showLineNumbers: true, title: "button.css" },
    code: `<DisplayCode
  code={code}
  language="css"
  showLineNumbers={true}
  title="button.css"
/>`,
  },
  {
    id: "json",
    title: "JSON Data",
    description: "JSON highlighting with keys, strings, numbers, and booleans.",
    badge: "json",
    demoCode: `{
  "name": "@asafarim/display-code",
  "version": "1.2.0",
  "description": "Beautiful syntax-highlighted code blocks",
  "keywords": ["react", "syntax-highlighting", "code"],
  "license": "MIT",
  "peerDependencies": {
    "react": ">=17"
  }
}`,
    demoLanguage: "json",
    demoProps: { showLineNumbers: true, showCopyButton: true, title: "package.json" },
    code: `<DisplayCode
  code={code}
  language="json"
  showLineNumbers={true}
  showCopyButton={true}
  title="package.json"
/>`,
  },
  {
    id: "bash",
    title: "Bash Scripts",
    description: "Shell scripts with comments, variables, and keywords.",
    badge: "bash",
    demoCode: `#!/bin/bash
# Deploy script for display-code
set -e

PROJECT_NAME="display-code"
VERSION=$(node -p "require('./package.json').version")

echo "Building $PROJECT_NAME v$VERSION..."
pnpm build
echo "Done! Output in dist/"`,
    demoLanguage: "bash",
    demoProps: { showLineNumbers: true, title: "deploy.sh" },
    code: `<DisplayCode
  code={code}
  language="bash"
  showLineNumbers={true}
  title="deploy.sh"
/>`,
  },
  {
    id: "on-copy",
    title: "Copy Callback",
    description: "Use onCopy to react when users copy code — track analytics, show a toast, etc.",
    badge: "onCopy",
    demoCode: `const secret = "sk-1234-5678-abcd";
console.log("API key loaded");`,
    demoLanguage: "javascript",
    demoProps: {
      showCopyButton: true,
      showLineNumbers: true,
      title: "config.js",
      onCopy: (_code: string) => { /* callback */ },
    },
    code: `<DisplayCode
  code={code}
  language="javascript"
  showCopyButton={true}
  showLineNumbers={true}
  title="config.js"
  onCopy={(code) => {
    console.log("Copied", code.length, "chars");
    // trackEvent('code_copied', { length: code.length });
  }}
/>`,
  },
  {
    id: "no-line-numbers",
    title: "Minimal — No Line Numbers",
    description: "A clean, minimal look with no line numbers, no title, just code.",
    badge: "minimal",
    demoCode: `const x = 42;
const y = "hello";
console.log(x, y);`,
    demoLanguage: "javascript",
    demoProps: { showLineNumbers: false, showCopyButton: false },
    code: `<DisplayCode
  code={code}
  language="javascript"
  showLineNumbers={false}
  showCopyButton={false}
/>`,
  },
];

// ─── Page component ───────────────────────────────────────────────────────

export function HowToPage() {
  const { currentTheme } = useTheme();
  const isDark = currentTheme.mode === "dark";

  return (
    <div className={`howto-page ${isDark ? "dark-theme" : ""}`}>
      <header className="howto-header">
        <h1 className="howto-title">How to Use DisplayCode</h1>
        <p className="howto-subtitle">
          A complete guide to installing and using{" "}
          <code>@asafarim/display-code</code>. Click the{" "}
          <span className="howto-inline-icon">
            <EyeIcon open={false} />
          </span>{" "}
          icon on any example to reveal its source code, then{" "}
          <span className="howto-inline-icon">
            <CopyIcon copied={false} />
          </span>{" "}
          to copy it.
        </p>
      </header>

      <InstallSection isDark={isDark} />

      <section className="howto-section">
        <h2 className="howto-section__title">🎨 Use Cases</h2>
        <p className="howto-section__lead">
          Every prop and feature, demonstrated with live examples. Toggle the
          source code for any card to see exactly how it's done.
        </p>
        <div className="howto-grid">
          {USE_CASES.map((uc) => (
            <UseCaseCard key={uc.id} useCase={uc} isDark={isDark} />
          ))}
        </div>
      </section>

      <section className="howto-section">
        <h2 className="howto-section__title">📋 Props Reference</h2>
        <p className="howto-section__lead">
          The full set of props accepted by the <code>DisplayCode</code> component:
        </p>
        <div className="howto-card">
          <DisplayCode
            code={`interface DisplayCodeProps {
  code: string;                              // The code to display
  language?: string;                         // Language for syntax highlighting
  languages?: Record<string, LanguageDefinition>; // Custom language definitions
  theme?: 'light' | 'dark' | 'auto';        // Color theme
  showLineNumbers?: boolean;                 // Show line numbers (default: false)
  showCopyButton?: boolean;                  // Show copy-to-clipboard button
  title?: string;                            // Header title for the code block
  maxHeight?: string;                        // Max height before scrolling (e.g. "400px")
  wrapLines?: boolean;                       // Wrap long lines instead of scrolling
  className?: string;                        // Custom CSS class for the container
  onCopy?: (code: string) => void;           // Callback when code is copied
  fontSize?: 'small' | 'medium' | 'large';  // Font size for the code
  highlightLines?: number[];                 // Line numbers to highlight
  startLineNumber?: number;                  // Starting line number (default: 1)
  tabSize?: number;                          // Tab size in spaces (default: 2)
  showLanguageLabel?: boolean;               // Show language badge in header
}`}
            language="typescript"
            theme={isDark ? "dark" : "light"}
            showLineNumbers={true}
            showCopyButton={true}
            fontSize="small"
            title="DisplayCodeProps"
          />
        </div>
      </section>
    </div>
  );
}
