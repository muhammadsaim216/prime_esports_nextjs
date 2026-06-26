import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border:      "hsl(var(--border))",
        input:       "hsl(var(--input))",
        ring:        "hsl(var(--ring))",
        background:  "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // ── Midnight Neon semantic palette ──
        neon: {
          mint:   "#15FFB5",
          cobalt: "#3D5AFE",
          glow:   "rgba(21,255,181,0.25)",
        },
        void: {
          950: "#06070A",
          900: "#0A0B10",
          800: "#11131A",
          700: "#181B24",
          600: "#1E2028",
          500: "#2A2D38",
          400: "#3E4250",
          300: "#5A6070",
          200: "#8A90A0",
          100: "#B8BEC8",
          50:  "#E8EBF0",
        },
      },
      borderRadius: {
        lg:  "var(--radius)",          /* 12px */
        md:  "calc(var(--radius) - 4px)", /* 8px */
        sm:  "calc(var(--radius) - 8px)", /* 4px */
      },
      fontFamily: {
        sans:    ["var(--font-sans)"],
        display: ["var(--font-display)"],
        serif:   ["var(--font-serif)"],
        mono:    ["var(--font-mono)"],
      },
      backgroundImage: {
        "neon-gradient": "linear-gradient(135deg, #15FFB5 0%, #3D5AFE 100%)",
        "neon-gradient-v": "linear-gradient(180deg, #15FFB5 0%, #3D5AFE 100%)",
        "surface-glass": "rgba(255,255,255,0.03)",
      },
      boxShadow: {
        "neon":        "0 0 20px rgba(21,255,181,0.25), 0 0 48px rgba(21,255,181,0.08)",
        "neon-strong": "0 0 32px rgba(21,255,181,0.40), 0 0 64px rgba(21,255,181,0.15)",
        "neon-cobalt": "0 0 20px rgba(61,90,254,0.20), 0 0 48px rgba(61,90,254,0.06)",
        "card":        "0 2px 12px rgba(0,0,0,0.6)",
        "card-hover":  "0 8px 32px rgba(0,0,0,0.7)",
      },
      keyframes: {
        marquee: {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "neon-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.5" },
        },
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
      },
      animation: {
        "marquee":        "marquee 30s linear infinite",
        "neon-pulse":     "neon-pulse 2.5s ease-in-out infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;