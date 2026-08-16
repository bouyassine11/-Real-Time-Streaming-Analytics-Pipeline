/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      colors: {
        brand: {
          50: "#eef9ff",
          100: "#d8f1ff",
          200: "#b9e8ff",
          300: "#89dbff",
          400: "#51c5ff",
          500: "#29a7ff",
          600: "#0d8af5",
          700: "#0672e1",
          800: "#0b5cb6",
          900: "#104f8f",
          950: "#103057",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
