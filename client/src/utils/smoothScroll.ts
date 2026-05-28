let activeScrollFrame: number | null = null;

const easeInOutCubic = (progress: number) =>
  progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;

const getScrollMarginTop = (target: HTMLElement) => {
  const value = window.getComputedStyle(target).scrollMarginTop;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const scrollInstantlyTo = (top: number) => {
  const root = document.documentElement;
  const previousScrollBehavior = root.style.scrollBehavior;

  root.style.scrollBehavior = "auto";
  window.scrollTo(0, top);
  root.style.scrollBehavior = previousScrollBehavior;
};

export const scrollToElement = (target: HTMLElement) => {
  if (activeScrollFrame !== null) {
    window.cancelAnimationFrame(activeScrollFrame);
    activeScrollFrame = null;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const startY = window.scrollY;
  const targetY = Math.max(
    0,
    target.getBoundingClientRect().top + startY - getScrollMarginTop(target)
  );
  const distance = targetY - startY;

  if (reducedMotion || Math.abs(distance) < 2) {
    scrollInstantlyTo(targetY);
    return;
  }

  const duration = Math.min(900, Math.max(420, Math.abs(distance) * 0.45));
  const startTime = performance.now();

  const step = (timestamp: number) => {
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);

    scrollInstantlyTo(startY + distance * easeInOutCubic(progress));

    if (progress < 1) {
      activeScrollFrame = window.requestAnimationFrame(step);
    } else {
      activeScrollFrame = null;
    }
  };

  activeScrollFrame = window.requestAnimationFrame(step);
};
