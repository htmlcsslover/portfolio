import React from "react";
import type { PortfolioData } from "../types";

interface FooterProps {
  socials: PortfolioData["hero"]["socialLinks"];
}

export const Footer: React.FC<FooterProps> = React.memo(({ socials }) => {
  return (
    <footer className="px-4 pb-6 sm:px-6 lg:px-8">
      <div className="glass-panel mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 rounded-xl px-4 py-5 text-xs uppercase tracking-[0.22em] text-neutral-500 dark:text-white/50 sm:flex-row">
        <p>&copy; {new Date().getFullYear()} Raphael. All rights reserved.</p>
        <div className="flex gap-5">
          <a
            className="footer-link text-neutral-500 dark:text-white/50 hover:text-neutral-900 dark:hover:text-white focus-ring"
            href={socials.github}
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <a
            className="footer-link text-neutral-500 dark:text-white/50 hover:text-neutral-900 dark:hover:text-white focus-ring"
            href={socials.linkedin}
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
});
