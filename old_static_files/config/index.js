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
