/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-green': '#39ff14',
        'neon-blue': '#646cff',
        'neon-red': '#ff4444',
      },
      dropShadow: {
        'neon-blue': '0 0 2em #646cffaa',
        'neon-cyan': '0 0 2em #61dafbaa',
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite',
      },
      boxShadow: {
        'neon-green': '0 0 5px #39ff14',
      }
    },
  },
  plugins: [],
}
