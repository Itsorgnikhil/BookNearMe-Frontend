/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#FF385C',
          dark: '#E01A4F',
          light: '#FF5A79',
          bg: '#FFFafb',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 6px 20px rgba(0,0,0,0.06)',
        'premium-hover': '0 12px 30px rgba(0,0,0,0.12)',
        'subtle': '0 2px 8px rgba(0,0,0,0.04)',
      }
    },
  },
  plugins: [],
}
