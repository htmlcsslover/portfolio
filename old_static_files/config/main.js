/**
 * OPTIMIZED MAIN SCRIPT
 * Performance improvements:
 * - Throttled pointer move events (16ms)
 * - Cached DOM queries
 * - RequestAnimationFrame for scroll updates
 * - Efficient event delegation
 * - Memory leak prevention
 */

document.addEventListener("DOMContentLoaded", () => {
  // Cache all DOM queries upfront
  const mobileNavToggle = document.getElementById("mobile-nav-toggle");
  const mobileNav = document.getElementById("mobile-nav");
  const typingText = document.getElementById("typing-text");
  const scrollArrow = document.getElementById("scroll-arrow");
  const heroSection = document.getElementById("home");
  const mainContent = document.getElementById("main-content");

  // Check user preferences
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const touchLike = window.matchMedia(
    "(hover: none), (pointer: coarse)",
  ).matches;

  // Navigation elements
  const navLinks = document.querySelectorAll(".nav-link, .mobile-nav-link");
  const navSections = [
    document.getElementById("discovery"),
    document.getElementById("journey"),
    document.getElementById("contact"),
  ].filter(Boolean);

  // ===== BACKGROUND ANIMATION (via JS, not CSS) =====
  // This is optimized using requestAnimationFrame instead of CSS animation
  function startBackgroundMotion() {
    if (reducedMotion) return;

    const root = document.documentElement;
    let lastTime = performance.now();
    let animationId = null;

    function setPercent(name, value) {
      root.style.setProperty(name, `${value.toFixed(2)}%`);
    }

    function animateBackground(now) {
      // Only update if 16ms has passed (smooth 60fps)
      if (now - lastTime >= 16) {
        const time = now / 1000;

        setPercent("--orb-1-x", 18 + Math.sin(time * 0.12) * 10);
        setPercent("--orb-1-y", 16 + Math.cos(time * 0.1) * 8);
        setPercent("--orb-2-x", 78 + Math.cos(time * 0.09) * 9);
        setPercent("--orb-2-y", 10 + Math.sin(time * 0.11) * 10);
        setPercent("--orb-3-x", 58 + Math.sin(time * 0.07 + 1.8) * 13);
        setPercent("--orb-3-y", 76 + Math.cos(time * 0.08 + 0.7) * 9);
        setPercent("--orb-4-x", 22 + Math.cos(time * 0.1 + 2.4) * 12);
        setPercent("--orb-4-y", 86 + Math.sin(time * 0.06 + 1.2) * 7);

        lastTime = now;
      }

      animationId = window.requestAnimationFrame(animateBackground);
    }

    animationId = window.requestAnimationFrame(animateBackground);

    // Cleanup function for memory management
    return () => cancelAnimationFrame(animationId);
  }

  // ===== MOBILE NAVIGATION =====
  mobileNavToggle?.addEventListener("click", () => {
    const isOpen = !mobileNav?.classList.contains("hidden");
    mobileNav?.classList.toggle("hidden", isOpen);
    mobileNavToggle.setAttribute("aria-expanded", String(!isOpen));
    mobileNavToggle.setAttribute(
      "aria-label",
      isOpen ? "Open navigation menu" : "Close navigation menu",
    );
  });

  // ===== SMOOTH SCROLL TO SECTIONS =====
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });

      // Close mobile nav
      mobileNav?.classList.add("hidden");
      mobileNavToggle?.setAttribute("aria-expanded", "false");
      mobileNavToggle?.setAttribute("aria-label", "Open navigation menu");
    });
  });

  // ===== SCROLL ARROW =====
  scrollArrow?.addEventListener("click", () => {
    mainContent?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
  });

  // ===== TYPING ANIMATION =====
  if (typingText) {
    const phrases = [
      "Hi, I am Raphael.",
      "I design thoughtful interfaces.",
      "I build, learn, and lead.",
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let typeTimeoutId = null;

    function typeLoop() {
      const phrase = phrases[phraseIndex];
      typingText.textContent = phrase.slice(0, charIndex);

      if (reducedMotion) {
        typingText.textContent = phrases[0];
        return;
      }

      if (!deleting && charIndex < phrase.length) {
        charIndex += 1;
      } else if (!deleting) {
        deleting = true;
        typeTimeoutId = window.setTimeout(typeLoop, 1200);
        return;
      } else if (charIndex > 0) {
        charIndex -= 1;
      } else {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }

      typeTimeoutId = window.setTimeout(typeLoop, deleting ? 42 : 78);
    }

    typeLoop();

    // Cleanup typing timeouts
    const originalCleanup = window.cleanup || (() => {});
    window.cleanup = () => {
      clearTimeout(typeTimeoutId);
      originalCleanup();
    };
  }

  // ===== THROTTLED HOVER EFFECTS =====
  // Only on devices that support hover
  if (!reducedMotion && !touchLike) {
    // GLASS PANEL GLOW
    const glassPanels = document.querySelectorAll(".glass-panel");
    let lastPanelUpdate = {};

    glassPanels.forEach((panel) => {
      let lastX = 0,
        lastY = 0;

      panel.addEventListener("pointermove", (event) => {
        const rect = panel.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Only update if moved more than 5px
        if (Math.abs(x - lastX) > 5 || Math.abs(y - lastY) > 5) {
          panel.style.setProperty("--mouse-x", `${x}px`);
          panel.style.setProperty("--mouse-y", `${y}px`);
          panel.classList.add("is-glowing");
          lastX = x;
          lastY = y;
        }
      });

      panel.addEventListener("pointerleave", () => {
        panel.classList.remove("is-glowing");
      });
    });

    // TILT CARDS
    const tiltCards = document.querySelectorAll(".tilt-card");

    tiltCards.forEach((card) => {
      let tiltTimeoutId = null;
      let lastTilt = { x: 0, y: 0 };

      card.addEventListener("pointermove", (event) => {
        if (tiltTimeoutId) return;

        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;

        // Only update if tilt changed significantly
        if (
          Math.abs(x - lastTilt.x) > 0.05 ||
          Math.abs(y - lastTilt.y) > 0.05
        ) {
          // Simplified 2D tilt for better performance
          card.style.transform = `scale(${1 + Math.sqrt(x * x + y * y) * 0.01})`;
          lastTilt = { x, y };
        }

        // Throttle updates to ~60ms
        tiltTimeoutId = setTimeout(() => {
          tiltTimeoutId = null;
        }, 60);
      });

      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
        clearTimeout(tiltTimeoutId);
        lastTilt = { x: 0, y: 0 };
      });
    });

    // MAGNETIC BUTTONS
    const magneticButtons = document.querySelectorAll(".magnetic");

    magneticButtons.forEach((button) => {
      let magneticTimeoutId = null;
      let lastMag = { x: 0, y: 0 };

      button.addEventListener("pointermove", (event) => {
        if (magneticTimeoutId) return;

        const rect = button.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * 0.1;
        const y = (event.clientY - rect.top - rect.height / 2) * 0.1;

        if (Math.abs(x - lastMag.x) > 1 || Math.abs(y - lastMag.y) > 1) {
          button.style.transform = `translate(${x}px, ${y}px)`;
          lastMag = { x, y };
        }

        magneticTimeoutId = setTimeout(() => {
          magneticTimeoutId = null;
        }, 60);
      });

      button.addEventListener("pointerleave", () => {
        button.style.transform = "";
        clearTimeout(magneticTimeoutId);
        lastMag = { x: 0, y: 0 };
      });
    });
  }

  // ===== REVEAL ANIMATIONS (Intersection Observer) =====
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        } else {
          entry.target.classList.remove("is-visible");
        }
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -100px 0px", // Start animation 100px before visible
    },
  );

  document.querySelectorAll(".reveal").forEach((element) => {
    revealObserver.observe(element);
  });

  // ===== ACTIVE NAVIGATION INDICATOR =====
  const navObserver = new IntersectionObserver(
    (entries) => {
      const active = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!active) return;

      navLinks.forEach((link) => {
        link.classList.toggle(
          "active",
          link.getAttribute("href") === `#${active.target.id}`,
        );
      });
    },
    {
      rootMargin: "-38% 0px -50% 0px",
      threshold: [0.12, 0.28, 0.5],
    },
  );

  navSections.forEach((section) => navObserver.observe(section));

  // ===== MAIN CONTENT VISIBILITY =====
  function getHeroTriggerRatio() {
    const width = window.innerWidth;
    if (width < 640) return 0.78;
    if (width < 1024) return 0.68;
    return 0.6;
  }

  let scrollUpdateScheduled = false;
  let lastScrollY = window.scrollY;

  function updateMainContentVisibility() {
    if (!heroSection || !mainContent) return;

    if (reducedMotion) {
      mainContent.classList.remove("main-hidden");
      mainContent.classList.add("main-visible");
      scrollArrow?.classList.add("hidden-arrow");
      return;
    }

    const triggerPoint =
      heroSection.offsetTop + heroSection.offsetHeight * getHeroTriggerRatio();
    const isPastHeroTrigger = window.scrollY >= triggerPoint;

    mainContent.classList.toggle("main-visible", isPastHeroTrigger);
    mainContent.classList.toggle("main-hidden", !isPastHeroTrigger);
    scrollArrow?.classList.toggle("hidden-arrow", isPastHeroTrigger);

    scrollUpdateScheduled = false;
  }

  function requestScrollUpdate() {
    if (scrollUpdateScheduled) return;

    // Only update if scroll delta > 5px
    if (Math.abs(window.scrollY - lastScrollY) > 5) {
      scrollUpdateScheduled = true;
      window.requestAnimationFrame(updateMainContentVisibility);
      lastScrollY = window.scrollY;
    }
  }

  // Initial call
  updateMainContentVisibility();

  // Passive scroll listener
  window.addEventListener("scroll", requestScrollUpdate, { passive: true });

  // Resize listener
  window.addEventListener(
    "resize",
    () => {
      updateMainContentVisibility();
    },
    { passive: true },
  );

  // Start background animation
  const stopBackgroundAnimation = startBackgroundMotion();

  // ===== CLEANUP ON PAGE UNLOAD =====
  window.addEventListener("beforeunload", () => {
    stopBackgroundAnimation?.();
    revealObserver.disconnect();
    navObserver.disconnect();
  });
});

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

  preloadFrames().then(() => {
    drawFrame(isDarkMode ? TOTAL_FRAMES : 1);
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
    if (!ready) {
      alert(
        `Frames not ready: ${loadedFrames}/${TOTAL_FRAMES}. ` +
          "Check console for missing frame paths.",
      );
      return;
    }

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
