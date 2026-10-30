const colors = require("./config/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./context/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: colors.ink,
        paper: colors.paper,
        surface: colors.surface,
        border: colors.border,
        seal: colors.seal,
        ledger: colors.ledger,
        signal: colors.signal,
        danger: colors.danger,
        navbar: colors.navbar,
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.96) translateY(4px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "bump": {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.35)" },
          "100%": { transform: "scale(1)" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(31,111,99,0.35)" },
          "100%": { boxShadow: "0 0 0 10px rgba(31,111,99,0)" },
        },
        "toast-in": {
          "0%": { opacity: "0", transform: "translateY(-8px) scale(0.97)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "toast-out": {
          "0%": { opacity: "1", transform: "translateX(0) scale(1)" },
          "100%": { opacity: "0", transform: "translateX(16px) scale(0.97)" },
        },
      },
      animation: {
        "pop-in": "pop-in 0.18s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "bump": "bump 0.35s ease-out",
        "pulse-ring": "pulse-ring 1.6s cubic-bezier(0.4,0,0.6,1) infinite",
        "toast-in": "toast-in 0.22s cubic-bezier(0.21,1.02,0.73,1)",
        "toast-out": "toast-out 0.2s ease-in forwards",
      },
    },
  },
  plugins: [],
};
