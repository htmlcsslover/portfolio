import React, { createContext, useContext, useState, useEffect, useRef } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ThemeContextType {
  isDarkMode: boolean;
  portraitIsDark: boolean;
  ready: boolean;
  loadedFrames: number;
  totalFrames: number;
  toggleTheme: (
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    heroImageRef: React.RefObject<HTMLImageElement | null>
  ) => void;
  startPreloading: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const TOTAL_FRAMES = 190;

/** Maps logical frame index (1-based) to the actual file path. */
const FRAME_PATH = (i: number) => {
  const actualNumber = 1 + (i - 1) * 8;
  return `/images/frameImages/img_${String(actualNumber).padStart(5, "0")}.jpg`;
};

/** Target timeline rate for the canvas animation. 60fps = ~16.6 ms per frame. */
const FPS = 60;
const MS_PER_FRAME = 1000 / FPS;
const STATIC_IMAGE_REVEAL_PROGRESS = 1;
const CANVAS_FADE_DURATION_MS = 220;

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ── Persistent theme preference ──────────────────────────────────────────
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      return saved === "dark" || saved === null; // default dark
    }
    return true;
  });

  // ── Frame-loading state (used only for a loading indicator, not per frame) ─
  const [ready, setReady] = useState(false);
  const [loadedFrames, setLoadedFrames] = useState(0);

  // ── Portrait image lags behind isDarkMode — only flips after canvas fades ─
  const [portraitIsDark, setPortraitIsDark] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      return saved === "dark" || saved === null;
    }
    return true;
  });

  // ── Preloaded images (stored by 1-based index) ────────────────────────────
  const framesRef = useRef<(HTMLImageElement | null)[]>([]);

  // ── Animation refs (never trigger re-renders) ─────────────────────────────
  /** Current frame index (1 → TOTAL_FRAMES). */
  const currentFrameRef = useRef<number>(1);
  /** requestAnimationFrame id so we can cancel it. */
  const rafIdRef = useRef<number | null>(null);
  /** requestAnimationFrame ids for delaying canvas fade until after image paint. */
  const canvasFadeFrameRef = useRef<number | null>(null);
  const canvasFadeSecondFrameRef = useRef<number | null>(null);
  /** Whether the canvas animation loop is currently running. */
  const isAnimatingRef = useRef<boolean>(false);
  /** Prevents repeated portrait swaps during a single transition. */
  const portraitSwapDoneRef = useRef<boolean>(false);
  /** Timeout id for hiding the canvas after its fade. */
  const canvasHideTimeoutRef = useRef<number | null>(null);
  /** Timestamp where the current transition timeline started. */
  const animationStartTimeRef = useRef<number>(0);
  /** Frame index where the current transition timeline started. */
  const animationStartFrameRef = useRef<number>(1);
  /** Duration for the current transition, based on remaining frame distance. */
  const animationDurationRef = useRef<number>(0);

  // ── Misc ──────────────────────────────────────────────────────────────────
  const isPreloadStartedRef = useRef(false);
  const activeRef = useRef(true);

  // ── Sync DOM class immediately when isDarkMode changes ────────────────────
  // This keeps the DOM in sync even for the initial render.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  // =========================================================================
  // applyTheme — instant DOM + state update, no canvas delay
  // =========================================================================
  const applyTheme = (targetDark: boolean) => {
    // 1. Flip React state (triggers re-renders that need isDarkMode)
    setIsDarkMode(targetDark);
    // 2. Immediately mutate the DOM class (doesn't wait for the useEffect)
    document.documentElement.classList.toggle("dark", targetDark);
    // 3. Persist
    localStorage.setItem("theme", targetDark ? "dark" : "light");
  };

  // =========================================================================
  // Preloading — lazy, after first render, uses requestIdleCallback when available
  // =========================================================================
  const startPreloading = () => {
    if (isPreloadStartedRef.current) return;
    isPreloadStartedRef.current = true;

    const preload = async () => {
      let loadedCount = 0;
      const BATCH_SIZE = 6; // load 6 at a time; tweak for your server

      for (let i = 1; i <= TOTAL_FRAMES; i += BATCH_SIZE) {
        if (!activeRef.current) return;

        const batch: Promise<void>[] = [];

        for (let j = i; j < i + BATCH_SIZE && j <= TOTAL_FRAMES; j++) {
          const img = new Image();
          img.src = FRAME_PATH(j);

          const task = img
            .decode()
            .then(() => {
              if (!activeRef.current) return;
              framesRef.current[j] = img;
              loadedCount++;
              // Batch React update — only every 10 frames to keep renders cheap
              if (loadedCount % 10 === 0 || loadedCount === TOTAL_FRAMES) {
                setLoadedFrames(loadedCount);
              }
            })
            .catch(() => {
              if (!activeRef.current) return;
              // Reuse previous frame on decode failure
              framesRef.current[j] = framesRef.current[j - 1] ?? null;
              console.warn(`Frame ${j} failed: ${img.src}`);
            });

          batch.push(task);
        }

        await Promise.all(batch);
      }

      if (activeRef.current) {
        setLoadedFrames(TOTAL_FRAMES); // ensure UI shows 100%
        setReady(true);
      }
    };

    // Prefer idle time; fall back to a plain setTimeout
    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(() => preload());
    } else {
      setTimeout(preload, 300);
    }
  };

  // Kick off preloading after initial paint — never blocks first render
  useEffect(() => {
    activeRef.current = true;
    // Slight delay so the hero image and fonts render first
    const timer = setTimeout(startPreloading, 400);
    return () => {
      activeRef.current = false;
      clearTimeout(timer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clean up RAF on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      if (canvasFadeFrameRef.current) cancelAnimationFrame(canvasFadeFrameRef.current);
      if (canvasFadeSecondFrameRef.current) cancelAnimationFrame(canvasFadeSecondFrameRef.current);
      if (canvasHideTimeoutRef.current) window.clearTimeout(canvasHideTimeoutRef.current);
    };
  }, []);

  // =========================================================================
  // drawFrame — render one frame to the canvas
  // =========================================================================
  const getLoadedFrame = (index: number) => {
    // Clamp index to valid range
    const clampedIndex = Math.max(1, Math.min(TOTAL_FRAMES, index));

    // Fallback: walk backward until we find a loaded frame
    let img = framesRef.current[clampedIndex];
    let fallbackIdx = clampedIndex;
    while (!img && fallbackIdx > 1) {
      fallbackIdx--;
      img = framesRef.current[fallbackIdx];
    }
    return img;
  };

  const drawImageFrame = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    heroImage: HTMLImageElement,
    img: HTMLImageElement,
    targetDark: boolean
  ) => {
    // Read scale/position from canvas data attributes (set in Hero.tsx)
    const scale = targetDark
      ? parseFloat(canvas.dataset.frameDarkScale || heroImage.dataset.darkScale || "1")
      : parseFloat(canvas.dataset.frameLightScale || heroImage.dataset.lightScale || "1");

    const position = targetDark
      ? canvas.dataset.frameDarkPosition || heroImage.dataset.darkPosition || "center center"
      : canvas.dataset.frameLightPosition || heroImage.dataset.lightPosition || "center center";

    // Object-cover math
    const canvasRatio = canvas.width / canvas.height;
    const imageRatio = img.width / img.height;
    let drawWidth: number;
    let drawHeight: number;

    if (imageRatio > canvasRatio) {
      drawHeight = canvas.height * scale;
      drawWidth = drawHeight * imageRatio;
    } else {
      drawWidth = canvas.width * scale;
      drawHeight = drawWidth / imageRatio;
    }

    let dx = (canvas.width - drawWidth) / 2;
    let dy = (canvas.height - drawHeight) / 2;

    const [xPos, yPos] = position.split(" ");
    if (xPos === "left") dx = 0;
    if (xPos === "right") dx = canvas.width - drawWidth;
    if (yPos === "top") dy = 0;
    else if (yPos === "bottom") dy = canvas.height - drawHeight;
    else if (yPos?.includes("%")) {
      dy = (canvas.height - drawHeight) * (parseFloat(yPos) / 100);
    }

    ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
  };

  const drawFrame = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    heroImage: HTMLImageElement,
    framePosition: number,
    targetDark: boolean
  ) => {
    const clampedPosition = Math.max(1, Math.min(TOTAL_FRAMES, framePosition));
    const lowerIndex = Math.floor(clampedPosition);
    const upperIndex = Math.min(TOTAL_FRAMES, lowerIndex + 1);
    const blendAmount = clampedPosition - lowerIndex;
    const lowerFrame = getLoadedFrame(lowerIndex);
    const upperFrame = getLoadedFrame(upperIndex);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!lowerFrame && !upperFrame) return;

    ctx.globalAlpha = 1;
    if (lowerFrame) {
      drawImageFrame(ctx, canvas, heroImage, lowerFrame, targetDark);
    }

    if (upperFrame && upperFrame !== lowerFrame && blendAmount > 0) {
      ctx.globalAlpha = blendAmount;
      drawImageFrame(ctx, canvas, heroImage, upperFrame, targetDark);
      ctx.globalAlpha = 1;
    }
  };

  // =========================================================================
  // playCanvasTransition — animate the canvas overlay on a fixed timeline
  // =========================================================================
  const playCanvasTransition = (
    direction: number,
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    heroImage: HTMLImageElement,
    targetDark: boolean
  ) => {
    const revealStaticPortraitThenFadeCanvas = () => {
      if (portraitSwapDoneRef.current) return;

      portraitSwapDoneRef.current = true;
      setPortraitIsDark(targetDark);
      heroImage.style.visibility = "visible";
      heroImage.style.opacity = "1";

      canvasFadeFrameRef.current = requestAnimationFrame(() => {
        canvasFadeFrameRef.current = null;
        canvasFadeSecondFrameRef.current = requestAnimationFrame(() => {
          canvasFadeSecondFrameRef.current = null;
          canvas.style.opacity = "0";
        });
      });
    };

    // Cancel any running animation before starting a new one
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (canvasFadeFrameRef.current !== null) {
      cancelAnimationFrame(canvasFadeFrameRef.current);
      canvasFadeFrameRef.current = null;
    }
    if (canvasFadeSecondFrameRef.current !== null) {
      cancelAnimationFrame(canvasFadeSecondFrameRef.current);
      canvasFadeSecondFrameRef.current = null;
    }
    if (canvasHideTimeoutRef.current !== null) {
      window.clearTimeout(canvasHideTimeoutRef.current);
      canvasHideTimeoutRef.current = null;
    }

    isAnimatingRef.current = true;
    portraitSwapDoneRef.current = false;
    animationStartTimeRef.current = 0;
    animationStartFrameRef.current = currentFrameRef.current;

    const endFrame = direction === 1 ? TOTAL_FRAMES : 1;
    const remainingFrames = Math.abs(endFrame - animationStartFrameRef.current);
    animationDurationRef.current = Math.max(MS_PER_FRAME, remainingFrames * MS_PER_FRAME);

    const loop = (timestamp: number) => {
      if (animationStartTimeRef.current === 0) {
        animationStartTimeRef.current = timestamp;
      }

      const elapsed = timestamp - animationStartTimeRef.current;
      const progress = Math.min(elapsed / animationDurationRef.current, 1);
      const framePosition =
        animationStartFrameRef.current +
        (endFrame - animationStartFrameRef.current) * progress;

      currentFrameRef.current = Math.max(
        1,
        Math.min(TOTAL_FRAMES, Math.round(framePosition))
      );

      drawFrame(ctx, canvas, heroImage, framePosition, targetDark);

      const isTransitionComplete = progress >= STATIC_IMAGE_REVEAL_PROGRESS;

      if (!portraitSwapDoneRef.current && isTransitionComplete) {
        revealStaticPortraitThenFadeCanvas();
      }

      if (!isTransitionComplete) {
        rafIdRef.current = requestAnimationFrame(loop);
      } else {
        // Animation complete; swap the static portrait after the final canvas frame.
        currentFrameRef.current = endFrame;
        if (!portraitSwapDoneRef.current) {
          revealStaticPortraitThenFadeCanvas();
        }
        canvasHideTimeoutRef.current = window.setTimeout(() => {
          canvas.style.visibility = "hidden";
          isAnimatingRef.current = false;
          rafIdRef.current = null;
          canvasHideTimeoutRef.current = null;
        }, CANVAS_FADE_DURATION_MS);
      }
    };

    rafIdRef.current = requestAnimationFrame(loop);
  };

  // =========================================================================
  // toggleTheme — public API called by Header
  // =========================================================================
  const toggleTheme = (
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    heroImageRef: React.RefObject<HTMLImageElement | null>
  ) => {
    const targetDark = !isDarkMode;

    // ── Step 1: Apply theme instantly — never delayed by canvas ──────────
    applyTheme(targetDark);

    // ── Step 2: Canvas overlay — only if frames exist and refs are ready ──
    const canvas = canvasRef.current;
    const heroImage = heroImageRef.current;
    const hasFrames = framesRef.current.some(f => f !== null && f !== undefined);

    if (!canvas || !heroImage || !hasFrames) {
      // No canvas available — theme already changed, done.
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const direction = targetDark ? -1 : 1;

    // ── If NOT currently animating, set start frame fresh ─────────────────
    if (!isAnimatingRef.current) {
      // Start from the logical "beginning" for this direction
      currentFrameRef.current = targetDark ? TOTAL_FRAMES : 1;
    }
    // If already animating, restart from the current frame position and retime
    // the remaining distance so reversals stay smooth.

    // Resize canvas to match physical pixels
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    // Make canvas visible as overlay
    canvas.style.visibility = "visible";
    canvas.style.opacity = "1";
    canvas.style.transition = `opacity ${CANVAS_FADE_DURATION_MS}ms ease`;

    // Draw the first frame immediately (no blank flash)
    drawFrame(ctx, canvas, heroImage, currentFrameRef.current, targetDark);

    // ── Step 3: Run the frame loop ─────────────────────────────────────────
    playCanvasTransition(direction, ctx, canvas, heroImage, targetDark);
  };

  // =========================================================================
  // Render
  // =========================================================================
  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        portraitIsDark,
        ready,
        loadedFrames,
        totalFrames: TOTAL_FRAMES,
        toggleTheme,
        startPreloading,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
