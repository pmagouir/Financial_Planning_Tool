/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Extracted from app.R lines 17-27
        shiny: {
          text: '#2c3e50',      // --text-primary
          muted: '#7f8c8d',     // --text-secondary
          border: '#e8ecef',    // --surface-border
          surface: '#f8f9fa',   // --surface-light
        }
      },
      backgroundImage: {
        // Exact gradients from app.R lines 16-20
        'shiny-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'shiny-success': 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        'shiny-warning': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'shiny-info': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'shiny-neutral': 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)',
      },
      boxShadow: {
        'shiny-card': '0 10px 40px rgba(0,0,0,0.12)', // --shadow-lg
        'shiny-hover': '0 20px 60px rgba(0,0,0,0.15)', // --shadow-xl
        'shiny-glass': '0 5px 20px rgba(0,0,0,0.08)',  // --shadow-md
      }
    },
  },
  plugins: [],
}
