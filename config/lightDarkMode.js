document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("theme-toggle");
  const html = document.documentElement;
  const heroImage = document.getElementById("hero-image");
  const transitionVideo = document.getElementById("transition-video");

  if (!toggleBtn || !heroImage || !transitionVideo) {
    return;
  }

  const DARK_IMAGE = heroImage.dataset.darkSrc || "images/darkMode.png";
  const LIGHT_IMAGE = heroImage.dataset.lightSrc || "images/lightMode.png";
  const LIGHT_VIDEO =
    transitionVideo.dataset.lightVideo || "images/wearShades.mp4";
  const DARK_VIDEO =
    transitionVideo.dataset.darkVideo || "images/removeShades.mp4";

  const LIGHT_VIDEO_SCALE = transitionVideo.dataset.scaleLight || "1.16";
  const DARK_VIDEO_SCALE = transitionVideo.dataset.scaleDark || "1.19";

  let isTransitioning = false;
  let isDarkMode =
    localStorage.getItem("theme") === "dark" ||
    localStorage.getItem("theme") === null;
  let transitionOriginalDark = true;
  let transitionTargetDark = true;
  let transitionRunId = 0;
  let transitionDirection = 0;
  let playForwardRAF = null;
  let rewindInterval = null;

  function saveTheme(dark) {
    localStorage.setItem("theme", dark ? "dark" : "light");
  }

  function updateToggleLabel(dark) {
    toggleBtn.textContent = dark ? "Light Mode" : "Dark Mode";
    toggleBtn.setAttribute(
      "aria-label",
      dark ? "Switch to light mode" : "Switch to dark mode",
    );
    toggleBtn.setAttribute("aria-busy", String(isTransitioning));
  }

  function stopAllPlayback() {
    if (playForwardRAF) cancelAnimationFrame(playForwardRAF);
    if (rewindInterval) clearInterval(rewindInterval);

    playForwardRAF = null;
    rewindInterval = null;
  }

  function applyTheme(dark) {
    isDarkMode = dark;
    saveTheme(dark);
    html.classList.toggle("dark", dark);
    heroImage.src = dark ? DARK_IMAGE : LIGHT_IMAGE;
    applyImageCrop(dark);
    updateToggleLabel(dark);
    html.classList.remove("theme-transitioning");
  }

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

  function showVideo() {
    heroImage.style.opacity = "0";
    heroImage.style.visibility = "hidden";

    transitionVideo.style.display = "block";
    transitionVideo.style.visibility = "visible";
    transitionVideo.classList.add("is-active");
    transitionVideo.style.opacity = "1";

    const isLightVideo = transitionVideo.src.includes("wearShades");
    const scale = isLightVideo ? LIGHT_VIDEO_SCALE : DARK_VIDEO_SCALE;
    transitionVideo.style.transform = `scale(${scale})`;
  }

  function finishTheme(dark, runId) {
    if (runId !== transitionRunId) return;

    stopAllPlayback();

    const previousImageTransition = heroImage.style.transition;
    const previousVideoTransition = transitionVideo.style.transition;

    isTransitioning = false;
    transitionDirection = 0;

    applyTheme(dark);

    heroImage.style.transition = "none";
    transitionVideo.style.transition = "none";

    heroImage.style.visibility = "visible";
    heroImage.style.opacity = "1";

    transitionVideo.classList.remove("is-active");
    transitionVideo.style.opacity = "0";
    transitionVideo.style.visibility = "hidden";
    transitionVideo.style.display = "none";
    transitionVideo.pause();

    requestAnimationFrame(() => {
      heroImage.style.transition = previousImageTransition;
      transitionVideo.style.transition = previousVideoTransition;
    });

    updateToggleLabel(dark);
  }

  function playVideoForward(
    targetDark,
    startProgress = 0,
    originalDark = isDarkMode,
  ) {
    stopAllPlayback();
    transitionRunId += 1;

    const runId = transitionRunId;
    const nextVideo = targetDark ? DARK_VIDEO : LIGHT_VIDEO;

    isTransitioning = true;
    transitionDirection = 1;
    transitionOriginalDark = originalDark;
    transitionTargetDark = targetDark;
    updateToggleLabel(isDarkMode);

    showVideo();
    transitionVideo.pause();

    function startPlayback() {
      if (runId !== transitionRunId) return;

      const duration = transitionVideo.duration;

      if (!duration || Number.isNaN(duration)) {
        finishTheme(targetDark, runId);
        return;
      }

      const safeProgress = Math.min(Math.max(startProgress, 0), 1);

      transitionVideo.currentTime = duration * safeProgress;
      transitionVideo.playbackRate = 1.5;

      const playPromise = transitionVideo.play();

      if (playPromise) {
        playPromise.catch(() => finishTheme(targetDark, runId));
      }

      function checkVideo() {
        if (runId !== transitionRunId) return;

        if (transitionVideo.currentTime >= duration - 0.05) {
          finishTheme(targetDark, runId);
          return;
        }

        playForwardRAF = requestAnimationFrame(checkVideo);
      }

      playForwardRAF = requestAnimationFrame(checkVideo);
    }

    if (transitionVideo.getAttribute("src") !== nextVideo) {
      transitionVideo.src = nextVideo;
      transitionVideo.load();
      transitionVideo.onloadedmetadata = startPlayback;
    } else {
      startPlayback();
    }
  }

  function reverseVideo(targetDark) {
    stopAllPlayback();
    transitionRunId += 1;

    const runId = transitionRunId;

    isTransitioning = true;
    transitionDirection = -1;

    showVideo();
    transitionVideo.pause();
    transitionVideo.playbackRate = 1;

    const duration = transitionVideo.duration;

    if (!duration || Number.isNaN(duration)) {
      finishTheme(targetDark, runId);
      return;
    }

    let currentTime = transitionVideo.currentTime;

    rewindInterval = window.setInterval(() => {
      if (runId !== transitionRunId) {
        clearInterval(rewindInterval);
        rewindInterval = null;
        return;
      }

      currentTime -= 0.04;

      if (currentTime <= 0) {
        transitionVideo.currentTime = 0;
        finishTheme(targetDark, runId);
        return;
      }

      transitionVideo.currentTime = currentTime;
    }, 30);
  }

  applyTheme(isDarkMode);

  transitionVideo.src = DARK_VIDEO;
  transitionVideo.preload = "auto";
  transitionVideo.style.display = "none";
  transitionVideo.style.visibility = "hidden";

  toggleBtn.addEventListener("click", () => {
    html.classList.add("theme-transitioning");

    if (isTransitioning) {
      if (transitionDirection === 1) {
        reverseVideo(transitionOriginalDark);
      } else if (transitionDirection === -1) {
        const duration = transitionVideo.duration || 1;
        const currentProgress = transitionVideo.currentTime / duration;

        playVideoForward(
          transitionTargetDark,
          currentProgress,
          transitionOriginalDark,
        );
      }

      return;
    }

    const originalDark = isDarkMode;
    const targetDark = !isDarkMode;

    applyTheme(targetDark);
    playVideoForward(targetDark, 0, originalDark);
  });
});
