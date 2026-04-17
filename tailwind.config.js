/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans JP"', 'system-ui', 'sans-serif'],
      },
      colors: {
        sakura: {
          50: '#fef2f4',
          100: '#fde6ea',
          200: '#fbd0d9',
          300: '#f7aabb',
          400: '#f27a97',
          500: '#e74d75',
          600: '#d42a5e',
          700: '#b21e4e',
          800: '#951c47',
          900: '#801b42',
        },
        japan: {
          red: '#BC002D',
          black: '#1a1a2e',
          gold: '#C9A959',
          cream: '#FAF7F0',
          slate: '#2D3436',
        }
      }
    },
  },
  plugins: [],
}
