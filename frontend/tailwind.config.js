/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // <-- Ye line components ko scan karegi
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}