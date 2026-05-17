/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#004532',
        'primary-container': '#065f46',
        'on-primary': '#ffffff',
        'on-primary-container': '#8bd6b7',
        secondary: '#45645e',
        'secondary-container': '#c7eae1',
        'on-secondary': '#ffffff',
        tertiary: '#1e4334',
        'tertiary-container': '#365a4a',
        surface: '#f8faf8',
        'surface-container': '#eceeec',
        'surface-container-low': '#f2f4f2',
        'surface-container-lowest': '#ffffff',
        'surface-container-high': '#e6e9e7',
        'on-surface': '#191c1b',
        'on-surface-variant': '#3f4944',
        outline: '#6f7973',
        'outline-variant': '#bec9c2',
        error: '#ba1a1a',
        'error-container': '#ffdad6',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        serif: ['"DM Serif Display"', 'serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        card: '0 4px 24px rgba(6,95,70,0.07)',
        float: '0 8px 40px rgba(6,95,70,0.14)',
        glow: '0 0 0 3px rgba(139,214,183,0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.45s ease both',
        'slide-up': 'slideUp 0.4s ease both',
        'spin-slow': 'spin 0.8s linear infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(18px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
