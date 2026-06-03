import { useEffect, useRef } from "react";

export const useInteractions = () => {
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion.current) return;

    let rafId: number;
    let lastTime = performance.now();

    const animateBackground = (now: number) => {
      if (now - lastTime >= 16) { // ~60fps
        const time = now / 1000;
        const root = document.documentElement;
        
        root.style.setProperty("--orb-1-x", `${15 + Math.sin(time * 0.12) * 10}%`);
        root.style.setProperty("--orb-1-y", `${12 + Math.cos(time * 0.1) * 8}%`);
        root.style.setProperty("--orb-2-x", `${82 + Math.cos(time * 0.09) * 9}%`);
        root.style.setProperty("--orb-2-y", `${4 + Math.sin(time * 0.11) * 10}%`);
        root.style.setProperty("--orb-3-x", `${60 + Math.sin(time * 0.07 + 1.8) * 13}%`);
        root.style.setProperty("--orb-3-y", `${78 + Math.cos(time * 0.08 + 0.7) * 9}%`);
        root.style.setProperty("--orb-4-x", `${20 + Math.cos(time * 0.1 + 2.4) * 12}%`);
        root.style.setProperty("--orb-4-y", `${88 + Math.sin(time * 0.06 + 1.2) * 7}%`);
        
        lastTime = now;
      }
      rafId = requestAnimationFrame(animateBackground);
    };

    rafId = requestAnimationFrame(animateBackground);

    const handlePointerMove = (e: PointerEvent) => {
      const panels = document.querySelectorAll(".glass-panel");
      panels.forEach((panel) => {
        const rect = (panel as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Optimized: only update if within reasonable distance or actually hovering
        if (
          e.clientX >= rect.left - 100 &&
          e.clientX <= rect.right + 100 &&
          e.clientY >= rect.top - 100 &&
          e.clientY <= rect.bottom + 100
        ) {
          (panel as HTMLElement).style.setProperty("--mouse-x", `${x}px`);
          (panel as HTMLElement).style.setProperty("--mouse-y", `${y}px`);
        }
      });

      const tiltCards = document.querySelectorAll(".tilt-card");
      tiltCards.forEach((card) => {
        const rect = (card as HTMLElement).getBoundingClientRect();
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          const intensity = 8; // High drama tilt
          (card as HTMLElement).style.transform = `perspective(1000px) rotateY(${x * intensity}deg) rotateX(${-y * intensity}deg) scale3d(1.1, 1.1, 1.1)`; // Unified to 1.1
        } else {
          (card as HTMLElement).style.transform = "";
        }
      });
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      cancelAnimationFrame(rafId);
    };
  }, []);
};
