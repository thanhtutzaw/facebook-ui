/** @type {import('tailwindcss').Config} */
module.exports = {
  // relative: true,

  // content: [
  //   './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
  //   './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  //   './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  // ],
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    // Add your SCSS files or other relevant files here
  ],
  theme: {
    extend: {
      colors: {
        dimgray: 'rgb(105 105 105 / <alpha-value>)',
        gray: 'rgb(128 128 128 / <alpha-value>)',
        primary: 'rgb(var(--blue) / <alpha-value>)',
        avatarBg: 'rgb(var(--avatar-bg) / <alpha-value>)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}

