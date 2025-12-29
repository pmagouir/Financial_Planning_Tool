/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // The "Fintech" Dark Palette
        background: {
          DEFAULT: '#0f172a', // Slate 900 (Main BG)
          paper: '#1e293b',   // Slate 800 (Card BG)
          subtle: '#334155',  // Slate 700 (Borders/Input BG)
        },
        text: {
          primary: '#f8fafc',   // Slate 50
          secondary: '#94a3b8', // Slate 400
          muted: '#64748b',     // Slate 500
        },
        // "Electric" Data Colors
        accent: {
          primary: '#3b82f6',   // Electric Blue (Active/Primary)
          success: '#10b981',   // Emerald Green (Growth/Positive)
          warning: '#f59e0b',   // Amber (Alerts)
          danger: '#ef4444',    // Red (Shortfall/Negative)
          glow: 'rgba(59, 130, 246, 0.5)' // Glow effect color
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'], // Clean, modern sans
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(59, 130, 246, 0.1)',
        'glow-md': '0 0 20px rgba(59, 130, 246, 0.15)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.3)', // For glassmorphism
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(180deg, rgba(30, 41, 59, 0) 0%, rgba(30, 41, 59, 1) 100%)',
        'gradient-glow': 'radial-gradient(circle at center, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
      }
    },
  },
  plugins: [],
}
