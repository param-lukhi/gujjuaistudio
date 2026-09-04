import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#080B11",
        surface: {
          50: "#131927",
          100: "#1A2234",
          200: "#222C42",
          300: "#2D3B56",
        },
        brand: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          glow: "#38BDF8",
        },
        accent: {
          cyan: "#06B6D4",
          violet: "#8B5CF6",
          purple: "#A855F7",
        }
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.25) 0%, rgba(139, 92, 246, 0.15) 35%, rgba(8, 11, 17, 0) 70%)',
        'blue-glow': 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(8,11,17,0) 70%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
        'card-gradient': 'linear-gradient(180deg, rgba(26, 34, 52, 0.7) 0%, rgba(19, 25, 39, 0.9) 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)' },
          '100%': { boxShadow: '0 0 35px rgba(59, 130, 246, 0.7)' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
