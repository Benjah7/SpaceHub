import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#2D5F5D',
          secondary: '#F4A261',
          accent: '#E76F51',
        },
        neutral: {
          bg: '#FAFAFA',
          surface: '#FFFFFF',
          'text-primary': '#1A1A1A',
          'text-secondary': '#6B6B6B',
          border: '#E0E0E0',
        },
        status: {
          success: '#2A9D8F',
          warning: '#F4A261',
          error: '#E76F51',
          info: '#264653',
        },
      },
      fontFamily: {
        display: ['Bricolage Grotesque', 'sans-serif'],
        sans: ['IBM Plex Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        // Extreme size jumps (3x+ difference between levels)
        'display': ['72px', { lineHeight: '1.1', fontWeight: '800', letterSpacing: '-0.02em' }],
        'h1': ['48px', { lineHeight: '1.2', fontWeight: '800', letterSpacing: '-0.01em' }],
        'h2': ['32px', { lineHeight: '1.3', fontWeight: '700', letterSpacing: '-0.01em' }],
        'h3': ['24px', { lineHeight: '1.4', fontWeight: '700' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'body': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'tiny': ['12px', { lineHeight: '1.5', fontWeight: '500' }],
        // Data/numeric text - uses mono font
        'price-lg': ['36px', { lineHeight: '1.2', fontWeight: '700', letterSpacing: '-0.01em' }],
        'price': ['24px', { lineHeight: '1.3', fontWeight: '700' }],
        'data': ['14px', { lineHeight: '1.4', fontWeight: '500' }],
      },
      fontWeight: {
        // Extreme weight contrast
        'thin': '200',
        'light': '300',
        'normal': '400',
        'medium': '500',
        'bold': '700',
        'black': '800',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
        '3xl': '64px',
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0,0,0,0.08)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.12)',
      },
      maxWidth: {
        'container': '1280px',
      },
    },
  },
  plugins: [],
};

export default config;