const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#2b5b2b",
          light: "#4f8a4f",
          dark: "#1d3f1d",
          muted: "#e8f2e8",
        },
      },
      fontFamily: {
        heading: ["Playfair Display", ...defaultTheme.fontFamily.serif],
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};

