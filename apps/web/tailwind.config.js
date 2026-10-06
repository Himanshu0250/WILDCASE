/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        case: {
          bg: '#0c0e11',
          surface: '#15181d',
          card: '#1b2027',
          border: '#2a313d',
          muted: '#7a8599',
          paper: '#f3ebd7',
          paperDark: '#e3d8be',
          ink: '#1e1c18',
          inkMuted: '#575246',
          amber: '#df9f28',
          amberGlow: '#ffb938',
          red: '#c23b2d',
          redStamp: '#a82c20',
          forest: '#132118',
          forestCard: '#1a2e22',
          moss: '#467458',
          cyan: '#5898ab',
          cyanGlow: '#7ec0d4'
        }
      },
      fontFamily: {
        serif: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'sonar-ping': 'sonar 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
        'scanline': 'scanline 8s linear infinite',
        'stamp-in': 'stampIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'paper-reveal': 'paperReveal 0.4s ease-out forwards'
      },
      keyframes: {
        sonar: {
          '0%': { transform: 'scale(0.8)', opacity: '0.9' },
          '70%': { transform: 'scale(1.8)', opacity: '0' },
          '100%': { transform: 'scale(2.2)', opacity: '0' }
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' }
        },
        stampIn: {
          '0%': { transform: 'scale(2.5) rotate(-15deg)', opacity: '0' },
          '70%': { transform: 'scale(0.95) rotate(-6deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(-8deg)', opacity: '1' }
        },
        paperReveal: {
          '0%': { transform: 'translateY(20px) rotateX(10deg)', opacity: '0' },
          '100%': { transform: 'translateY(0) rotateX(0deg)', opacity: '1' }
        }
      }
    }
  },
  plugins: []
};
