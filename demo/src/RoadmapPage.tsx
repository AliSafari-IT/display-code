import { useEffect, useState } from "react";
import { DisplayCode } from "@asafarim/display-code";
import { useTheme } from "@asafarim/react-themes";

// ─── Types ────────────────────────────────────────────────────────────────

type RoadmapStatus = "released" | "current" | "planned" | "ideation";

type ChangelogCategory =
  | "feature"
  | "fix"
  | "improvement"
  | "security"
  | "breaking"
  | "docs";

interface DisplayCodeRoadmapItem {
  version: string;
  date: string;
  isoDate: string;
  status: RoadmapStatus;
  title: string;
  details: string[];
  icon: string;
  category: ChangelogCategory;
  tags: string[];
  proposedApi?: string;
  issueUrl?: string;
  issueNumber?: number;
  votes?: number;
}

// ─── Timeline data ────────────────────────────────────────────────────────
// Past releases (changelog) + future roadmap items linked to GitHub issues.

const displayCodeTimelineData: DisplayCodeRoadmapItem[] = [
  // ── History ────────────────────────────────────────────────────────────
  {
    version: "1.0.0",
    date: "July 2025",
    isoDate: "2025-07-14",
    status: "released",
    title: "Initial Release",
    details: [
      "Syntax highlighting for JavaScript, TypeScript, JSX, and Python",
      "Light / dark / auto theme support",
      "Copy-to-clipboard with visual feedback",
      "Line numbers and line highlighting",
    ],
    icon: "✅",
    category: "feature",
    tags: ["syntax-highlighting", "themes", "copy"],
  },
  {
    version: "1.1.0",
    date: "August 2025",
    isoDate: "2025-08-24",
    status: "released",
    title: "Expanded Language Support & Demo App",
    details: [
      "Added HTML, CSS, JSON, Markdown, Bash, Java, C++, SQL, YAML, XML",
      "Interactive demo with live controls",
      "GitHub Pages deployment",
    ],
    icon: "🚀",
    category: "feature",
    tags: ["languages", "demo", "gh-pages"],
  },
  {
    version: "1.2.0",
    date: "September 2026",
    isoDate: "2026-09-06",
    status: "current",
    title: "Unified Syntax-Highlighting Pipeline",
    details: [
      "Single tokenizer shared by DisplayCode and highlightCode utility",
      "Custom language definitions via `languages` prop",
      "SSR-safe escapeHtml (pure function, no DOM)",
      "Fixed className prop bug",
      "Added vitest test infrastructure (48 tests)",
    ],
    icon: "⚡",
    category: "improvement",
    tags: ["tokenizer", "custom-languages", "ssr", "testing"],
    proposedApi: `import { DisplayCode } from '@asafarim/display-code';

// Custom language definition
const graphqlDef = {
  name: 'GraphQL',
  extensions: ['.graphql'],
  keywords: ['type', 'query', 'mutation'],
  rules: [
    { pattern: /\\b(type|query|mutation)\\b/g, className: 'keyword' },
    { pattern: /\\b[A-Z][a-zA-Z0-9]*\\b/g, className: 'class-name' },
  ],
};

<DisplayCode
  code="type User { name: String }"
  language="graphql"
  languages={{ graphql: graphqlDef }}
/>`,
    issueUrl: "https://github.com/AliSafari-IT/display-code/issues/1",
    issueNumber: 1,
    votes: 0,
  },

  // ── Future roadmap (GitHub issues #2–#5) ────────────────────────────────
  {
    version: "1.3.0",
    date: "Planned",
    isoDate: "2026-10-01",
    status: "planned",
    title: "Custom Theme Tokens & Styling Hooks",
    details: [
      "CSS custom properties for all UI and syntax colors",
      "Typed themeTokens prop for per-instance customization",
      "Fix className prop and activate CSS Module",
      "WCAG AA contrast for default themes",
    ],
    icon: "🎨",
    category: "feature",
    tags: ["themes", "css-variables", "design-tokens", "styling"],
    proposedApi: `<DisplayCode
  code={source}
  theme="dark"
  themeTokens={{
    background: '#0d1117',
    keyword: '#ff7b72',
    string: '#a5d6ff',
  }}
  className="docs-code-block"
/>`,
    issueUrl: "https://github.com/AliSafari-IT/display-code/issues/2",
    issueNumber: 2,
    votes: 0,
  },
  {
    version: "1.4.0",
    date: "Planned",
    isoDate: "2026-11-01",
    status: "planned",
    title: "Interactive Line Selection & Deep Links",
    details: [
      "Click and keyboard selection of individual lines and ranges",
      "Controlled and uncontrolled selection state",
      "Instance-scoped line anchors with hash navigation",
      "Copy selected lines or all code",
    ],
    icon: "🔗",
    category: "feature",
    tags: ["selection", "deep-links", "accessibility", "copy"],
    proposedApi: `<DisplayCode
  id="auth-example"
  code={source}
  selectableLines
  selectedLines={[12, 13, 14]}
  onSelectionChange={setSelectedLines}
  enableLineAnchors
  copyMode="selected-or-all"
/>`,
    issueUrl: "https://github.com/AliSafari-IT/display-code/issues/3",
    issueNumber: 3,
    votes: 0,
  },
  {
    version: "1.5.0",
    date: "Planned",
    isoDate: "2026-12-01",
    status: "planned",
    title: "Virtualized Rendering for Large Code Blocks",
    details: [
      "Render only visible lines plus configurable overscan",
      "Automatic threshold-based virtualization",
      "Variable row height support for wrapped lines",
      "Preserve selection, anchors, and copy for off-screen lines",
    ],
    icon: "📊",
    category: "improvement",
    tags: ["performance", "virtualization", "large-files"],
    proposedApi: `<DisplayCode
  code={largeSource}
  virtualize="auto"
  virtualizationThreshold={500}
  overscanLines={10}
  maxHeight="600px"
/>`,
    issueUrl: "https://github.com/AliSafari-IT/display-code/issues/4",
    issueNumber: 4,
    votes: 0,
  },
  {
    version: "2.0.0",
    date: "Ideation",
    isoDate: "2027-01-01",
    status: "ideation",
    title: "Unified & Split Diff Views",
    details: [
      "DisplayCodeDiff component with unified and side-by-side layouts",
      "Intra-line change emphasis",
      "Collapsible unchanged regions",
      "Copy old source, new source, or generated patch",
      "Tree-shakable separate entry point",
    ],
    icon: "💡",
    category: "feature",
    tags: ["diff", "unified", "split", "changelog"],
    proposedApi: `import { DisplayCodeDiff } from '@asafarim/display-code/diff';

<DisplayCodeDiff
  oldCode={before}
  newCode={after}
  language="typescript"
  viewMode="split"
  collapseUnchanged
  contextLines={3}
/>`,
    issueUrl: "https://github.com/AliSafari-IT/display-code/issues/5",
    issueNumber: 5,
    votes: 0,
  },
];

