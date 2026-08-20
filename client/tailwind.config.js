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
        // NARVEX Meaning-Driven Color System
        'deep-space': '#0B0F19',
        'panel-gray': '#111827',
        'neon-cyan': {
          DEFAULT: '#22D3EE',
          dim: '#06B6D4',
          glow: 'rgba(34, 211, 238, 0.4)',
        },
        'signal-red': {
          DEFAULT: '#EF4444',
          dark: '#991B1B',
          glow: 'rgba(239, 68, 68, 0.4)',
        },
        'alert-orange': {
          DEFAULT: '#F97316',
          dark: '#9A3412',
          glow: 'rgba(249, 115, 22, 0.4)',
        },
        'watch-yellow': {
          DEFAULT: '#EAB308',
          dark: '#854D0E',
          glow: 'rgba(234, 179, 8, 0.4)',
        },
        'info-blue': {
          DEFAULT: '#3B82F6',
          dark: '#1E40AF',
        },
        'ai-purple': {
          DEFAULT: '#A855F7',
          dark: '#6B21A8',
          glow: 'rgba(168, 85, 247, 0.4)',
        },
        'success-green': {
          DEFAULT: '#10B981',
          dark: '#065F46',
          glow: 'rgba(16, 185, 129, 0.4)',
        },
        intel: {
          950: '#070b14',
          900: '#0B0F19', // Deep space
          850: '#0f172a',
          800: '#111827', // Panel gray
          700: '#1e293b',
          600: '#334155',
          500: '#475569',
          400: '#64748b',
          300: '#94a3b8',
          200: '#cbd5e1',
          100: '#e2e8f0',
          50: '#f8fafc',
        }
      },
      fontFamily: {
        space: ['"Space Grotesk"', 'sans-serif'],
        inter: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      letterSpacing: {
        'header': '1px',
        tight: '-0.02em',
        tighter: '-0.03em',
        normal: '0em',
        wide: '0.025em',
      },
      boxShadow: {
        'glow-cyan': '0 0 15px -2px rgba(34, 211, 238, 0.45)',
        'glow-cyan-lg': '0 0 25px -3px rgba(34, 211, 238, 0.55)',
        'glow-red': '0 0 15px -2px rgba(239, 68, 68, 0.45)',
        'glow-purple': '0 0 15px -2px rgba(168, 85, 247, 0.45)',
        'glow-orange': '0 0 15px -2px rgba(249, 115, 22, 0.45)',
      }
    },
  },
  plugins: [],
}
