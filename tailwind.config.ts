import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#030303",
          secondary: "#0B0C0E",
        },
        surface: "rgba(255, 255, 255, 0.06)",
        border: "rgba(255, 255, 255, 0.10)",
        violet: {
          DEFAULT: "#8B5CF6",
          glow: "rgba(139, 92, 246, 0.3)",
        },
        status: {
          success: "#22C55E",
          error: "#EF4444",
          warning: "#F59E0B",
          neutral: "#94A3B8",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)"],
        mono: ["var(--font-jetbrains-mono)"],
      },
    },
  },
  plugins: [],
};
export default config;
