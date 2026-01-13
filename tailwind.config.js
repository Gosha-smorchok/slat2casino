/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#020617", // Slate 950
        primary: "#8b5cf6", // Violet 500
        secondary: "#ec4899", // Pink 500
        accent: "#10b981", // Emerald 500
        danger: "#ef4444", // Red 500
        warning: "#f59e0b", // Amber 500
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
