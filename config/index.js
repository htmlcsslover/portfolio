document.addEventListener("DOMContentLoaded", () => {
  const mainContent = document.getElementById("main-content");

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

  function handleMainContent() {
    if (!mainContent) return;

    const heroSection = document.querySelector(".hero-gradient");
    if (!heroSection) return;

    const heroRect = heroSection.getBoundingClientRect();

    if (heroRect.bottom > window.innerHeight * 0.6) {
      hideMainContent();
    } else {
      showMainContent();
    }
  }

  window.addEventListener("scroll", handleMainContent);
  handleMainContent();

  const scrollArrow = document.getElementById("scroll-arrow");

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
    if (!scrollArrow) return;

    const heroSection = document.querySelector(".hero-gradient");
    if (!heroSection) return;

    const heroRect = heroSection.getBoundingClientRect();

    if (heroRect.top <= 0 && heroRect.bottom > window.innerHeight * 0.6) {
      showScrollArrow();
    } else {
      hideScrollArrow();
    }
  }

  window.addEventListener("scroll", handleScrollArrow);
  handleScrollArrow();

  const text = "Hi, I am Raphael!";
  const typingText = document.getElementById("typing-text");

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