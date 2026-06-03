/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        mare: {
          base: '#001845',
          panel: '#023E7D',
          elevated: '#0353A4',
          cyan: '#00B4D8',
          teal: '#90E0EF',
          textPrimary: '#CAF0F8',
          textSecondary: '#ADE8F4',
          green: '#2EC4B6',
          red: '#E71D36',
          amber: '#FF9F1C',
        },
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        glow: '0 0 20px rgba(0, 180, 216, 0.15)',
        'glow-red': '0 0 20px rgba(231, 29, 54, 0.2)',
        'glow-green': '0 0 20px rgba(46, 196, 182, 0.2)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 6px rgba(46, 196, 182, 0.4)" },
          "50%": { boxShadow: "0 0 12px rgba(46, 196, 182, 0.7)" },
        },
        "pulse-red": {
          "0%, 100%": { boxShadow: "0 0 6px rgba(231, 29, 54, 0.4)" },
          "50%": { boxShadow: "0 0 12px rgba(231, 29, 54, 0.7)" },
        },
        "pulse-amber": {
          "0%, 100%": { boxShadow: "0 0 6px rgba(255, 159, 28, 0.4)" },
          "50%": { boxShadow: "0 0 12px rgba(255, 159, 28, 0.7)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "pulse-red": "pulse-red 1.5s ease-in-out infinite",
        "pulse-amber": "pulse-amber 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
