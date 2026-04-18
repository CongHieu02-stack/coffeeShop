/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./packages/frontend/index.html",
    "./packages/frontend/src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#a0938e',
          600: '#816d64',
          700: '#6f5b53',
          800: '#5d4b44',
          900: '#4a3b35',
          950: '#382d28',
        },
        coffee: {
          50: '#faf6f1',
          100: '#f0e6d8',
          200: '#e6d2bf',
          300: '#d4b896',
          400: '#c49a6c',
          500: '#b8834f',
          600: '#a67040',
          700: '#8a5a33',
          800: '#724a2d',
          900: '#5c3b24',
          950: '#4a2e1c',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
