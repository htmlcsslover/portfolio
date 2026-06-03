import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { scrollToElement } from "../utils/smoothScroll";

interface HeaderProps {
  activeSection: string;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  heroImageRef: React.RefObject<HTMLImageElement | null>;
}

export const Header: React.FC<HeaderProps> = React.memo(({ activeSection, canvasRef, heroImageRef }) => {
  const { isDarkMode, toggleTheme, startPreloading } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: "Discovery", id: "discovery" },
    { label: "Education & Experience", id: "journey" },
    { label: "Connect", id: "contact" }
  ];

  const handleScroll = (e: React.MouseEvent, id: string) => {
    if (location.pathname === "/") {
      e.preventDefault();
      const target = document.getElementById(id);
      if (target) {
        scrollToElement(target);
        setMobileOpen(false);
      }
    } else {
      setMobileOpen(false);
    }
  };

  const handleToggle = () => {
    toggleTheme(canvasRef, heroImageRef);
  };

  return (
    <header className="fixed inset-x-0 top-3 z-50 px-4 sm:top-4">
      <nav
        className="glass-panel mx-auto flex max-w-5xl items-center justify-between gap-6 rounded-full px-4 py-5 text-xs uppercase tracking-[0.22em]"
        aria-label="Primary navigation"
      >
        <Link
          to="/"
          onClick={(e) => handleScroll(e, "home")}
          className="brand-mark focus-ring text-2xl "
          aria-label="Raphael home"
        >
          R
        </Link>

        {/* Desktop Links */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.id}
              className={`nav-link ${activeSection === link.id ? "active" : ""}`}
              to={`/#${link.id}`}
              onClick={(e) => handleScroll(e, link.id)}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Menu Toggle */}
          <button
            id="mobile-nav-toggle"
            className="menu-button focus-ring md:hidden"
            type="button"
            aria-controls="mobile-nav"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span aria-hidden="true"></span>
          </button>

          <button
            id="theme-toggle"
            className="theme-toggle focus-ring"
            type="button"
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            onMouseEnter={startPreloading}
            onTouchStart={startPreloading}
            onClick={handleToggle}
          >
            {isDarkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div id="mobile-nav" className="mx-auto mt-2 max-w-5xl md:hidden">
          <div className="glass-panel rounded-xl p-1.5 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                className={`mobile-nav-link ${activeSection === link.id ? "active" : ""}`}
                to={`/#${link.id}`}
                onClick={(e) => handleScroll(e, link.id)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
});
