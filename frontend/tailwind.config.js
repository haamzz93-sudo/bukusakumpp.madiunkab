/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        madiun: {
          deep: '#064E3B',       // Forest deep Pemkab Madiun
          forest: '#065F46',     // Base forest green
          emerald: '#047857',    // Emerald vibrant
          vibrant: '#059669',    // Vibrant green
          soft: '#E6F4EA',       // Soft mint tint
          border: '#D1E7DD',
        },
        mpp: {
          gold: '#F59E0B',       // Warm yellow/gold
          yellow: '#EAB308',     // Accent yellow
          bright: '#FACC15',     // High-contrast button
          soft: '#FEF3C7',
        },
        darkbg: {
          base: '#0B2019',       // Deep forest night
          surface: '#123228',    // Surface dark green
          border: '#1B473A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
