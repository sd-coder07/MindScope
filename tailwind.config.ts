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
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
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
        // Mental Health Color Palette
        serenity: {
          50: '#F8F7FF',
          100: '#F0EFFF',
          200: '#E5E2FF',
          300: '#D0CBFF',
          400: '#B5A7E6',
          500: '#9A8CD1',
          600: '#7F71BC',
          700: '#6456A7',
          800: '#493B92',
          900: '#2E207D',
        },
        healing: {
          50: '#F7FDFD',
          100: '#E8F6F7',
          200: '#D1EDEF',
          300: '#A8DADC',
          400: '#7FC7C9',
          500: '#56B4B6',
          600: '#2DA1A3',
          700: '#248E90',
          800: '#1B7B7D',
          900: '#12686A',
        },
        warm: {
          50: '#FEFFFE',
          100: '#F1FAEE',
          200: '#E3F5DD',
          300: '#D5F0CC',
          400: '#C7EBBB',
          500: '#B9E6AA',
          600: '#ABE199',
          700: '#9DDC88',
          800: '#8FD777',
          900: '#81D266',
        },
        ocean: {
          50: '#F2F7FB',
          100: '#E5EFF7',
          200: '#CBDFF0',
          300: '#B1CFE8',
          400: '#97BFE1',
          500: '#7DAFD9',
          600: '#639FD2',
          700: '#498FCA',
          800: '#457B9D',
          900: '#3A6A8A',
        },
        sunset: {
          50: '#FFF9F9',
          100: '#FFF3F3',
          200: '#FFE7E7',
          300: '#FFDBDB',
          400: '#FFCFCF',
          500: '#FFC3C3',
          600: '#FFB3BA',
          700: '#FFA3A3',
          800: '#FF9797',
          900: '#FF8B8B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        therapy: ['Poppins', 'ui-sans-serif', 'system-ui'],
      },
      animation: {
        'breathe': 'breathe 4s ease-in-out infinite',
        'pulse-gentle': 'pulse-gentle 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'ripple': 'ripple 0.6s linear',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        'pulse-gentle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        ripple: {
          to: {
            transform: 'scale(4)',
            opacity: '0',
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
