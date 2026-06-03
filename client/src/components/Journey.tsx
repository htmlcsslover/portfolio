import React from "react";
import type { PortfolioData } from "../types";

interface JourneyProps {
  data: PortfolioData["journey"];
}

export const Journey: React.FC<JourneyProps> = React.memo(({ data }) => {
  return (
    <section id="journey" className="section-shell px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-7">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2 lg:gap-4">
        {/* Education Timeline */}
        <article
          id="education"
          className="glass-panel tilt-card reveal reveal-up rounded-2xl p-6 sm:p-8 lg:p-5"
        >
          <span className="section-kicker">{data.education.kicker}</span>
          <div className="timeline mt-6 lg:mt-5">
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
          className="glass-panel tilt-card reveal reveal-up reveal-delay-1 rounded-2xl p-6 sm:p-8 lg:p-5"
        >
          <span className="section-kicker">{data.experience.kicker}</span>
          <div className="timeline mt-6 lg:mt-5">
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
