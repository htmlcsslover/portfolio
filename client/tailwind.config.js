/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "./src/**/*.css"],
  darkMode: "class",

  theme: {
    // Custom spacing system - carefully designed for visual rhythm
    spacing: {
      0: "0",
      1: "0.25rem",
      2: "0.5rem",
      3: "0.75rem",
      4: "1rem",
      5: "1.25rem",
      6: "1.5rem",
      7: "1.75rem",
      8: "2rem",
      10: "2.5rem",
      12: "3rem",
      14: "3.5rem",
      16: "4rem",
      20: "5rem",
      24: "6rem",
      28: "7rem",
      32: "8rem",
      36: "9rem",
      40: "10rem",
    },

    // Color system - reduced from Tailwind defaults
    colors: {
      inherit: "inherit",
      transparent: "transparent",
      current: "currentColor",

      // Neutral scale
      white: "#ffffff",
      black: "#000000",

      // Brand colors - custom
      brand: {
        ink: "#070711",
        pink: "#ff2bd6",
        purple: "#8b5cf6",
        cyan: "#67e8f9",
      },

      // Semantic colors for glass effects
      glass: {
        light: "rgba(255, 255, 255, 0.1)",
        lighter: "rgba(255, 255, 255, 0.18)",
        lightest: "rgba(255, 255, 255, 0.28)",
        dark: "rgba(0, 0, 0, 0.2)",
      },
    },

    // Typography - Google Fonts
    fontFamily: {
      sans: [
        "Manrope",
        "ui-sans-serif",
        "system-ui",
        "-apple-system",
        "sans-serif",
      ],
      title: ["Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
    },

    fontSize: {
      xs: ["0.75rem", { lineHeight: "1rem" }],
      sm: ["0.875rem", { lineHeight: "1.25rem" }],
      base: ["1rem", { lineHeight: "1.5rem" }],
      lg: ["1.125rem", { lineHeight: "1.75rem" }],
      xl: ["1.25rem", { lineHeight: "1.75rem" }],
      "2xl": ["1.5rem", { lineHeight: "2rem" }],
      "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
      "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
      "5xl": ["3rem", { lineHeight: "1" }],
      "6xl": ["3.75rem", { lineHeight: "1" }],
      "7xl": ["4.5rem", { lineHeight: "1" }],
      "8xl": ["6rem", { lineHeight: "1" }],
    },

    // Performance: limit variants
    extend: {
      // Custom properties for CSS variables
      opacity: {
        12: "0.12",
        18: "0.18",
        24: "0.24",
        28: "0.28",
        32: "0.32",
        34: "0.34",
        42: "0.42",
        58: "0.58",
        66: "0.66",
        68: "0.68",
        72: "0.72",
        75: "0.75",
        82: "0.82",
      },

      // Backdrop filter replacement (use sparingly)
      backdropFilter: {
        none: "none",
        sm: "blur(4px)",
        md: "blur(12px)",
        lg: "blur(16px)",
      },

      // Minimal custom animations
      animation: {
        "float-soft": "float-soft 12s ease-in-out infinite",
        "bounce-soft": "bounce-soft 2.8s ease-in-out infinite",
        blink: "blink 900ms steps(2, start) infinite",
      },

      keyframes: {
        "float-soft": {
          "0%, 100%": {
            transform: "translate3d(0, 0, 0)",
          },
          "50%": {
            transform: "translate3d(2rem, -1.5rem, 0)",
          },
        },
        "bounce-soft": {
          "0%, 100%": {
            transform: "translateY(0)",
          },
          "50%": {
            transform: "translateY(0.5rem)",
          },
        },
        blink: {
          "50%": {
            opacity: "0",
          },
        },
      },

      // Box shadows - optimized
      boxShadow: {
        glass: "0 24px 90px rgba(0, 0, 0, 0.42)",
        "glass-sm": "0 8px 24px rgba(0, 0, 0, 0.2)",
        "glow-pink": "0 0 22px rgba(255, 43, 214, 0.45)",
        "glow-cyan": "0 18px 48px rgba(103, 232, 249, 0.18)",
      },

      // Border radius - glass-like
      borderRadius: {
        xl: "1.6rem",
        "2xl": "2rem",
        "3xl": "2.5rem",
      },

      // Transition timing - performance optimized
      transitionDuration: {
        180: "180ms",
        250: "250ms",
        350: "350ms",
        400: "400ms",
        500: "500ms",
      },

      transitionTimingFunction: {
        glass: "cubic-bezier(0.4, 0, 0.2, 1)",
        smooth: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      },

      // Performance: will-change only for specific states
      willChange: {
        transform: "transform",
        opacity: "opacity",
        auto: "auto",
      },

      // Z-index scale
      zIndex: {
        hide: "-1",
        auto: "auto",
        0: "0",
        1: "1",
        10: "10",
        20: "20",
        30: "30",
        40: "40",
        50: "50",
        nav: "9999",
      },

      // Custom clip paths for glass effects
      clipPath: {
        none: "none",
        inset: "inset(0.75rem)",
      },
    },
  },

  corePlugins: {
    // Disable unused utilities to reduce CSS size
    aspectRatio: true,
    container: false,
    divideColor: true,
    divideOpacity: true,
    divideStyle: true,
    divideWidth: true,
  },

  plugins: [
    // Custom plugin for performance-focused utilities
    function ({ addUtilities }) {
      const newUtilities = {
        ".gpu-accelerate": {
          transform: "translateZ(0)",
          "backface-visibility": "hidden",
          perspective: "1000px",
        },
        ".no-motion": {
          "@media (prefers-reduced-motion: reduce)": {
            animation: "none !important",
            transition: "none !important",
          },
        },
        ".safe-tap": {
          transform: "translate(var(--x, 0), var(--y, 0))",
          "will-change": "transform",
          transition: "transform 200ms ease",
        },
      };

      addUtilities(newUtilities);
    },
  ],
};
