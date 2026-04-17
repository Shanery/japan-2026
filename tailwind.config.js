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
        serif: ['"Shippori Mincho B1"', '"Noto Serif JP"', 'Georgia', 'serif'],
      },
      colors: {
        washi: {
          50: '#FBF9F4',
          100: '#F5F1E8',
          200: '#E8E0CE',
          300: '#D9CFB5',
        },
        sumi: {
          100: '#F0EFF0',
          200: '#E3E2E4',
          300: '#C6C5C8',
          400: '#9A9AA0',
          500: '#6F6F76',
          600: '#55555C',
          700: '#3D3D42',
          800: '#2B2B2E',
          900: '#1A1A1A',
        },
        ai: {
          50: '#EEF2F7',
          100: '#D7DFEB',
          200: '#A7B5CC',
          300: '#6E86AC',
          400: '#3F5C8A',
          500: '#1F3A68',
          600: '#17305A',
          700: '#122749',
          800: '#0E1E3A',
          900: '#0A162D',
        },
        shu: '#B54C3A',
        matcha: {
          400: '#8BA67A',
          500: '#6E8B5F',
          600: '#587049',
        },
      },
      letterSpacing: {
        'mincho': '0.04em',
        'mincho-wide': '0.12em',
      },
      boxShadow: {
        'washi': '0 1px 2px 0 rgba(26, 26, 26, 0.04)',
        'washi-hover': '0 2px 8px 0 rgba(26, 26, 26, 0.06)',
      },
    },
  },
  plugins: [],
}
