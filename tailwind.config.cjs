module.exports = {
  darkMode: 'class', // enable class‑based dark mode
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Noto Sans Tamil"', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', '"Noto Sans Tamil"', 'serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      colors: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        background: 'var(--background)',
        accent: 'var(--accent)',
        softPink: 'var(--soft-pink)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        darkHighlight: 'var(--dark-highlight)',
      },
    },
  },
  plugins: [],
};
