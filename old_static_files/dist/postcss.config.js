export default {
  plugins: {
    // Import CSS files in order
    'postcss-import': {},

    // Tailwind CSS - processes custom syntax and utilities
    'tailwindcss': {},

    // Autoprefixer - adds vendor prefixes for browser compatibility
    'autoprefixer': {
      overrideBrowserslist: [
        '> 0.5%',
        'last 2 versions',
        'Firefox ESR',
        'not dead',
        'not IE 11',
      ],
      // Only add prefixes for properties that need them
      add: true,
      remove: true,
      supports: true,
      flexbox: true,
      grid: 'autoplace',
    },
  },
}
