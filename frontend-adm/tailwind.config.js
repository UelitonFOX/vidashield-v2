/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'neon-green': '#4ade80',
        'neon-green-dark': '#3cb371',
        'green': {
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a'
        },
        'zinc': {
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b'
        },
        'red': {
          500: '#ef4444'
        },
        'yellow': {
          400: '#facc15'
        },
        'cyan': {
          500: '#06b6d4'
        }
      },
      boxShadow: {
        'glow': '0 0 8px rgba(74, 222, 128, 0.4), 0 0 12px rgba(74, 222, 128, 0.3)',
        'glow-soft': '0 0 5px rgba(74, 222, 128, 0.2), 0 0 8px rgba(74, 222, 128, 0.1)',
      },
      backgroundColor: {
        'dark': '#1e1e1e',
        'darker': '#101010',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} 