// ─── Changelog timeline (past releases) ───────────────────────────────────

interface ChangelogEntry {
  id: string;
  version: string;
  date: string;
  category: ChangelogCategory;
  title: string;
  description: string;
  tags: string[];
}

function toChangelogEntry(item: DisplayCodeRoadmapItem): ChangelogEntry {
  return {
    id: `${item.version}-${item.status}-${item.title.replace(/\s+/g, "-")}`,
    version: item.version,
    date: item.isoDate,
    category: item.category,
    title: item.title,
    description: `${item.details.join(". ")}.`,
    tags: [item.status, ...item.tags],
  };
}

const categoryIcons: Record<ChangelogCategory, string> = {
  feature: "✨",
  fix: "🐛",
  improvement: "⚡",
  security: "🔒",
  breaking: "⚠️",
  docs: "📚",
};

const categoryColors: Record<ChangelogCategory, { bg: string; text: string; icon: string }> = {
  feature: { bg: "#e0f2fe", text: "#0369a1", icon: "#0284c7" },
  fix: { bg: "#fef2f2", text: "#b91c1c", icon: "#dc2626" },
  improvement: { bg: "#f0fdf4", text: "#15803d", icon: "#16a34a" },
  security: { bg: "#fffbeb", text: "#b45309", icon: "#d97706" },
  breaking: { bg: "#fef3c7", text: "#92400e", icon: "#f59e0b" },
  docs: { bg: "#f5f3ff", text: "#6d28d9", icon: "#7c3aed" },
};

