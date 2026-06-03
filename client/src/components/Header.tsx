import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

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

  const handleToggle = () => {
    toggleTheme(canvasRef, heroImageRef);
  };

  const closeMobileMenu = () => setMobileOpen(false);

  // Active state logic for home sections
  const isHome = location.pathname === "/";

  return (
    <header className="fixed inset-x-0 top-3 z-50 px-5 sm:top-4 lg:px-6">
      <nav
        className="glass-panel mx-auto flex max-w-5xl items-center justify-between gap-6 rounded-full px-4 py-3 sm:py-5 text-xs uppercase tracking-[0.22em]"
        aria-label="Primary navigation"
      >
        <Link
          to="/#home"
          onClick={closeMobileMenu}
          className="brand-mark focus-ring text-2xl !w-10 !h-10 !flex-none sm:!w-12 sm:!h-12"
          aria-label="Raphael home"
        >
          R
        </Link>

        {/* Desktop Links */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => {
            const isActive = isHome && activeSection === link.id;
            return (
              <Link
                key={link.id}
                className={`nav-link ${isActive ? "active" : ""}`}
                to={`/#${link.id}`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Menu Toggle */}
          <button
            id="mobile-nav-toggle"
            className="menu-button focus-ring md:hidden !w-10 !h-10"
            type="button"
            aria-controls="mobile-nav"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span aria-hidden="true"></span>
          </button>

          {/* Desktop-only Theme Toggle */}
          <button
            id="theme-toggle"
            className="theme-toggle focus-ring hidden md:inline-flex"
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
          <div className="glass-panel rounded-2xl p-2 flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive = isHome && activeSection === link.id;
              return (
                <Link
                  key={link.id}
                  className={`mobile-nav-link ${isActive ? "active" : ""}`}
                  to={`/#${link.id}`}
                  onClick={closeMobileMenu}
                >
                  {link.label}
                </Link>
              );
            })}
            
            {/* Mobile-only Theme Toggle at bottom of menu */}
            <button
              onClick={() => {
                handleToggle();
                closeMobileMenu();
              }}
              className="mobile-nav-link flex items-center justify-between mt-2 pt-2 border-t border-white/10"
            >
              <span>Switch to {isDarkMode ? "Light" : "Dark"} Mode</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
});
