/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon': {
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
        }
      },
      boxShadow: {
        'glow': '0 0 8px rgba(74, 222, 128, 0.4), 0 0 12px rgba(74, 222, 128, 0.3)',
        'glow-soft': '0 0 5px rgba(74, 222, 128, 0.2), 0 0 8px rgba(74, 222, 128, 0.1)',
      }
    },
  },
  plugins: [],
} 