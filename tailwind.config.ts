import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F8F9FB",
        surface: "#FFFFFF",
        "text-primary": "#1A1D23",
        "text-secondary": "#6B7280",
        "text-tertiary": "#9CA3AF",
        border: "#E5E7EB",
        accent: "#2563EB",
        "accent-light": "#EFF6FF",
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        mono: ["DM Mono", "monospace"],
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.06)",
        "card-hover": "0 4px 12px 0 rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
