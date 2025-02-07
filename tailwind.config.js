/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors
        starlight: {
          green: '#2A4B3C',
          light: '#34D399',
          dark: '#1F3A2D',
        },
        cohere: {
          blue: '#88C0D0',
          light: '#A3D5E4',
          dark: '#6B99A6',
        },
        surface: {
          white: '#FFFFFF',
          light: '#F8FAFC',
          dark: '#1A1A1A',
          darker: '#0A0A0A',
        },
        // Semantic Colors
        success: '#34D399',
        warning: '#FBBF24',
        error: '#EF4444',
        info: '#88C0D0',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['SF Pro Display', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-1': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-2': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'heading-1': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'heading-2': ['2.25rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'heading-3': ['1.875rem', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
        'body-large': ['1.125rem', { lineHeight: '1.5' }],
        'body-base': ['1rem', { lineHeight: '1.5' }],
        'body-small': ['0.875rem', { lineHeight: '1.5' }],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'gradient': 'gradient 8s ease infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, var(--starlight-green) 0%, var(--cohere-blue) 100%)',
        'gradient-surface': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(52, 211, 153, 0.2)',
        'glow-blue': '0 0 20px rgba(136, 192, 208, 0.2)',
      },
    },
  },
  plugins: [],
}
