/** @type {import('tailwindcss').Config} */
module.exports = {
  // 1. Tell Tailwind which files to scan for class names:
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // all React components
    "./public/index.html"         // your HTML entrypoint
  ],

  // 2. Customize your design system here:
  theme: {
    extend: {
      // e.g. add custom colors:
      // colors: {
      //   primary: '#5A67D8',
      // },
    },
  },

  // 3. Enable any official plugins you want to use:
  plugins: [
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'),
  ],
};