/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0B1E3B',
          800: '#122A4E',
          ink: '#06281c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(15,23,42,0.04)',
        float: '0 24px 70px rgba(0,0,0,0.4)',
        panel: '0 24px 70px rgba(0,0,0,0.35)',
        cta: '0 10px 26px rgba(16,185,129,0.35)',
        hover: '0 8px 24px rgba(16,185,129,0.12)',
        header: '0 1px 0 rgba(255,255,255,0.08)',
      },
      maxWidth: {
        shell: '1280px',
      },
    },
  },
  plugins: [],
};
