/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        legal: {
          navy: "#0c1b33",
          ink: "#172033",
          gold: "#b9934a",
          softGold: "#f4ead6",
          mist: "#f5f7fb",
        },
      },
      fontFamily: {
        sans: ["Tahoma", "Arial", "sans-serif"],
      },
      boxShadow: {
        panel: "0 16px 40px rgba(12, 27, 51, 0.08)",
      },
    },
  },
  plugins: [],
};
