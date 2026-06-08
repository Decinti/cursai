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
        background: "#0d0d0d",
        surface: "#111827",
        border: "#1f2937",
        mint: "#4ade80",
        electric: "#38bdf8",
        muted: "#6b7280",
        subtle: "#374151",
      },
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
      },
      keyframes: {
        pulse_wave: {
          "0%, 100%": { transform: "scaleY(0.4)" },
          "50%": { transform: "scaleY(1)" },
        },
        glow: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        pulse_wave: "pulse_wave 0.8s ease-in-out infinite",
        glow: "glow 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
