import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import type { PortfolioData, Project } from "../types";

interface ProjectsProps {
  data: PortfolioData["projects"];
}

export const Projects: React.FC<ProjectsProps> = React.memo(({ data }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);

  // Lock scroll when modal is open
  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedProject]);

  const handleViewDetails = (project: Project) => {
    setSelectedProject(project);
    setCurrentIdx(0);
  };

  const handleClose = () => {
    setSelectedProject(null);
  };

  const handleNext = useCallback(() => {
    if (!selectedProject) return;
    setCurrentIdx((prev) => (prev + 1) % selectedProject.screenshots.length);
  }, [selectedProject]);

  const handlePrev = useCallback(() => {
    if (!selectedProject) return;
    setCurrentIdx((prev) =>
      prev === 0 ? selectedProject.screenshots.length - 1 : prev - 1,
    );
  }, [selectedProject]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedProject) return;
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedProject, handleNext, handlePrev]);

  return (
    <section id="projects" className="section-shell px-5 py-12 sm:py-20 lg:px-8 lg:py-7">
      <div className="mx-auto max-w-5xl">
        {/* Navigation & Header Section */}
        <div className="mb-10 flex flex-col reveal reveal-up lg:mb-8">
          {/* Back Button - Aligned Left */}
          <Link 
            to="/" 
            className="cta-secondary self-start inline-flex items-center gap-2 mb-8 focus-ring text-xs lg:mb-6"
          >
            ← Back to Home
          </Link>
          
          <div className="flex flex-col">
            {/* Title - Centered Horizontally */}
            <h2 className="section-title text-center text-neutral-900 dark:text-white max-w-3xl mx-auto">
              {data.title}
            </h2>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {data.items.map((project, idx) => (
            <div
              key={idx}
              className="reveal reveal-up h-full"
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              <article
                className="glass-panel tilt-card h-full rounded-2xl overflow-hidden flex flex-col transition-transform duration-300"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover object-top scale-115 transition-transform duration-500 hover:scale-135"
                  />
                </div>
                <div className="p-6 flex flex-col flex-grow sm:p-7 lg:p-5">
                  <h3 className="font-title text-xl font-bold text-neutral-900 dark:text-white mb-2 leading-tight">
                    {project.title}
                  </h3>
                  <p className="text-xs leading-5 text-neutral-600 dark:text-white/70 mb-5 line-clamp-3">
                    {project.description}
                  </p>
                  
                  {/* Tech Stack Chips */}
                  <div className="flex flex-wrap gap-2 mb-8 lg:mb-6">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="glass-chip text-[10px] px-2.5 py-1 font-bold tracking-wide lg:px-2 lg:py-0.5 lg:font-normal"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto">
                    <button
                      onClick={() => handleViewDetails(project)}
                      className="cta-secondary text-center w-full focus-ring py-3 lg:py-2"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>

      {/* Gallery Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-neutral-950/95 backdrop-blur-2xl transition-opacity duration-300"
            onClick={handleClose}
          />

          {/* Modal Content - Optimized for Space */}
          <div className="glass-panel relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl p-5 md:p-10 lg:p-7 flex flex-col gap-5 md:gap-10 shadow-2xl reveal-up is-visible lg:gap-8 lg:rounded-2xl">
            
            {/* 1. Title */}
            <div className="order-1">
              <h3 className="font-title text-xl sm:text-2xl md:text-4xl font-extrabold text-neutral-900 dark:text-white leading-tight lg:text-3xl">
                {selectedProject.title}
              </h3>
            </div>

            {/* 2. Gallery (Screenshot + Thumbs) */}
            <div className="order-2 md:order-4 flex flex-col gap-5 md:gap-8 lg:gap-6">
              <div className="relative flex items-center justify-center gap-4 sm:gap-6">
                {/* Desktop Nav Arrows */}
                <button
                  onClick={handlePrev}
                  className="glass-panel hidden sm:flex p-4 rounded-full hover:bg-white/10 transition-all hover:scale-110 focus-ring shrink-0 lg:p-3"
                  aria-label="Previous screenshot"
                >
                  <ChevronLeft
                    size={28}
                    className="text-neutral-900 dark:text-white lg:size-24"
                  />
                </button>

                {/* Main Screenshot Container */}
                <div className="relative aspect-video w-full max-w-4xl rounded-xl md:rounded-2xl overflow-hidden glass-panel shadow-2xl">
                  <img
                    src={selectedProject.screenshots[currentIdx]}
                    alt={`${selectedProject.title} screenshot ${currentIdx + 1}`}
                    className="w-full h-full object-cover transition-all duration-700"
                    key={currentIdx}
                  />

                  {/* Mobile Touch Area */}
                  <div className="absolute inset-0 flex sm:hidden">
                    <button onClick={handlePrev} className="w-1/2 h-full cursor-w-resize" />
                    <button onClick={handleNext} className="w-1/2 h-full cursor-e-resize" />
                  </div>
                </div>

                <button
                  onClick={handleNext}
                  className="glass-panel hidden sm:flex p-4 rounded-full hover:bg-white/10 transition-all hover:scale-110 focus-ring shrink-0 lg:p-3"
                  aria-label="Next screenshot"
                >
                  <ChevronRight
                    size={28}
                    className="text-neutral-900 dark:text-white lg:size-24"
                  />
                </button>
              </div>

              {/* Centered Controls Section */}
              <div className="flex flex-col items-center gap-4 md:gap-6 lg:gap-4">
                {/* Thumbnails */}
                <div className="flex justify-center w-full">
                  <div className="flex gap-2 md:gap-3 overflow-x-auto no-scrollbar scroll-smooth px-2 max-w-full lg:gap-2.5">
                    {selectedProject.screenshots.map((ss, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentIdx(idx)}
                        className={`w-12 h-8 sm:w-16 sm:h-11 md:w-20 md:h-14 rounded-lg md:rounded-xl overflow-hidden glass-panel border-2 transition-all duration-300 shrink-0 lg:w-12 lg:h-8 lg:rounded-md ${
                          currentIdx === idx
                            ? "border-accent-pink scale-110 shadow-xl shadow-accent-pink/30"
                            : "border-transparent opacity-30 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={ss}
                          className="w-full h-full object-cover"
                          alt="thumbnail"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Counter */}
                <div className="glass-chip px-5 py-1.5 md:px-6 md:py-2 text-[10px] md:text-xs font-black tracking-[0.15em] md:tracking-[0.2em] uppercase opacity-90 lg:px-4 lg:py-1.5 lg:font-bold lg:tracking-normal lg:normal-case">
                  {currentIdx + 1} / {selectedProject.screenshots.length}
                </div>
              </div>
            </div>

            {/* 3. Tech Stack */}
            <div className="order-3">
              <div className="flex flex-wrap gap-1.5 md:gap-2.5 lg:gap-2">
                {selectedProject.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="glass-chip text-[9px] md:text-xs px-2 py-0.5 md:px-4 md:py-1.5 font-bold md:font-black md:uppercase md:tracking-widest lg:px-3 lg:py-1 lg:font-semibold lg:tracking-normal lg:normal-case"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* 4. Description */}
            <div className="order-4 md:order-2">
              <p className="text-xs sm:text-sm leading-5 md:leading-7 text-neutral-600 dark:text-white/70 max-w-3xl lg:mt-2 lg:leading-6">
                {selectedProject.description}
              </p>
            </div>

            {/* 5. Live Link */}
            <div className="order-5 flex justify-center md:justify-start">
               <a 
                href={selectedProject.link}
                target="_blank"
                rel="noreferrer"
                className="cta-primary flex items-center gap-2 px-6 py-2.5 text-xs font-bold focus-ring group sm:px-8 sm:py-3 sm:text-sm"
              >
                Visit Site 
                <ExternalLink size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 sm:size-16" />
              </a>
            </div>

          </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
});
