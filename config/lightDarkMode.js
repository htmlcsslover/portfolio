const toggleBtn = document.getElementById("theme-toggle");
const html = document.documentElement;

const heroImage = document.getElementById("hero-image");
const transitionVideo = document.getElementById("transition-video");

const DARK_IMAGE = "./images/darkMode.png";
const LIGHT_IMAGE = "./images/lightMode.png";

const LIGHT_VIDEO = "./images/wearShades.mp4";
const DARK_VIDEO = "./images/removeShades.mp4";

const LIGHT_VIDEO_SCALE = transitionVideo?.dataset.scaleLight || "1.16";
const DARK_VIDEO_SCALE = transitionVideo?.dataset.scaleDark || "1.19";

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

/* =========================================
   SAVE THEME
========================================= */

function saveTheme(dark) {
  localStorage.setItem("theme", dark ? "dark" : "light");
}

/* =========================================
   STOP PLAYBACK
========================================= */

function stopAllPlayback() {
  if (playForwardRAF) cancelAnimationFrame(playForwardRAF);

  if (rewindInterval) clearInterval(rewindInterval);

  playForwardRAF = null;
  rewindInterval = null;
}

/* =========================================
   APPLY THEME
========================================= */

function applyTheme(dark) {
  isDarkMode = dark;

  saveTheme(dark);

  if (dark) {
    html.classList.add("dark");

    toggleBtn.textContent = "☀️";

    heroImage.src = DARK_IMAGE;
  } else {
    html.classList.remove("dark");

    toggleBtn.textContent = "🌙";

    heroImage.src = LIGHT_IMAGE;
  }

  html.classList.remove("theme-transitioning");
}

/* =========================================
   VIDEO DISPLAY
========================================= */

function showVideo() {
  heroImage.style.opacity = "0";

  transitionVideo.style.display = "block";

  transitionVideo.classList.remove("opacity-0");

  transitionVideo.classList.add("opacity-100");

  // Apply the correct scale for the current video
  const isLight = transitionVideo.src.includes("wearShades");
  const scale = isLight ? LIGHT_VIDEO_SCALE : DARK_VIDEO_SCALE;
  transitionVideo.style.transform = `scale(${scale})`;
}

/* =========================================
   FINISH TRANSITION
========================================= */

function finishTheme(dark, runId) {
  if (runId !== transitionRunId) return;

  stopAllPlayback();

  isTransitioning = false;

  transitionDirection = 0;

  applyTheme(dark);

  heroImage.style.opacity = "1";

  transitionVideo.classList.remove("opacity-100");

  transitionVideo.classList.add("opacity-0");

  setTimeout(() => {
    transitionVideo.style.display = "none";
  }, 300);

  transitionVideo.pause();
}

/* =========================================
   PLAY VIDEO FORWARD
========================================= */

function playVideoForward(
  targetDark,
  startProgress = 0,
  originalDark = isDarkMode,
) {
  stopAllPlayback();

  transitionRunId++;

  const runId = transitionRunId;

  isTransitioning = true;

  transitionDirection = 1;

  transitionOriginalDark = originalDark;

  transitionTargetDark = targetDark;

  const nextVideo = targetDark ? DARK_VIDEO : LIGHT_VIDEO;

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

/* =========================================
   REVERSE VIDEO
========================================= */

function reverseVideo(targetDark) {
  stopAllPlayback();

  transitionRunId++;

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

  rewindInterval = setInterval(() => {
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

/* =========================================
   INITIAL THEME
========================================= */

applyTheme(isDarkMode);

transitionVideo.src = DARK_VIDEO;

transitionVideo.preload = "auto";

// Show main content immediately on initial load
const mainContent = document.getElementById("main-content");
if (mainContent) {
  mainContent.classList.remove("main-hidden");
  mainContent.classList.add("main-visible");
}

/* =========================================
   TOGGLE BUTTON
========================================= */

toggleBtn.addEventListener("click", () => {
  html.classList.add("theme-transitioning");

  if (isTransitioning) {
    if (transitionDirection === 1) {
      const returnToDark = transitionOriginalDark;

      reverseVideo(returnToDark);
    } else if (transitionDirection === -1) {
      const targetDark = transitionTargetDark;

      const duration = transitionVideo.duration || 1;

      const currentProgress = transitionVideo.currentTime / duration;

      playVideoForward(targetDark, currentProgress, transitionOriginalDark);
    }

    return;
  }

  const originalDark = isDarkMode;

  if (isDarkMode) {
    applyTheme(false);

    playVideoForward(false, 0, originalDark);

    return;
  }

  applyTheme(true);

  playVideoForward(true, 0, originalDark);
});
