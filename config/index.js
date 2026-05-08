document.addEventListener("DOMContentLoaded", () => {
  const mainContent = document.getElementById("main-content");
  const scrollArrow = document.getElementById("scroll-arrow");
  const heroSection = document.querySelector(".hero-gradient");
  const typingText = document.getElementById("typing-text");

  /* =========================================
     MAIN CONTENT VISIBILITY ON SCROLL
  ========================================= */

  function showMainContent() {
    if (!mainContent) return;

    mainContent.classList.remove("main-hidden");
    mainContent.classList.add("main-visible");
  }

  function hideMainContent() {
    if (!mainContent) return;

    mainContent.classList.remove("main-visible");
    mainContent.classList.add("main-hidden");
  }

  function getScrollTriggerPoint() {
    const width = window.innerWidth;

    if (width < 640) return 0.78; // mobile
    if (width < 1024) return 0.68; // tablet

    return 0.6; // laptop / desktop
  }

  function handleMainContent() {
    if (!mainContent || !heroSection) return;

    const heroRect = heroSection.getBoundingClientRect();
    const triggerPoint = window.innerHeight * getScrollTriggerPoint();

    if (heroRect.bottom > triggerPoint) {
      hideMainContent();
    } else {
      showMainContent();
    }
  }

  /* =========================================
     SCROLL ARROW VISIBILITY
  ========================================= */

  function showScrollArrow() {
    if (!scrollArrow) return;

    scrollArrow.style.opacity = "0.5";
    scrollArrow.style.pointerEvents = "auto";
  }

  function hideScrollArrow() {
    if (!scrollArrow) return;

    scrollArrow.style.opacity = "0";
    scrollArrow.style.pointerEvents = "none";
  }

  function handleScrollArrow() {
    if (!scrollArrow || !heroSection) return;

    const heroRect = heroSection.getBoundingClientRect();
    const triggerPoint = window.innerHeight * getScrollTriggerPoint();

    if (heroRect.top <= 0 && heroRect.bottom > triggerPoint) {
      showScrollArrow();
    } else {
      hideScrollArrow();
    }
  }

  /* =========================================
     SMOOTH SCROLL WHEN ARROW IS CLICKED
  ========================================= */

  function scrollToMainContent() {
    if (!mainContent) return;

    mainContent.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  if (scrollArrow) {
    scrollArrow.addEventListener("click", scrollToMainContent);
  }

  /* =========================================
     OPTIMIZED SCROLL HANDLER
  ========================================= */

  let ticking = false;

  function updateOnScroll() {
    handleMainContent();
    handleScrollArrow();
    ticking = false;
  }

  function requestScrollUpdate() {
    if (!ticking) {
      window.requestAnimationFrame(updateOnScroll);
      ticking = true;
    }
  }

  window.addEventListener("scroll", requestScrollUpdate, {
    passive: true,
  });

  window.addEventListener("resize", requestScrollUpdate);

  handleMainContent();
  handleScrollArrow();

  /* =========================================
     TYPING TEXT EFFECT
  ========================================= */

  const text = "Hi, I am Raphael!";

  let index = 0;
  let isDeleting = false;

  function typeEffect() {
    if (!typingText) return;

    typingText.textContent = text.substring(0, index);

    if (!isDeleting) {
      index++;

      if (index > text.length) {
        isDeleting = true;
        setTimeout(typeEffect, 1200);
        return;
      }
    } else {
      index--;

      if (index < 0) {
        isDeleting = false;
        index = 0;
      }
    }

    setTimeout(typeEffect, isDeleting ? 50 : 100);
  }

  typeEffect();
});
