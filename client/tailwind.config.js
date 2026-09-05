/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0A0C10',
          900: '#0F1319',
          850: '#121620',
          800: '#171B24',
          700: '#1E232F',
          600: '#262B38',
          border: '#262B38',
        },
        brass: {
          200: '#EBDCB8',
          300: '#DFC594',
          400: '#D2AE70',
          500: '#C9A25D',
          600: '#B08842',
          700: '#8F6C31',
        },
        success: { DEFAULT: '#3FA772', soft: 'rgba(63,167,114,0.12)' },
        danger: { DEFAULT: '#C4544A', soft: 'rgba(196,84,74,0.12)' },
        warn: { DEFAULT: '#C97A3D', soft: 'rgba(201,122,61,0.12)' },
        info: { DEFAULT: '#4E8FC4', soft: 'rgba(78,143,196,0.12)' },
        brand: {
          400: '#D2AE70',
          500: '#C9A25D',
          600: '#B08842',
          700: '#8F6C31',
        },
      },
      fontFamily: {
        serif: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
