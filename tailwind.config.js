/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        f1red:   '#E8002D',
        f1dark:  '#0A0A0A',
        f1grey:  '#1A1A1A',
        f1mid:   '#2A2A2A',
        f1light: '#3A3A3A',
        f1muted: '#6B6B6B',
        f1white: '#F5F5F5',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body:    ['var(--font-body)',    'sans-serif'],
        mono:    ['var(--font-mono)',    'monospace'],
      },
      animation: {
        'fade-up':   'fadeUp 0.5s ease forwards',
        'fade-in':   'fadeIn 0.4s ease forwards',
        'pulse-red': 'pulseRed 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseRed: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(232,0,45,0)' },
          '50%':      { boxShadow: '0 0 0 6px rgba(232,0,45,0.15)' },
        },
      },
    },
  },
  plugins: [],
}
