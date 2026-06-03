import React from "react";
import type { PortfolioData } from "../types";

interface ProjectsProps {
  data: PortfolioData["projects"];
}

export const Projects: React.FC<ProjectsProps> = React.memo(({ data }) => {
  return (
    <section id="projects" className="section-shell px-4 py-7 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 reveal reveal-left">
          <span className="section-kicker">{data.kicker}</span>
          <h2 className="section-title text-neutral-900 dark:text-white">
            {data.title}
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((project, idx) => (
            <article
              key={idx}
              className="glass-panel tilt-card reveal reveal-up rounded-2xl overflow-hidden flex flex-col"
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="font-title text-xl font-bold text-neutral-900 dark:text-white mb-2">
                  {project.title}
                </h3>
                <p className="text-xs leading-5 text-neutral-600 dark:text-white/70 mb-4 flex-grow">
                  {project.description}
                </p>
                <a
                  href={project.link}
                  className="cta-secondary text-center w-full"
                  target="_blank"
                  rel="noreferrer"
                >
                  View Details
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
});
