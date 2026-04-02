/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'row-threshold', 'row-manual', 'row-even', 'row-odd',
    'skeleton-pulse', 'animate-spin-fast', 'sort-icon', 'sortable-th',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: { DEFAULT: '#6366f1', dark: '#4f46e5', light: '#818cf8' },
        surface: { DEFAULT: '#ffffff', raised: '#f8fafc', sunken: '#eef0f7' },
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        soft:  '0 2px 8px rgba(0,0,0,0.07)',
        card:  '0 4px 16px rgba(0,0,0,0.10)',
        glow:  '0 0 20px rgba(99,102,241,0.45)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}

