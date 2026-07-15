import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        'card-bg': 'var(--card-bg)',
        'card-border': 'var(--card-border)',
        primary: 'var(--primary)',
        'primary-glow': 'var(--primary-glow)',
        secondary: 'var(--secondary)',
        'secondary-glow': 'var(--secondary-glow)',
        accent: 'var(--accent)',
      },
    },
  },
  plugins: [],
}
export default config
