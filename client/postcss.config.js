// PostCSS is a tool that transforms CSS with JavaScript plugins.
// Tailwind CSS is a PostCSS plugin. Autoprefixer is another common PostCSS plugin
// that automatically adds vendor prefixes to CSS rules.
export default {
  plugins: {
    // Use the new package for the PostCSS plugin
    '@tailwindcss/postcss': {}, // <--- THIS IS THE NEW WAY for PostCSS plugin
    autoprefixer: {},
  },
}