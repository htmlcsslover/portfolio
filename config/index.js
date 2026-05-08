document.addEventListener("DOMContentLoaded", () => {
  const mobileNavToggle = document.getElementById("mobile-nav-toggle");
  const mobileNav = document.getElementById("mobile-nav");
  const typingText = document.getElementById("typing-text");
  const scrollArrow = document.getElementById("scroll-arrow");
  const heroSection = document.getElementById("home");
  const mainContent = document.getElementById("main-content");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touchLike = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const navLinks = document.querySelectorAll(".nav-link, .mobile-nav-link");
  const navSections = [
    document.getElementById("discovery"),
    document.getElementById("journey"),
    document.getElementById("contact"),
  ].filter(Boolean);

  function startBackgroundMotion() {
    if (reducedMotion) return;

    const root = document.documentElement;
    const start = performance.now();

    function setPercent(name, value) {
      root.style.setProperty(name, `${value.toFixed(2)}%`);
    }

    function animateBackground(now) {
      const time = (now - start) / 1000;

      setPercent("--orb-1-x", 18 + Math.sin(time * 0.12) * 10);
      setPercent("--orb-1-y", 16 + Math.cos(time * 0.1) * 8);
      setPercent("--orb-2-x", 78 + Math.cos(time * 0.09) * 9);
      setPercent("--orb-2-y", 10 + Math.sin(time * 0.11) * 10);
      setPercent("--orb-3-x", 58 + Math.sin(time * 0.07 + 1.8) * 13);
      setPercent("--orb-3-y", 76 + Math.cos(time * 0.08 + 0.7) * 9);
      setPercent("--orb-4-x", 22 + Math.cos(time * 0.1 + 2.4) * 12);
      setPercent("--orb-4-y", 86 + Math.sin(time * 0.06 + 1.2) * 7);

      window.requestAnimationFrame(animateBackground);
    }

    window.requestAnimationFrame(animateBackground);
  }

  mobileNavToggle?.addEventListener("click", () => {
    const isOpen = !mobileNav?.classList.contains("hidden");
    mobileNav?.classList.toggle("hidden", isOpen);
    mobileNavToggle.setAttribute("aria-expanded", String(!isOpen));
    mobileNavToggle.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
      mobileNav?.classList.add("hidden");
      mobileNavToggle?.setAttribute("aria-expanded", "false");
      mobileNavToggle?.setAttribute("aria-label", "Open navigation menu");
    });
  });

  scrollArrow?.addEventListener("click", () => {
    mainContent?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
  });

  if (typingText) {
    const phrases = ["Hi, I am Raphael.", "I design thoughtful interfaces.", "I build, learn, and lead."];
    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;

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
        window.setTimeout(typeLoop, 1200);
        return;
      } else if (charIndex > 0) {
        charIndex -= 1;
      } else {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }

      window.setTimeout(typeLoop, deleting ? 42 : 78);
    }

    typeLoop();
  }

  if (!reducedMotion && !touchLike) {
    document.querySelectorAll(".glass-panel").forEach((panel) => {
      panel.addEventListener("pointermove", (event) => {
        const rect = panel.getBoundingClientRect();
        panel.style.setProperty("--mouse-x", `${event.clientX - rect.left}px`);
        panel.style.setProperty("--mouse-y", `${event.clientY - rect.top}px`);
        panel.classList.add("is-glowing");
      });

      panel.addEventListener("pointerleave", () => {
        panel.classList.remove("is-glowing");
      });
    });

    document.querySelectorAll(".tilt-card").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${y * -4}deg) rotateY(${x * 5}deg) translateY(-2px)`;
      });

      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });

    document.querySelectorAll(".magnetic").forEach((button) => {
      button.addEventListener("pointermove", (event) => {
        const rect = button.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * 0.1;
        const y = (event.clientY - rect.top - rect.height / 2) * 0.1;
        button.style.transform = `translate(${x}px, ${y}px)`;
      });

      button.addEventListener("pointerleave", () => {
        button.style.transform = "";
      });
    });
  }

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
    { threshold: 0.16 },
  );

  document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

  const navObserver = new IntersectionObserver(
    (entries) => {
      const active = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!active) return;

      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${active.target.id}`);
      });
    },
    { rootMargin: "-38% 0px -50% 0px", threshold: [0.12, 0.28, 0.5] },
  );

  navSections.forEach((section) => navObserver.observe(section));

  function getHeroTriggerRatio() {
    if (window.innerWidth < 640) return 0.78;
    if (window.innerWidth < 1024) return 0.68;
    return 0.6;
  }

  function updateMainContentVisibility() {
    if (!heroSection || !mainContent) return;

    if (reducedMotion) {
      mainContent.classList.remove("main-hidden");
      mainContent.classList.add("main-visible");
      scrollArrow?.classList.add("hidden-arrow");
      return;
    }

    const triggerPoint = heroSection.offsetTop + heroSection.offsetHeight * getHeroTriggerRatio();
    const isPastHeroTrigger = window.scrollY >= triggerPoint;

    mainContent.classList.toggle("main-visible", isPastHeroTrigger);
    mainContent.classList.toggle("main-hidden", !isPastHeroTrigger);
    scrollArrow?.classList.toggle("hidden-arrow", isPastHeroTrigger);
  }

  let scrollTicking = false;

  function requestScrollUpdate() {
    if (scrollTicking) return;

    scrollTicking = true;
    window.requestAnimationFrame(() => {
      updateMainContentVisibility();
      scrollTicking = false;
    });
  }

  updateMainContentVisibility();
  window.addEventListener("scroll", requestScrollUpdate, { passive: true });
  window.addEventListener("resize", requestScrollUpdate);
  startBackgroundMotion();
});