function ChangelogTimeline({
  entries,
  title,
  subtitle,
  isDark,
}: {
  entries: ChangelogEntry[];
  title: string;
  subtitle: string;
  isDark: boolean;
}) {
  return (
    <div className="changelog-timeline changelog-timeline--left">
      <div className="timeline-header">
        <h2 className="timeline-title">{title}</h2>
        <p className="timeline-subtitle">{subtitle}</p>
      </div>
      <div className="timeline-container">
        <div className="timeline-line" />
        {entries.map((entry) => {
          const colors = categoryColors[entry.category];
          return (
            <div className="timeline-item" key={entry.id}>
              <div
                className="timeline-dot"
                style={{ borderColor: colors.icon }}
              />
              <div className="timeline-card">
                <div className="card-header">
                  <span className="category-icon">{categoryIcons[entry.category]}</span>
                  <div className="card-content">
                    <h3 className="card-title">{entry.title}</h3>
                    <div className="card-meta">
                      <span
                        className="category-label"
                        style={{
                          background: colors.bg,
                          color: colors.text,
                        }}
                      >
                        {entry.category}
                      </span>
                      <span className="card-version">v{entry.version}</span>
                      <span aria-hidden="true">•</span>
                      <span>
                        {new Date(entry.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="card-description">{entry.description}</p>
                    <div className="card-tags">
                      {entry.tags.map((tag) => (
                        <span className="tag" key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Roadmap list (future items with GitHub issue integration) ────────────

type GitHubIssue = {
  reactions?: {
    "+1"?: number;
  };
};

const GITHUB_API_BASE =
  "https://api.github.com/repos/AliSafari-IT/display-code/issues";

function RoadmapList({
  items,
  isDark,
}: {
  items: DisplayCodeRoadmapItem[];
  isDark: boolean;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, number>>(() =>
    Object.fromEntries(items.map((i) => [i.version, i.votes ?? 0]))
  );

  useEffect(() => {
    let cancelled = false;

    Promise.all(
      items
        .filter((item) => item.issueNumber)
        .map(async (item) => {
          const response = await fetch(`${GITHUB_API_BASE}/${item.issueNumber}`);
          if (!response.ok) {
            throw new Error(`GitHub returned ${response.status}`);
          }
          const issue = (await response.json()) as GitHubIssue;
          return [item.version, issue.reactions?.["+1"] ?? 0] as const;
        })
    )
      .then((reactionCounts) => {
        if (!cancelled) {
          setVotes((current) => ({
            ...current,
            ...Object.fromEntries(reactionCounts),
          }));
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [items]);

  function toggle(version: string) {
    setOpen((current) => (current === version ? null : version));
  }

  return (
    <div className="roadmap-list">
      {items.map((item, index) => {
        const isOpen = open === item.version;
        const isLast = index === items.length - 1;

        return (
          <div
            key={item.version}
            className={`roadmap-item roadmap-item--${item.status}`}
          >
            <div className="roadmap-item__track">
              <span className="roadmap-item__dot" aria-hidden="true">
                {item.icon}
              </span>
              {!isLast && <div className="roadmap-item__line" aria-hidden="true" />}
            </div>

            <div className="roadmap-item__body">
              <button
                type="button"
                className="roadmap-item__summary"
                onClick={() => toggle(item.version)}
                aria-expanded={isOpen}
              >
                <span className="roadmap-item__version">v{item.version}</span>
                <span className="roadmap-item__date">{item.date}</span>
                <span
                  className={`roadmap-item__status roadmap-item__status--${item.status}`}
                >
                  {item.status}
                </span>
                <h3 className="roadmap-item__title">{item.title}</h3>
              </button>

              <div className="roadmap-item__details">
                <ul>
                  {item.details.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </div>

              {isOpen && (
                <div className="roadmap-item__preview">
                  {item.proposedApi && (
                    <DisplayCode
                      code={item.proposedApi}
                      language="tsx"
                      theme={isDark ? "dark" : "light"}
                      showLineNumbers={false}
                      showCopyButton={true}
                      fontSize="small"
                      maxHeight="300px"
                    />
                  )}
                  {item.issueUrl && (
                    <a
                      href={item.issueUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="roadmap-issue"
                    >
                      Discuss on GitHub ↗
                    </a>
                  )}
                  {item.issueUrl && (
                    <a
                      href={item.issueUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="roadmap-vote-btn"
                    >
                      Vote on GitHub (+1) ({votes[item.version] ?? 0})
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Page component ───────────────────────────────────────────────────────

export function RoadmapPage() {
  const { currentTheme } = useTheme();
  const isDark = currentTheme.mode === "dark";
  const [view, setView] = useState<"history" | "roadmap" | "all">("all");

  const history = displayCodeTimelineData.filter(
    (i) => i.status === "released" || i.status === "current"
  );
  const future = displayCodeTimelineData.filter(
    (i) => i.status === "planned" || i.status === "ideation"
  );

  return (
    <div className={`roadmap-page ${isDark ? "dark-theme" : ""}`}>
      <header className="roadmap-header">
        <h1 className="roadmap-title">DisplayCode journey</h1>
        <p className="roadmap-subtitle">
          A continuous view of where{" "}
          <code>@asafarim/display-code</code> has been and where it is heading.
        </p>
      </header>

      <div className="roadmap-toggle" role="group" aria-label="Timeline view">
        {(["history", "roadmap", "all"] as const).map((v) => (
          <button
            key={v}
            type="button"
            className={`roadmap-toggle__btn${
              view === v ? " roadmap-toggle__btn--active" : ""
            }`}
            onClick={() => setView(v)}
            aria-pressed={view === v}
          >
            {v === "history"
              ? "View History (Changelog)"
              : v === "roadmap"
              ? "View Future (Roadmap)"
              : "View All"}
          </button>
        ))}
      </div>

      <div className={`roadmap-columns roadmap-columns--${view}`}>
        {view !== "roadmap" && (
          <section className="roadmap-section roadmap-section--history">
            <ChangelogTimeline
              entries={history.map(toChangelogEntry)}
              title="Changelog"
              subtitle="Shipped updates for @asafarim/display-code"
              isDark={isDark}
            />
          </section>
        )}

        {view !== "history" && (
          <section className="roadmap-section roadmap-section--future">
            <h2 className="roadmap-section__title">Roadmap</h2>
            <RoadmapList items={future} isDark={isDark} />
          </section>
        )}
      </div>
    </div>
  );
}
