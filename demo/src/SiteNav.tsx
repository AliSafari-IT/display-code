import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ThemeToggle, useTheme } from "@asafarim/react-themes";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/how-to", label: "How To" },
  { to: "/roadmap", label: "Roadmap" },
];

export function SiteNav() {
  const { pathname } = useLocation();
  const { currentTheme } = useTheme();
  const isDark = currentTheme.mode === "dark";
  const [menuOpen, setMenuOpen] = useState(false);

  function isActive(to: string) {
    return to === "/" ? pathname === "/" : pathname.startsWith(to);
  }

  return (
    <nav className={`site-nav${isDark ? " site-nav--dark" : ""}`}>
      <Link to="/" className="site-nav__brand" aria-label="Home">
        <span className="site-nav__logo">{"</>"}</span>
        <span className="site-nav__name">@asafarim/display-code</span>
      </Link>

      <ul
        className={`site-nav__links${menuOpen ? " site-nav__links--open" : ""}`}
        role="list"
      >
        {NAV_LINKS.map(({ to, label }) => (
          <li key={to}>
            <Link
              to={to}
              className={`site-nav__link${
                isActive(to) ? " site-nav__link--active" : ""
              }`}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="site-nav__actions">
        <ThemeToggle
          showLabels
          style={{
            border: "1px solid #ccc",
            background: "transparent",
            borderRadius: "5px",
            padding: "0.5rem",
            cursor: "pointer",
          }}
        />
        <a
          href="https://github.com/AliSafari-IT/display-code"
          target="_blank"
          rel="noopener noreferrer"
          className="site-nav__github"
          aria-label="GitHub repository"
        >
          <svg
            viewBox="0 0 16 16"
            width="18"
            height="18"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          GitHub
        </a>
        <a
          href="https://www.npmjs.com/package/@asafarim/display-code"
          target="_blank"
          rel="noopener noreferrer"
          className="site-nav__npm"
        >
          npm
        </a>
        <button
          type="button"
          className="site-nav__menu-toggle"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span aria-hidden="true">{menuOpen ? "×" : "☰"}</span>
        </button>
      </div>
    </nav>
  );
}
