import React from "react";
import type { PortfolioData } from "../types";

interface DiscoveryProps {
  data: PortfolioData["discovery"];
}

export const Discovery: React.FC<DiscoveryProps> = React.memo(({ data }) => {
  return (
    <section id="discovery" className="section-shell px-4 py-7 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <article className="glass-panel reveal reveal-left rounded-2xl p-5 sm:p-6 lg:p-7">
          <span className="section-kicker">{data.kicker}</span>
          <h2 className="section-title max-w-3xl text-neutral-900 dark:text-white">
            {data.title}
          </h2>
          <div className="mt-6 flex flex-col gap-4 text-xs leading-6 text-neutral-600 dark:text-white/70 md:text-sm md:leading-6">
            {data.paragraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
});
