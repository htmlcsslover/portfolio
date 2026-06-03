import React, { useState, useEffect } from "react";
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

    // Check prefers-reduced-motion
    useEffect(() => {
      const media = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReducedMotion(media.matches);
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
      let timerId: any = null;

      const typeLoop = () => {
        const phrase = data.typingPhrases[phraseIndex];

        if (!deleting) {
          setTypingText(phrase.slice(0, charIndex + 1));
          charIndex++;

          if (charIndex === phrase.length) {
            deleting = true;
            timerId = setTimeout(typeLoop, 1200); // pause at end of typing
          } else {
            timerId = setTimeout(typeLoop, 78);
          }
        } else {
          setTypingText(phrase.slice(0, charIndex - 1));
          charIndex--;

          if (charIndex === 0) {
            deleting = false;
            phraseIndex = (phraseIndex + 1) % data.typingPhrases.length;
            timerId = setTimeout(typeLoop, 400); // pause after deleting
          } else {
            timerId = setTimeout(typeLoop, 42);
          }
        }
      };

      timerId = setTimeout(typeLoop, 500);

      return () => clearTimeout(timerId);
    }, [data.typingPhrases, reducedMotion]);

    // Scroll Down Action
    const handleScrollDown = () => {
      const target = document.getElementById("discovery");
      if (target) {
        scrollToElement(target);
      }
    };

    return (
      <section
        id="home"
      className="relative min-h-screen px-4 pb-12 pt-28 sm:px-6 lg:px-8 flex items-center justify-center"
      >
        <div className="mx-auto grid max-w-5xl w-full items-center gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left Side: About details and CTAs */}
          <article className="hero-glass glass-panel reveal relative rounded-2xl p-5 sm:p-6 lg:p-7 flex flex-col justify-between">
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

              <h1 className="font-title text-[clamp(2.25rem,6.5vw,4.25rem)] font-extrabold leading-[0.95] tracking-tight text-neutral-900 dark:text-white">
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

            <div className="action-row glass-panel mt-6 flex w-full flex-wrap items-center justify-evenly gap-4 rounded-xl p-2 sm:gap-6">
              <a
                className="cta-primary focus-ring"
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  const target = document.getElementById("contact");
                  if (target) scrollToElement(target);
                }}
              >
                Contact Me
              </a>
              <a
                className="cta-secondary focus-ring"
                href={data.socialLinks.linkedin}
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
              <a
                className="cta-secondary focus-ring"
                href={data.socialLinks.github}
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
            </div>
          </article>

          {/* Right Side: Portrait and Canvas Animation */}
          <aside className="reveal relative mx-auto w-full max-w-[18rem] lg:max-w-[18rem]">
            <div className="portrait-shell glass-panel relative mx-auto aspect-[0.92] rounded-2xl p-4">
              <div className="portrait-media">
                {/* Profile image with crop values matching native sizing */}
                <img
                  id="hero-image"
                  ref={heroImageRef}
                  src={
                    portraitIsDark
                      ? "/images/darkMode.png"
                      : "/images/lightMode.png"
                  }
                  data-light-scale="1.335"
                  data-dark-scale="1.335"
                  data-light-position="center -25%"
                  data-dark-position="center -22%"
                  alt="Raphael Portrait"
                  loading="eager"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    transform: "scale(1.335)",
                    objectPosition: "center -25%",
                    transition: "opacity 260ms ease, transform 260ms ease",
                  }}
                />

                {/* Canvas Overlay for preloaded transition frames */}
                {/* NOTE: Tweak transition zoom/crop here:
                  - To zoom in/out, change "data-frame-light-scale" and "data-frame-dark-scale" (e.g., "1.335" to zoom in).
                  - To change crop position, change "data-frame-light-position" and "data-frame-dark-position" (e.g., "center -25%").
              */}
                <canvas
                  id="transition-canvas"
                  ref={canvasRef}
                  data-frame-light-scale="1"
                  data-frame-dark-scale="1"
                  data-frame-light-position="center 14.78%"
                  data-frame-dark-position="center 14.88%"
                  className="absolute inset-0 w-full h-full opacity-0 pointer-events-none object-cover"
                  style={{ visibility: "hidden" }}
                />
              </div>
              <div className="portrait-shine" aria-hidden="true"></div>
            </div>

            <div className="current-lane-badge glass-panel rounded-xl p-3 text-center">
              <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 dark:text-white/50">
                Current lane
              </p>
              <p className="mt-1 font-title text-lg font-bold text-neutral-900 dark:text-white">
                {data.currentLane}
              </p>
            </div>
          </aside>
        </div>

        {/* Down arrow triggers section scroll */}
        <button
          id="scroll-arrow"
          className={`scroll-arrow focus-ring ${showArrow ? "" : "hidden-arrow"}`}
          type="button"
          aria-label="Scroll to Discovery"
          onClick={handleScrollDown}
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="m6 9 6 6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </section>
    );
  },
);
