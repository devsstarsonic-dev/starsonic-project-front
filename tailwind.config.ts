import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-deep": "var(--bg-deep)",
        "bg-mid": "var(--bg-mid)",
        "bg-card": "var(--bg-card)",
        "bg-card-2": "var(--bg-card-2)",
        "bg-elev": "var(--bg-elev)",
        cyan1: "var(--cyan-1)",
        cyan2: "var(--cyan-2)",
        cyan3: "var(--cyan-3)",
        text1: "var(--text-1)",
        text2: "var(--text-2)",
        text3: "var(--text-3)",
        text4: "var(--text-4)",
      },
      fontFamily: {
        orbitron: ["var(--font-orbitron)", "sans-serif"],
        sora: ["var(--font-sora)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
