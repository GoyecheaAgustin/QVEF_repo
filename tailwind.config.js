/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: '#0F1E36',
        pitch: '#10B981',
        gold: '#C5A869',
      }
    },
  },
  plugins: [],
}
