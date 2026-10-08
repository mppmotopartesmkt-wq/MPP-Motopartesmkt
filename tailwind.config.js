/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lime: {
          DEFAULT: '#84cc16', // Vibrant lime green
          bright: '#a3e635',
          neon: '#bef264',
          dark: '#65a30d',
          hover: '#9ae62d',
          light: '#ecfccb'
        },
        dark: {
          950: '#0a0a0c',
          900: '#111114',
          850: '#151518',
          800: '#1b1b1f',
          750: '#222227',
          700: '#2a2a32',
          600: '#383842'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Oswald', 'Montserrat', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
