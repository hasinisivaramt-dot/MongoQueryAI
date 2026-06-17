/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        navy: {
          950: '#020817',
          900: '#030d1a',
          800: '#061225',
          700: '#0a1f3d',
          600: '#0e2d57',
        },
        cyan: {
          glow: '#00f5ff',
          mid: '#00c8e6',
          soft: '#7ff3ff',
        },
        blue: {
          electric: '#0066ff',
          neon: '#4d9eff',
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
        'counter': 'counter 2s ease-out forwards',
        'scanline': 'scanline 3s linear infinite',
        'orbit': 'orbit 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 245, 255, 0.3)' },
          '50%': { boxShadow: '0 0 60px rgba(0, 245, 255, 0.8)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(300px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(300px) rotate(-360deg)' },
        }
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(0,245,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.03) 1px, transparent 1px)',
        'radial-glow': 'radial-gradient(ellipse at center, rgba(0,102,255,0.15) 0%, transparent 70%)',
      },
      backgroundSize: {
        'grid': '60px 60px',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
