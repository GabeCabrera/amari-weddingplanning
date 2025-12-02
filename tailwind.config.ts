import type { Config } from "tailwindcss";

/**
 * Aisle Design System
 * π-ID: 3.14159.4
 * 
 * A muted, warm palette with soft corners and subtle asymmetry.
 * The interface should feel like a deep breath.
 */

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        // π-ID: 3.14159.4.1 - Aisle Color Palette
        // Muted, warm, easy on the eyes
        
        // Canvas colors - the backgrounds
        canvas: {
          DEFAULT: "#F8F6F3",     // Main background - warm linen
          soft: "#FDFCFA",        // Elevated surfaces - soft cream
          deep: "#F2EFEA",        // Recessed areas - deeper warmth
        },

        // Ink colors - text and icons
        ink: {
          DEFAULT: "#3D3833",     // Primary text - warm charcoal
          soft: "#6B6560",        // Secondary text - muted
          faint: "#9C9691",       // Tertiary text - whisper
          inverse: "#FDFCFA",     // Text on dark backgrounds
        },

        // Stone colors - borders, dividers, subtle UI
        stone: {
          100: "#F2EFEA",
          200: "#E8E4DD",
          300: "#DDD8CF",
          400: "#CEC7BC",
          500: "#B8AFA3",
        },

        // Rose colors - primary accent, warmth
        rose: {
          100: "#FAF0EE",
          200: "#F5E1DD",
          300: "#EBCCC5",
          400: "#D4A69C",
          500: "#C4918A",
          600: "#A67169",
        },

        // Sage colors - secondary accent, calm
        sage: {
          100: "#F2F4F1",
          200: "#E3E8E0",
          300: "#CCD5C7",
          400: "#A8B8A0",
          500: "#8A9E82",
          600: "#6B7F64",
        },

        // Clay colors - tertiary, grounded
        clay: {
          100: "#F5F0EB",
          200: "#EBE2D8",
          300: "#DCD0C2",
          400: "#C4B5A4",
          500: "#A89580",
          600: "#8A7A68",
        },

        // Legacy warm colors (keeping for compatibility)
        warm: {
          50: "#FAF8F5",
          100: "#F5F0E8",
          200: "#E8E4DD",
          300: "#DDD8CF",
          400: "#CEC7BC",
          500: "#A89580",
          600: "#8A7A68",
          700: "#6B6560",
          800: "#4A4540",
          900: "#3D3833",
        },
      },

      fontFamily: {
        serif: ["Cormorant Garamond", "Georgia", "serif"],
        sans: ["Montserrat", "system-ui", "sans-serif"],
      },

      // π-ID: 3.14159.4.2 - Border Radius System
      // Soft, organic corners - no hard edges
      borderRadius: {
        // Standard radii
        'none': '0',
        'sm': '8px',
        'DEFAULT': '12px',
        'md': '16px',
        'lg': '20px',
        'xl': '24px',
        '2xl': '32px',
        '3xl': '40px',
        'full': '9999px',

        // Asymmetric radii for organic feel
        'soft': '16px 20px 16px 12px',      // Subtle asymmetry
        'organic': '24px 20px 28px 16px',   // More pronounced
        'pebble': '40px 32px 36px 28px',    // Large, varied
      },

      // π-ID: 3.14159.4.3 - Spacing and Rhythm
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },

      // π-ID: 3.14159.4.4 - Typography
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5' }],
        'sm': ['0.875rem', { lineHeight: '1.6' }],
        'base': ['1rem', { lineHeight: '1.7' }],
        'lg': ['1.125rem', { lineHeight: '1.6' }],
        'xl': ['1.25rem', { lineHeight: '1.5' }],
        '2xl': ['1.5rem', { lineHeight: '1.4' }],
        '3xl': ['1.875rem', { lineHeight: '1.3' }],
        '4xl': ['2.25rem', { lineHeight: '1.2' }],
      },

      // Shadows - soft, diffused, warm-tinted
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(61, 56, 51, 0.08)',
        'medium': '0 4px 16px -4px rgba(61, 56, 51, 0.10)',
        'lifted': '0 8px 24px -8px rgba(61, 56, 51, 0.12)',
        'floating': '0 12px 32px -12px rgba(61, 56, 51, 0.14)',
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
        "typewriter-cursor": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        "breathe": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.02)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "cursor-blink": "typewriter-cursor 1s ease-in-out infinite",
        "breathe": "breathe 4s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
