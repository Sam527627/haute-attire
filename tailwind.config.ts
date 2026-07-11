import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#161311',
        ivory: '#F8F4EC',
        cream: '#FBF8F2',
        beige: '#E9E0D2',
        stone: '#8A8274',
        champagne: '#C6A15B',
        gold: '#B08A3E',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      letterSpacing: { luxe: '0.22em' },
    },
  },
  plugins: [],
};
export default config;
