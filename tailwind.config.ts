import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F45D48',
          dark: '#E04835',
          light: '#FF7A68',
        },
        secondary: {
          DEFAULT: '#0A2540',
          light: '#1A3550',
        },
        accent: {
          DEFAULT: '#00D4AA',
          light: '#00E8BC',
        },
        background: '#FFFBF8',
        muted: '#6B7280',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
