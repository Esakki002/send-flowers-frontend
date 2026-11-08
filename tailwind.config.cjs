module.exports = {
  darkMode: 'class', // enable class‑based dark mode
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '"Noto Sans Tamil"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        serif: ['Outfit', '"Noto Sans Tamil"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', '"Noto Sans Tamil"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        primary: '#5B1835',
        secondary: '#C65B75',
        background: '#FFF8F2',
        accent: '#D6B477',
        softPink: '#F4DDE3',
        text: '#3A1426',
        muted: '#8A6574',
        darkHighlight: '#2B1B1B',
      },
    },
  },
  plugins: [],
};
