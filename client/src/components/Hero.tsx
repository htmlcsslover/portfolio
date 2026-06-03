import React, { useState, useEffect } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { PortfolioData } from "../types";
import { useTheme } from "../context/ThemeContext";
import { scrollToElement } from "../utils/smoothScroll";

interface HeroProps {
  data: PortfolioData["hero"];
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  heroImageRef: React.RefObject<HTMLImageElement | null>;
  showArrow: boolean;
}

export const Hero: React.FC<HeroProps> = React.memo(
  ({ data, canvasRef, heroImageRef, showArrow }) => {
    const { portraitIsDark } = useTheme();
    const [typingText, setTypingText] = useState("");
    const [reducedMotion, setReducedMotion] = useState(false);

    // Check media queries
    useEffect(() => {
      const motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReducedMotion(motionMedia.matches);

      const motionListener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      motionMedia.addEventListener("change", motionListener);

      return () => {
        motionMedia.removeEventListener("change", motionListener);
      };
    }, []);

    // Typing Loop Animation
    useEffect(() => {
      if (reducedMotion) {
        setTypingText(data.typingPhrases[0]);
        return;
      }

      let phraseIndex = 0;
      let charIndex = 0;
      let deleting = false;
      let timerId: ReturnType<typeof setTimeout> | undefined;

      const typeLoop = () => {
        const phrase = data.typingPhrases[phraseIndex];

        if (!deleting) {
          setTypingText(phrase.slice(0, charIndex + 1));
          charIndex++;
          if (charIndex === phrase.length) {
            deleting = true;
            timerId = setTimeout(typeLoop, 1200);
          } else {
            timerId = setTimeout(typeLoop, 78);
          }
        } else {
          setTypingText(phrase.slice(0, charIndex - 1));
          charIndex--;
          if (charIndex === 0) {
            deleting = false;
            phraseIndex = (phraseIndex + 1) % data.typingPhrases.length;
            timerId = setTimeout(typeLoop, 400);
          } else {
            timerId = setTimeout(typeLoop, 42);
          }
        }
      };

      timerId = setTimeout(typeLoop, 500);
      return () => clearTimeout(timerId);
    }, [data.typingPhrases, reducedMotion]);

    const handleScrollDown = () => {
      const target = document.getElementById("discovery");
      if (target) {
        scrollToElement(target);
      }
    };

    return (
      <section
        id="home"
        className="relative min-h-screen px-5 pt-32 pb-16 sm:px-6 sm:pt-40 sm:pb-20 lg:px-8 lg:pt-0 lg:pb-0 flex flex-col items-center justify-center lg:flex-row"
      >
        <div className="mx-auto grid max-w-5xl w-full items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-6 flex-grow-0 lg:flex-grow">
          {/* Left Side: About details and CTAs */}
          <article className="hero-glass glass-panel tilt-card reveal relative rounded-2xl p-6 sm:p-8 lg:p-7 flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3">
                {data.badges.map((badge, idx) => (
                  <span key={idx} className="glass-chip">
                    {badge}
                  </span>
                ))}
              </div>

              <p className="min-h-7 text-xs font-semibold italic text-neutral-600 dark:text-white/70 sm:text-sm">
                <span>{typingText}</span>
                {!reducedMotion && <span className="typing-cursor">|</span>}
              </p>

              <h1 className="font-title text-[clamp(2.5rem,8vw,4.25rem)] lg:text-[clamp(2.25rem,6.5vw,4.25rem)] font-extrabold leading-[0.95] tracking-tight text-neutral-900 dark:text-white">
                {data.title.line1} {data.title.line2}
                <br />
                <span className="liquid-text">{data.title.highlight}</span>
              </h1>

              <div className="max-w-2xl space-y-2 text-xs leading-6 text-neutral-600 dark:text-white/70 sm:text-sm">
                {data.description.map((desc, idx) => (
                  <p key={idx}>{desc}</p>
                ))}
              </div>
            </div>

            <div className="action-row glass-panel mt-8 lg:mt-6 flex w-full flex-wrap items-center justify-evenly gap-4 rounded-xl p-2 sm:gap-6">
              <Link to="/#contact" className="cta-primary focus-ring">Contact Me</Link>
              <Link to="/projects" className="cta-secondary flex items-center gap-1.5 focus-ring">
                Projects <ArrowUpRight size={14} />
              </Link>
              <a className="cta-secondary focus-ring" href={data.socialLinks.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
              <a className="cta-secondary focus-ring" href={data.socialLinks.github} target="_blank" rel="noreferrer">GitHub</a>
            </div>
          </article>

          {/* Right Side: Portrait and Canvas Animation */}
          <aside className="reveal relative mx-auto w-full max-w-[18rem] lg:max-w-[18rem]">
            <div className="portrait-shell glass-panel relative mx-auto aspect-[0.92] rounded-2xl p-4 sm:p-5 lg:p-4">
              <div className="portrait-media">
                <img
                  id="hero-image"
                  ref={heroImageRef}
                  src={portraitIsDark ? "/images/darkMode.png" : "/images/lightMode.png"}
                  alt="Raphael Portrait"
                  loading="eager"
                  className="absolute inset-0 w-full h-full object-cover scale-[1.335]"
                  style={{ 
                    objectPosition: "center -25%", 
                    transition: "opacity 260ms ease, transform 260ms ease" 
                  }}
                  
                  /* 
                    DESKTOP VALUES (lg and above)
                    Changing these will modify the desktop case-study crop.
                  */
                  data-light-scale="1.335"
                  data-dark-scale="1.335"
                  data-light-position="center -25%"
                  data-dark-position="center -22%"

                  /* 
                    MOBILE VALUES (Below 1024px)
                    Adjust these to tune the mobile portrait without affecting desktop.
                  */
                  data-mobile-light-scale="1.335"
                  data-mobile-dark-scale="1.335"
                  data-mobile-light-position="center -25%"
                  data-mobile-dark-position="center -25%"
                />
                <canvas
                  id="transition-canvas"
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full opacity-0 pointer-events-none object-cover"
                  style={{ visibility: "hidden" }}

                  /* DESKTOP CANVAS MAPPING */
                  data-frame-light-scale="1"
                  data-frame-dark-scale="1"
                  data-frame-light-position="center 14.78%"
                  data-frame-dark-position="center 14.88%"

                  /* MOBILE CANVAS MAPPING */
                  data-mobile-frame-light-scale="1"
                  data-mobile-frame-dark-scale="1"
                  data-mobile-frame-light-position="center 14.78%"
                  data-mobile-frame-dark-position="center 14.78%"
                />
              </div>
              <div className="portrait-shine" aria-hidden="true"></div>
            </div>

            <div className="current-lane-badge glass-panel rounded-xl p-3 text-center mt-6 lg:mt-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 dark:text-white/50">
                Current lane
              </p>
              <p className="mt-1 font-title text-lg font-bold text-neutral-900 dark:text-white">
                {data.currentLane}
              </p>
            </div>
          </aside>
        </div>

        {/* Unified Responsive Down Arrow */}
        <button
          id="scroll-arrow"
          className={`scroll-arrow focus-ring !relative !left-0 !bottom-0 !translate-x-0 mx-auto mt-12 mb-8 lg:!absolute lg:!left-1/2 lg:!bottom-6 lg:!-translate-x-1/2 lg:mt-0 lg:mb-0 ${showArrow ? "" : "hidden-arrow"}`}
          type="button"
          aria-label="Scroll to Discovery"
          onClick={handleScrollDown}
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </section>
    );
  }
);
