const toggleBtn = document.getElementById("theme-toggle");
const html = document.documentElement;
const heroImage = document.getElementById("hero-image");
const transitionVideo = document.getElementById("transition-video");

const DARK_IMAGE = "./images/darkMode.png";
const LIGHT_IMAGE = "./images/lightMode.png";

// Dark → Light
const LIGHT_VIDEO = "./images/wearShades.mp4";

// Light → Dark
const DARK_VIDEO = "./images/removeShades.mp4";

let isTransitioning = false;
let isDarkMode = true;

let transitionOriginalDark = true;
let transitionTargetDark = true;
let transitionRunId = 0;

// 0 = not moving, 1 = playing forward, -1 = reversing
let transitionDirection = 0;

let playForwardRAF = null;
let rewindInterval = null;

// Stop any currently running playback loops
function stopAllPlayback() {
  if (playForwardRAF) cancelAnimationFrame(playForwardRAF);
  if (rewindInterval) clearInterval(rewindInterval);
  playForwardRAF = null;
  rewindInterval = null;
}

function applyTheme(dark) {
  isDarkMode = dark;

  if (dark) {
    html.classList.add("dark");
    toggleBtn.textContent = "☀️";
    heroImage.src = DARK_IMAGE;
  } else {
    html.classList.remove("dark");
    toggleBtn.textContent = "🌙";
    heroImage.src = LIGHT_IMAGE;
  }

  // Remove the transition-blocking class so normal transitions resume
  html.classList.remove("theme-transitioning");
}

function showVideo() {
  // Hide image immediately when button is pressed
  heroImage.style.visibility = "hidden";
  transitionVideo.classList.remove("hidden", "opacity-0");
  transitionVideo.classList.add("opacity-100");
}

function finishTheme(dark, runId) {
  if (runId !== transitionRunId) return;

  stopAllPlayback();
  isTransitioning = false;
  transitionDirection = 0;

  // Set the correct final image/theme immediately
  applyTheme(dark);

  // Instantly show the final image and hide video
  heroImage.style.visibility = "visible";
  transitionVideo.classList.remove("opacity-100");
  transitionVideo.classList.add("opacity-0", "hidden");
  transitionVideo.pause();
}

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

    // Play from 0, or resume from wherever it was paused/reversed
    const safeProgress = Math.min(Math.max(startProgress, 0), 1);
    transitionVideo.currentTime = duration * safeProgress;
    transitionVideo.playbackRate = 1;

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

// ---------------------------------------------------------
// StackOverflow approach: reverse using setInterval
// ---------------------------------------------------------
function reverseVideo(targetDark) {
  stopAllPlayback();

  transitionRunId++;
  const runId = transitionRunId;

  isTransitioning = true;
  transitionDirection = -1;

  showVideo();

  // Stop the normal forward video playback
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

    currentTime -= 0.04; // reverse speed

    if (currentTime <= 0) {
      transitionVideo.currentTime = 0;
      clearInterval(rewindInterval);
      rewindInterval = null;

      finishTheme(targetDark, runId);
      return;
    }

    transitionVideo.currentTime = currentTime;
  }, 30);
}

// Initial state: dark mode
applyTheme(true);
transitionVideo.src = DARK_VIDEO;
transitionVideo.preload = "auto";

toggleBtn.addEventListener("click", () => {
  // Disable CSS transitions during video playback
  html.classList.add("theme-transitioning");

  // If button is pressed mid-transition:
  if (isTransitioning) {
    if (transitionDirection === 1) {
      const returnToDark = transitionOriginalDark;

      // Do NOT call applyTheme(returnToDark) here.
      // Reverse the video first, then finishTheme() restores the theme.
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

  // Dark mode → Light mode
  if (isDarkMode) {
    applyTheme(false);
    playVideoForward(false, 0, originalDark);
    return;
  }

  // Light mode → Dark mode
  applyTheme(true);
  playVideoForward(true, 0, originalDark);
});
