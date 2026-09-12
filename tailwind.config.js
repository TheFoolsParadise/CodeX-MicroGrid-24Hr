/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        grid: {
          950: '#06090e',
          900: '#0a0e17',
          850: '#0f1523',
          800: '#141d30',
          750: '#1a243c',
          700: '#23304e',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-bright': 'rgba(255, 255, 255, 0.16)'
        },
        market: {
          green: '#10b981',
          'green-glow': 'rgba(16, 185, 129, 0.25)',
          amber: '#f59e0b',
          'amber-glow': 'rgba(245, 158, 11, 0.25)',
          red: '#ef4444',
          'red-glow': 'rgba(239, 68, 68, 0.25)',
          cyan: '#06b6d4',
          'cyan-glow': 'rgba(6, 182, 212, 0.25)',
          blue: '#3b82f6',
          violet: '#8b5cf6'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      }
    },
  },
  plugins: [],
}
