/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  // Toggle dark mode by adding/removing the `dark` class on <html>.
  // App.jsx keeps that class in sync with the Redux theme slice.
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Existing brand colours (carried over from the static homework)
        navy: "#23155B",
        purple: "#8053FF",
        muted: "#817d8e",
        light: "#f4f4f4",
        skyblue: "#4AA3DF",
        // Theme colours from the "Application Introduction" brief.
        // Registered now for use by later assignments (navbar, app shell).
        navbar: {
          light: "#E5E7EB",
          dark: "#23155B",
        },
        appbg: {
          light: "#CBD5E1",
          dark: "#4322C9A3",
        },
      },
      fontFamily: {
        martel: ["Martel Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
