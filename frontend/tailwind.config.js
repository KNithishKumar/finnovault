/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  darkMode: "class",

  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        candara: ["Candara", "sans-serif"],
      },

      colors: {
        primary: {
          DEFAULT: "#1E3A5F",
          light: "#2F5D8A",
          dark: "#162D49",
        },

        secondary: {
          DEFAULT: "#64748B",
          light: "#94A3B8",
          dark: "#475569",
        },

        accent: {
          DEFAULT: "#16A34A",
          light: "#22C55E",
          dark: "#15803D",
        },

        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F8FAFC",
          soft: "#F1F5F9",
        },

        ink: {
          DEFAULT: "#172033",
          muted: "#64748B",
          light: "#94A3B8",
        },

        border: {
          DEFAULT: "#E2E8F0",
          dark: "#334155",
        },

        danger: {
          DEFAULT: "#DC2626",
          light: "#EF4444",
          dark: "#B91C1C",
        },

        warning: {
          DEFAULT: "#D97706",
          light: "#F59E0B",
          dark: "#B45309",
        },
      },

      boxShadow: {
        soft:
          "0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)",

        card:
          "0 4px 12px rgba(15, 23, 42, 0.05)",

        elevated:
          "0 10px 30px rgba(15, 23, 42, 0.08)",

        input:
          "0 0 0 3px rgba(30, 58, 95, 0.10)",
      },

      borderRadius: {
        card: "12px",
        button: "8px",
      },

      transitionDuration: {
        DEFAULT: "180ms",
      },
    },
  },

  plugins: [],
};