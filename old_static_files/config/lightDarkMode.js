/**
 * OPTIMIZED LIGHT/DARK MODE SCRIPT
 * Performance improvements:
 * - Frame preloading with error recovery
 * - Memory-efficient canvas operations
 * - Debounced resize handler
 * - Optimized theme switching
 */

document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("theme-toggle");
  const html = document.documentElement;
  const heroImage = document.getElementById("hero-image");
  const canvas = document.getElementById("transition-canvas");

  if (!toggleBtn || !heroImage || !canvas) return;

  const ctx = canvas.getContext("2d", { willReadFrequently: false });

  if (!ctx) {
    console.error("Canvas context not available");
    return;
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const TOTAL_FRAMES = 190;
  const FRAME_PATH = (i) => {
    const actualNumber = 1 + (i - 1) * 8;
    return `images/frameImages/img_${String(actualNumber).padStart(5, "0")}.jpg`;
  };

  const DARK_IMAGE = heroImage.dataset.darkSrc || "images/darkMode.png";
  const LIGHT_IMAGE = heroImage.dataset.lightSrc || "images/lightMode.png";

  const frames = [];
  let loadedFrames = 0;
  let ready = false;
  let isTransitioning = false;
  let resizeTimeoutId = null;

  let isDarkMode =
    localStorage.getItem("theme") === "dark" ||
    localStorage.getItem("theme") === null;

  // ===== FRAME PRELOADING WITH ERROR RECOVERY =====
  async function preloadFrames() {
    const loadTasks = [];
    let consecutiveErrors = 0;

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = FRAME_PATH(i);

      const task = img
        .decode()
        .then(() => {
          frames[i] = img;
          loadedFrames++;
          consecutiveErrors = 0;
        })
        .catch(() => {
          consecutiveErrors++;

          // If we hit 3+ consecutive errors, use previous frame as fallback
          if (consecutiveErrors >= 3 && frames[i - 1]) {
            frames[i] = frames[i - 1];
          } else if (!frames[i]) {
            // Keep trying with next frame
            frames[i] = null;
          }

          // Log but don't throw - animation should still work
          console.warn(
            `Frame ${i} (img_${String(1 + (i - 1) * 8).padStart(5, "0")}.jpg) not found`,
          );
        });

      loadTasks.push(task);
    }

    try {
      await Promise.all(loadTasks);
    } catch (error) {
      console.error("Frame preloading failed:", error);
    }

    ready = true;
    console.log(`Frames ready: ${loadedFrames}/${TOTAL_FRAMES}`);
  }

  // ===== THEME PERSISTENCE =====
  function saveTheme(dark) {
    localStorage.setItem("theme", dark ? "dark" : "light");
  }

  function updateToggleLabel(dark) {
    toggleBtn.textContent = dark ? "Light Mode" : "Dark Mode";
    toggleBtn.setAttribute(
      "aria-label",
      dark ? "Switch to light mode" : "Switch to dark mode",
    );
  }

  // ===== IMAGE CROP OPTIMIZATION =====
  function applyImageCrop(dark) {
    const imageScale = dark
      ? heroImage.dataset.darkScale || "1"
      : heroImage.dataset.lightScale || "1";

    const imagePosition = dark
      ? heroImage.dataset.darkPosition || "center center"
      : heroImage.dataset.lightPosition || "center center";

    heroImage.style.transform = `scale(${imageScale})`;
    heroImage.style.objectPosition = imagePosition;
  }

  // ===== IMAGE PRELOAD =====
  function preloadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = resolve; // Don't error if image fails
      img.src = src;
    });
  }

  // ===== THEME APPLICATION =====
  async function applyTheme(dark, waitForImage = false) {
    isDarkMode = dark;
    saveTheme(dark);
    html.classList.toggle("dark", dark);

    const nextSrc = dark ? DARK_IMAGE : LIGHT_IMAGE;

    if (waitForImage) {
      await preloadImage(nextSrc);
    }

    heroImage.src = nextSrc;
    applyImageCrop(dark);
    updateToggleLabel(dark);
  }

  // ===== CANVAS SETUP =====
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }

  // ===== FRAME DRAWING OPTIMIZED =====
  function drawFrame(index, targetDark = isDarkMode) {
    let img = frames[index];

    // Fallback to nearest frame if missing
    while (!img && index > 1) {
      index--;
      img = frames[index];
    }

    if (!img) return;

    const scale = targetDark
      ? parseFloat(
          canvas.dataset.frameDarkScale || heroImage.dataset.darkScale || "1",
        )
      : parseFloat(
          canvas.dataset.frameLightScale || heroImage.dataset.lightScale || "1",
        );

    const position = targetDark
      ? canvas.dataset.frameDarkPosition ||
        heroImage.dataset.darkPosition ||
        "center center"
      : canvas.dataset.frameLightPosition ||
        heroImage.dataset.lightPosition ||
        "center center";

    // Calculate drawing dimensions
    const canvasRatio = canvas.width / canvas.height;
    const imageRatio = img.width / img.height;

    let drawWidth;
    let drawHeight;

    // Preserve aspect ratio like object-cover
    if (imageRatio > canvasRatio) {
      drawHeight = canvas.height * scale;
      drawWidth = drawHeight * imageRatio;
    } else {
      drawWidth = canvas.width * scale;
      drawHeight = drawWidth / imageRatio;
    }

    // Calculate position
    let dx = (canvas.width - drawWidth) / 2;
    let dy = (canvas.height - drawHeight) / 2;

    const [xPos, yPos] = position.split(" ");

    // Horizontal alignment
    if (xPos === "left") dx = 0;
    if (xPos === "right") dx = canvas.width - drawWidth;

    // Vertical alignment
    if (yPos === "top") {
      dy = 0;
    } else if (yPos === "bottom") {
      dy = canvas.height - drawHeight;
    } else if (yPos?.includes("%")) {
      dy = (canvas.height - drawHeight) * (parseFloat(yPos) / 100);
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
  }

  // ===== CANVAS VISIBILITY =====
  function showCanvas() {
    canvas.style.transition = "opacity 120ms ease";
    heroImage.style.transition = "opacity 120ms ease";

    canvas.style.opacity = "1";
    canvas.style.visibility = "visible";
    heroImage.style.opacity = "1";
  }

  function hideCanvas() {
    canvas.style.opacity = "0";
    canvas.style.visibility = "hidden";
    heroImage.style.opacity = "1";
  }

  // ===== ANIMATION ENGINE =====
  function animateFrames(targetDark) {
    if (!ready || isTransitioning) return;

    isTransitioning = true;

    const goingToDark = targetDark;
    let currentFrame = goingToDark ? TOTAL_FRAMES : 1;
    const THEME_SWITCH_FRAME = Math.floor(TOTAL_FRAMES * 0.45);

    showCanvas();
    drawFrame(currentFrame, targetDark);

    // Finish animation with proper cleanup
    async function finishAnimation() {
      await applyTheme(targetDark, true);

      heroImage.style.transition = "opacity 220ms ease";
      canvas.style.transition = "opacity 220ms ease";

      heroImage.style.opacity = "1";
      canvas.style.opacity = "0";

      setTimeout(() => {
        canvas.style.visibility = "hidden";
        isTransitioning = false;
      }, 240);
    }

    // Animation timing
    const DURATION = 3000;
    let startTime = null;
    let animationFrameId = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;

      const elapsed = timestamp - startTime;
      const rawProgress = Math.min(elapsed / DURATION, 1);

      // Ease-in-out cinematic motion
      const progress =
        rawProgress < 0.5
          ? 4 * rawProgress * rawProgress * rawProgress
          : 1 - Math.pow(-2 * rawProgress + 2, 3) / 2;

      currentFrame = goingToDark
        ? Math.round(TOTAL_FRAMES - progress * (TOTAL_FRAMES - 1))
        : Math.round(1 + progress * (TOTAL_FRAMES - 1));

      drawFrame(currentFrame, targetDark);

      // Apply theme switch midway
      if (
        (!goingToDark && currentFrame >= THEME_SWITCH_FRAME) ||
        (goingToDark && currentFrame <= THEME_SWITCH_FRAME)
      ) {
        if (html.classList.contains("dark") !== targetDark) {
          applyTheme(targetDark);
        }
      }

      if (progress >= 1) {
        finishAnimation();
        return;
      }

      animationFrameId = requestAnimationFrame(step);
    }

    animationFrameId = requestAnimationFrame(step);

    // Store for cleanup
    canvas._animationId = animationFrameId;
  }

  // ===== INITIALIZATION =====
  applyTheme(isDarkMode);
  resizeCanvas();

  window.addEventListener("load", () => {
    setTimeout(() => {
      preloadFrames().then(() => {
        drawFrame(isDarkMode ? TOTAL_FRAMES : 1);
      });
    }, 800);
  });
  // ===== DEBOUNCED RESIZE =====
  window.addEventListener(
    "resize",
    () => {
      clearTimeout(resizeTimeoutId);
      resizeTimeoutId = setTimeout(resizeCanvas, 200);
    },
    { passive: true },
  );

  // ===== THEME TOGGLE CLICK =====
  toggleBtn.addEventListener("click", () => {
    animateFrames(!isDarkMode);
  });

  // ===== CLEANUP =====
  window.addEventListener("beforeunload", () => {
    clearTimeout(resizeTimeoutId);
    if (canvas._animationId) {
      cancelAnimationFrame(canvas._animationId);
    }
  });
});
