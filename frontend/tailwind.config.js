/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0B0E14',
          card: '#151921',
          hover: '#1E232E',
          border: '#2A303C',
          accent: '#2563EB',
          green: '#10B981',
          red: '#EF4444',
          yellow: '#F59E0B',
          text: '#9CA3AF',
          heading: '#F3F4F6'
        }
      }
    },
  },
  plugins: [],
}
