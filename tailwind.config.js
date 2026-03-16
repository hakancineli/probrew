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
        // ProBrew Global Brand Colors - Modern & Professional
        'brand-primary': 'var(--brand-primary, #2563EB)',      // Vibrant Blue
        'brand-secondary': 'var(--brand-secondary, #1E40AF)',  // Deep Blue  
        'brand-dark': 'var(--brand-dark, #1E3A5F)',            // Navy Dark
        'brand-accent': 'var(--brand-accent, #F59E0B)',        // Warm Amber
        'brand-light': 'var(--brand-light, #EFF6FF)',          // Light Blue BG
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
      },
    },
  },
  plugins: [],
}
