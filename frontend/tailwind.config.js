/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        surface: 'hsl(var(--surface))',
        primary: 'hsl(var(--primary))',
        secondary: 'hsl(var(--secondary))',
        text: 'hsl(var(--text))',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        handwritten: ['Caveat', 'cursive'],
      },
      spacing: {
        '4xs': '4px',
        '3xs': '8px',
        '2xs': '12px',
        xs: '16px',
        sm: '20px',
        md: '24px',
        lg: '32px',
        xl: '40px',
        '2xl': '48px',
      },
      borderRadius: {
        DEFAULT: '8px',
        sm: '4px',
      },
    },
  },
  plugins: [],
};