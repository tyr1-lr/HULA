
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        hula: {
          green: "#0F4415",
          beige: "#E2D7AB",
          cream: "#F1EFC8",
        },
      },
    },
  },
  plugins: [],
};
