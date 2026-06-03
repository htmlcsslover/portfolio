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
const FRAME_NUMBERS = [
  1,5,9,13,18,21,25,29,34,37,41,45,49,53,57,61,66,69,73,77,82,85,89,93,98,101,105,109,114,117,121,125,
  130,133,137,141,145,149,153,157,162,165,169,173,178,181,186,189,193,197,202,205,209,213,217,221,225,
  229,233,237,241,245,250,253,257,261,266,269,273,277,282,285,289,293,298,301,305,309,314,317,321,325,
  330,333,337,341,346,349,353,357,362,365,369,373,378,381,385,389,394,397,401,405,410,413,417,421,426,
  429,433,437,442,445,449,453,458,461,465,469,474,477,481,485,490,493,497,501,505,509,513,517,522,525,
  529,533,538,541,545,549,553,557,561,565,570,573,577,581,586,589,593,597,601,605,609,613,618,621,625,
  629,634,637,641,645,649,653,657,661,666,669,673,677,682,685,690,693,697,701,705,709,714,717,721,725,
  730,733,737,741,745,749,754,757,761,765,769,773,778,781,785,789,793,797,802,805,809,813,817,821,825,
  829,834,837,841,845,850,853,857,861,865,869,873,877,882,885,889,893,898,901,905,909,913,917,922,925,
  930,933,937,941,946,949,953,957,962,965,969,973,978,981,986,989,994,997,1001,1005,1010,1013,1018,1021,
  1026,1029,1033,1037,1042,1045,1050,1053,1058,1061,1065,1069,1073,1077,1081,1085,1090,1093,1097,1101,
  1106,1109,1113,1117,1122,1125,1129,1133,1138,1141,1145,1149,1154,1157,1161,1165,1169,1173,1177,1181,
  1186,1189,1193,1197,1201,1205,1209,1213,1218,1221,1225,1229,1234,1237,1242,1245,1250,1253,1257,1261,
  1266,1269,1273,1277,1282,1285,1289,1293,1298,1301,1305,1309,1314,1317,1321,1325,1329,1333,1337,1341,
  1346,1349,1353,1357,1362,1365,1370,1373,1378,1381,1385,1389,1394,1397,1402,1405,1410,1413,1417,1421,
  1426,1429,1434,1437,1442,1445,1449,1453,1457,1461,1465,1469,1474,1477,1481,1485,1490,1493,1497,1501,
  1506,1509,1513,1517,1522,1525,1529,1533,1537
];
const TOTAL_FRAMES = FRAME_NUMBERS.length;

/** Maps logical frame index (1-based) to the actual file path. */
const FRAME_PATH = (i: number) => {
  const actualNumber = FRAME_NUMBERS[i - 1];
  return `/images/frameImages/img_${String(actualNumber).padStart(5, "0")}.jpg`;
};

/** Target timeline rate for the canvas animation. Higher FPS for more frames to keep duration similar. */
const FPS = 120;
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
