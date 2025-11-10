import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#12355b',
        accent: '#f97316',
      },
    },
  },
  plugins: [],
}

export default config
