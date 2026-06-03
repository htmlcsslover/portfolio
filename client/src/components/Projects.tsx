import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PortfolioData, Project } from "../types";

interface ProjectsProps {
  data: PortfolioData["projects"];
}

export const Projects: React.FC<ProjectsProps> = React.memo(({ data }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);

  // Lock scroll and hide navigation when modal is open
  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = "hidden";
      document.documentElement.classList.add("modal-active");
    } else {
      document.body.style.overflow = "unset";
      document.documentElement.classList.remove("modal-active");
    }
    return () => {
      document.body.style.overflow = "unset";
      document.documentElement.classList.remove("modal-active");
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
          <Link 
            to="/" 
            className="cta-secondary self-start inline-flex items-center gap-2 mb-10 focus-ring text-xs lg:mb-6"
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
                  <p className="text-xs leading-5 text-neutral-600 dark:text-white/70 mb-4 line-clamp-3">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="glass-chip text-[9px] px-2 py-0.5 border-neutral-200/10"
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
        <div className="fixed inset-0 z-[100] flex justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto items-start">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-neutral-950/95 backdrop-blur-2xl transition-opacity duration-300"
            onClick={handleClose}
          />

          {/* Modal Content - Decreased size to max-w-3xl */}
          <div className="glass-panel relative w-full max-w-3xl rounded-3xl p-5 md:p-8 lg:p-7 flex flex-col gap-6 md:gap-8 shadow-2xl reveal-up is-visible lg:gap-6 lg:rounded-2xl mt-4 md:mt-6 lg:mt-8">
            
            {/* Header Block */}
            <div className="flex flex-col gap-4">
              <h3 className="font-title text-2xl sm:text-3xl md:text-4xl font-extrabold text-neutral-900 dark:text-white leading-tight lg:text-3xl order-1">
                {selectedProject.title}
              </h3>
              
              <div className="flex flex-col gap-4 order-4 md:order-2">
                <p className="text-xs sm:text-sm leading-5 md:leading-6 text-neutral-600 dark:text-white/70 max-w-3xl">
                  {selectedProject.description}
                </p>
                <div className="flex flex-wrap gap-1.5 md:gap-2 lg:gap-2">
                  {selectedProject.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="glass-chip text-[9px] md:text-[10px] px-2.5 py-1 md:px-3 md:py-1 font-bold md:font-semibold"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Gallery Area */}
            <div className="order-2 md:order-4 flex flex-col gap-5 md:gap-6">
              <div className="relative group">
                {/* Border removed from screenshot container */}
                <div className="relative aspect-video w-full rounded-xl md:rounded-2xl overflow-hidden shadow-2xl mx-auto bg-neutral-900/50">
                  <img
                    src={selectedProject.screenshots[currentIdx]}
                    alt={`${selectedProject.title} screenshot ${currentIdx + 1}`}
                    className="w-full h-full object-contain transition-all duration-700"
                    key={currentIdx}
                  />

                  {/* Desktop Nav Arrows */}
                  <div className="hidden md:flex absolute inset-0 items-center justify-between px-4 pointer-events-none">
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                      className="glass-panel p-3 rounded-full hover:bg-white/10 transition-all hover:scale-110 focus-ring pointer-events-auto opacity-0 group-hover:opacity-100"
                      aria-label="Previous screenshot"
                    >
                      <ChevronLeft size={24} className="text-neutral-900 dark:text-white" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleNext(); }}
                      className="glass-panel p-3 rounded-full hover:bg-white/10 transition-all hover:scale-110 focus-ring pointer-events-auto opacity-0 group-hover:opacity-100"
                      aria-label="Next screenshot"
                    >
                      <ChevronRight size={24} className="text-neutral-900 dark:text-white" />
                    </button>
                  </div>

                  {/* Mobile Touch Navigation */}
                  <div className="absolute inset-0 flex md:hidden">
                    <button onClick={handlePrev} className="w-1/2 h-full cursor-w-resize" />
                    <button onClick={handleNext} className="w-1/2 h-full cursor-e-resize" />
                  </div>
                </div>
              </div>

              {/* Centered Controls Area */}
              <div className="flex flex-col items-center gap-4">
                <div className="flex justify-center w-full">
                  <div className="flex gap-2.5 md:gap-3 overflow-x-auto no-scrollbar scroll-smooth px-2 max-w-full">
                    {selectedProject.screenshots.map((ss, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentIdx(idx)}
                        className={`w-12 h-8 sm:w-16 sm:h-11 md:w-14 md:h-9 rounded-lg overflow-hidden border-2 transition-all duration-300 shrink-0 ${
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

                <div className="glass-chip px-5 py-1.5 md:px-4 md:py-1 text-[10px] md:text-[11px] font-black tracking-[0.15em] uppercase opacity-90">
                  {currentIdx + 1} / {selectedProject.screenshots.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Immersive Mode Styles */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .modal-active header,
        .modal-active footer {
          display: none !important;
        }
      `}</style>
    </section>
  );
});
