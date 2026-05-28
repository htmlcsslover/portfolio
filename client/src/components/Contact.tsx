import React from "react";
import type { PortfolioData } from "../types";

interface ContactProps {
  data: PortfolioData["contact"];
  socials: PortfolioData["hero"]["socialLinks"];
}

export const Contact: React.FC<ContactProps> = React.memo(({ data, socials }) => {
  return (
    <section id="contact" className="section-shell px-4 py-7 sm:px-6 lg:px-8 lg:pb-12">
      <div className="mx-auto max-w-5xl">
        <article className="glass-panel reveal reveal-up rounded-2xl p-5 sm:p-6 lg:p-7 text-center">
          <div className="reveal reveal-left flex flex-col items-center">
            <span className="section-kicker">{data.kicker}</span>
            <h2 className="section-title text-neutral-900 dark:text-white max-w-3xl">
              {data.title}
            </h2>
            <p className="mt-4 max-w-2xl text-xs leading-6 text-neutral-600 dark:text-white/70 sm:text-sm">
              {data.description}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              className="cta-primary magnetic focus-ring px-6 py-3 text-sm font-semibold"
              href={socials.linkedin}
              target="_blank"
              rel="noreferrer"
            >
              Connect on LinkedIn
            </a>
            <a
              className="cta-secondary magnetic focus-ring px-6 py-3 text-sm font-semibold"
              href={socials.github}
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </div>
        </article>
      </div>
    </section>
  );
});
