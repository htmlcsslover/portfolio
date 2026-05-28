import React, { createContext, useContext, useState, useEffect, useRef } from "react";

interface ThemeContextType {
  isDarkMode: boolean;
  ready: boolean;
  loadedFrames: number;
  totalFrames: number;
  toggleTheme: (
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    heroImageRef: React.RefObject<HTMLImageElement | null>
  ) => void;
  startPreloading: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const TOTAL_FRAMES = 190;
const FRAME_PATH = (i: number) => {
  const actualNumber = 1 + (i - 1) * 8;
  return `/images/frameImages/img_${String(actualNumber).padStart(5, "0")}.jpg`;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      return saved === "dark" || saved === null;
    }
    return true;
  });

  const [ready, setReady] = useState(false);
  const [loadedFrames, setLoadedFrames] = useState(0);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const isTransitioningRef = useRef(false);
  const isPreloadStartedRef = useRef(false);
  const activeRef = useRef(true);
  const animationIdRef = useRef<number | null>(null);

  // Apply root dark class based on state
  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Asynchronous batched preloading trigger
  const startPreloading = () => {
    if (isPreloadStartedRef.current) return;
    isPreloadStartedRef.current = true;

    const preload = async () => {
      let loadedCount = 0;
      let consecutiveErrors = 0;
      const BATCH_SIZE = 4; // Smaller batch size to prevent network choking

      for (let i = 1; i <= TOTAL_FRAMES; i += BATCH_SIZE) {
        if (!activeRef.current) return;
        const batch = [];

        for (let j = i; j < i + BATCH_SIZE && j <= TOTAL_FRAMES; j++) {
          const img = new Image();
          img.src = FRAME_PATH(j);

          const task = img
            .decode()
            .then(() => {
              if (!activeRef.current) return;
              framesRef.current[j] = img;
              loadedCount++;
              setLoadedFrames(loadedCount);
              consecutiveErrors = 0;
            })
            .catch(() => {
              if (!activeRef.current) return;
              consecutiveErrors++;

              if (consecutiveErrors >= 3 && framesRef.current[j - 1]) {
                framesRef.current[j] = framesRef.current[j - 1];
              } else {
                framesRef.current[j] = null as any;
              }
              console.warn(`Frame ${j} failed to load from ${img.src}`);
            });

          batch.push(task);
        }

        // Wait for current batch to decode before starting the next
        await Promise.all(batch);
      }

      if (activeRef.current) {
        setReady(true);
        console.log(`Canvas preloader: ${loadedCount}/${TOTAL_FRAMES} frames preloaded successfully.`);
      }
    };

    preload();
  };

  // Start preloading after a short delay so it is ready for clicks, and clean up active state
  useEffect(() => {
    activeRef.current = true;
    const timer = setTimeout(() => {
      startPreloading();
    }, 200);

    return () => {
      activeRef.current = false;
      clearTimeout(timer);
    };
  }, []);

  const drawFrame = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    heroImage: HTMLImageElement,
    index: number,
    targetDark: boolean
  ) => {
    let img = framesRef.current[index];

    // Fallback to nearest frame
    while (!img && index > 1) {
      index--;
      img = framesRef.current[index];
    }

    if (!img) return;

    // Get scales
    const scale = targetDark
      ? parseFloat(canvas.dataset.frameDarkScale || heroImage.dataset.darkScale || "1")
      : parseFloat(canvas.dataset.frameLightScale || heroImage.dataset.lightScale || "1");

    const position = targetDark
      ? canvas.dataset.frameDarkPosition || heroImage.dataset.darkPosition || "center center"
      : canvas.dataset.frameLightPosition || heroImage.dataset.lightPosition || "center center";

    // Aspect ratio calculations for object-cover
    const canvasRatio = canvas.width / canvas.height;
    const imageRatio = img.width / img.height;

    let drawWidth;
    let drawHeight;

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

    if (yPos === "top") {
      dy = 0;
    } else if (yPos === "bottom") {
      dy = canvas.height - drawHeight;
    } else if (yPos?.includes("%")) {
      dy = (canvas.height - drawHeight) * (parseFloat(yPos) / 100);
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
  };

  const toggleTheme = (
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    heroImageRef: React.RefObject<HTMLImageElement | null>
  ) => {
    // If no frames have loaded yet, start preloading and toggle instantly
    const hasLoadedAny = framesRef.current.some(f => f !== undefined && f !== null);
    if (!hasLoadedAny) {
      startPreloading();
      const nextMode = !isDarkMode;
      setIsDarkMode(nextMode);
      localStorage.setItem("theme", nextMode ? "dark" : "light");
      return;
    }

    if (isTransitioningRef.current) return;

    const canvas = canvasRef.current;
    const heroImage = heroImageRef.current;
    if (!canvas || !heroImage) {
      // Graceful fallback if refs are unavailable (e.g. hero component unmounted)
      const nextMode = !isDarkMode;
      setIsDarkMode(nextMode);
      localStorage.setItem("theme", nextMode ? "dark" : "light");
      return;
    }

    // Set canvas dimensions dynamically to match display size for crisp rendering
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    isTransitioningRef.current = true;
    const goingToDark = !isDarkMode;

    // Show canvas, prepare transition
    canvas.style.visibility = "visible";
    canvas.style.opacity = "1";
    canvas.style.transition = "opacity 120ms ease";
    heroImage.style.transition = "opacity 120ms ease";

    let currentFrame = goingToDark ? TOTAL_FRAMES : 1;
    const THEME_SWITCH_FRAME = Math.floor(TOTAL_FRAMES * 0.45);

    drawFrame(ctx, canvas, heroImage, currentFrame, goingToDark);

    const DURATION = 3000;
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const rawProgress = Math.min(elapsed / DURATION, 1);

      // Ease-in-out ease cubic progress
      const progress =
        rawProgress < 0.5
          ? 4 * rawProgress * rawProgress * rawProgress
          : 1 - Math.pow(-2 * rawProgress + 2, 3) / 2;

      currentFrame = goingToDark
        ? Math.round(TOTAL_FRAMES - progress * (TOTAL_FRAMES - 1))
        : Math.round(1 + progress * (TOTAL_FRAMES - 1));

      drawFrame(ctx, canvas, heroImage, currentFrame, goingToDark);

      // Switch theme mid-way
      if (
        (!goingToDark && currentFrame >= THEME_SWITCH_FRAME) ||
        (goingToDark && currentFrame <= THEME_SWITCH_FRAME)
      ) {
        setIsDarkMode(goingToDark);
        localStorage.setItem("theme", goingToDark ? "dark" : "light");
      }

      if (progress < 1) {
        animationIdRef.current = requestAnimationFrame(animate);
      } else {
        // Complete transition
        setIsDarkMode(goingToDark);
        localStorage.setItem("theme", goingToDark ? "dark" : "light");

        heroImage.style.transition = "opacity 220ms ease";
        canvas.style.transition = "opacity 220ms ease";
        heroImage.style.opacity = "1";
        canvas.style.opacity = "0";

        setTimeout(() => {
          canvas.style.visibility = "hidden";
          isTransitioningRef.current = false;
        }, 240);
      }
    };

    animationIdRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  return (
    <ThemeContext.Provider value={{ isDarkMode, ready, loadedFrames, totalFrames: TOTAL_FRAMES, toggleTheme, startPreloading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
