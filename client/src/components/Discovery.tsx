import React from "react";
import type { PortfolioData } from "../types";

interface DiscoveryProps {
  data: PortfolioData["discovery"];
}

export const Discovery: React.FC<DiscoveryProps> = React.memo(({ data }) => {
  return (
    <section id="discovery" className="section-shell px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-7">
      <div className="mx-auto max-w-5xl">
        <article className="glass-panel tilt-card reveal reveal-left rounded-2xl p-6 sm:p-8 lg:p-7">
          <span className="section-kicker">{data.kicker}</span>
          <h2 className="section-title max-w-3xl text-neutral-900 dark:text-white">
            {data.title}
          </h2>
          <div className="mt-8 lg:mt-6 grid gap-6 lg:gap-5 text-xs leading-6 text-neutral-600 dark:text-white/70 md:grid-cols-2 md:text-sm md:leading-7 lg:leading-6">
            {data.paragraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
});
