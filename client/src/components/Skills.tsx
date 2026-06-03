import React from "react";
import type { PortfolioData } from "../types";

interface SkillsProps {
  data: PortfolioData["skills"];
}

export const Skills: React.FC<SkillsProps> = React.memo(({ data }) => {
  const delayClasses = [
    "reveal-right",
    "reveal-right reveal-delay-1",
    "reveal-right reveal-delay-2",
  ];

  return (
    <section id="skills" className="section-shell px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-7">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 lg:mb-4 reveal reveal-left">
          <span className="section-kicker">{data.kicker}</span>
          <h2 className="section-title text-neutral-900 dark:text-white">
            {data.title}
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 sm:gap-5 lg:gap-3">
          {data.categories.map((category, idx) => (
            <article
              key={idx}
              className={`skill-card tilt-card h-full glass-panel reveal rounded-2xl p-6 sm:p-7 lg:p-5 ${delayClasses[idx % 3]}`}
            >
              <h3 className="font-title text-xl font-bold text-neutral-900 dark:text-white">
                {category.name}
              </h3>
              <ul className="mt-5 lg:mt-4 flex flex-wrap gap-2.5 lg:gap-2 text-xs text-neutral-600 dark:text-white/70">
                {category.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="glass-chip">
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
});
