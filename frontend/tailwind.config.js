/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bible: {
          gold: '#B8860B',
          light: '#F5F0E8',
          warm: '#E8DCC8',
          cream: '#FAF7F2',
          dark: '#2C2416',
          text: '#3D3226',
          muted: '#8B7355',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [],
};