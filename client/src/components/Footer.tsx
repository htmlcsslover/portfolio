import React from "react";
import type { PortfolioData } from "../types";

interface FooterProps {
  socials: PortfolioData["hero"]["socialLinks"];
}

export const Footer: React.FC<FooterProps> = React.memo(({ socials }) => {
  return (
    <footer className="relative px-5 pb-10 sm:px-6 sm:pb-12 lg:px-8 lg:pb-6 mt-auto">
      <div className="glass-panel mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 rounded-2xl px-6 py-8 text-xs uppercase tracking-[0.22em] text-neutral-500 dark:text-white/50 sm:flex-row sm:px-8 sm:py-6 lg:rounded-xl lg:px-4 lg:py-5">
        <p className="text-center sm:text-left">&copy; {new Date().getFullYear()} Raphael. All rights reserved.</p>
        <div className="flex gap-6 lg:gap-5">
          <a
            className="footer-link text-neutral-500 dark:text-white/50 hover:text-neutral-900 dark:hover:text-white focus-ring font-black lg:font-normal"
            href={socials.github}
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <a
            className="footer-link text-neutral-500 dark:text-white/50 hover:text-neutral-900 dark:hover:text-white focus-ring font-black lg:font-normal"
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
