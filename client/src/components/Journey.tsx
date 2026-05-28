import React from "react";
import type { PortfolioData } from "../types";

interface JourneyProps {
  data: PortfolioData["journey"];
}

export const Journey: React.FC<JourneyProps> = React.memo(({ data }) => {
  return (
    <section id="journey" className="section-shell px-4 py-7 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-2">
        {/* Education Timeline */}
        <article
          id="education"
          className="glass-panel reveal reveal-up rounded-2xl p-5 sm:p-6"
        >
          <span className="section-kicker">{data.education.kicker}</span>
          <div className="timeline mt-5">
            {data.education.items.map((item, idx) => (
              <div key={idx} className="timeline-item">
                <span>{item.period}</span>
                <h3 className="text-neutral-900 dark:text-white">{item.title}</h3>
                <p>{item.subtitle}</p>
              </div>
            ))}
          </div>
        </article>

        {/* Experience Timeline */}
        <article
          id="experience"
          className="glass-panel reveal reveal-up reveal-delay-1 rounded-2xl p-5 sm:p-6"
        >
          <span className="section-kicker">{data.experience.kicker}</span>
          <div className="timeline mt-5">
            {data.experience.items.map((item, idx) => (
              <div key={idx} className="timeline-item">
                <span>{item.period}</span>
                <h3 className="text-neutral-900 dark:text-white">{item.title}</h3>
                <p>{item.subtitle}</p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
});
