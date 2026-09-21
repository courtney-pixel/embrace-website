/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'em-blue': '#0d00a4',
        'em-purple': '#7209b7',
        'em-cream': '#f8f4ed',
        'em-dark': '#0d0d0d',
      },
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
