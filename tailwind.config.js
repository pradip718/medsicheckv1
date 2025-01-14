const color = require('./src/theme/customColor');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/screens/**/*.{js,jsx,ts,tsx}',
    './src/components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    screens: {
      mobile: '200px',
      smallPhone: '320px', // e.g., iPhone SE, older Android devices
      mediumPhone: '375px', // e.g., iPhone 6/7/8, newer small Android devices
      largePhone: '414px', // e.g., iPhone 11 Pro, Pixel 4
      tablet: '640px',
    },
    extend: {
      backgroundColor: {
        ...color,
      },
      fontFamily: {
        isidoraRegular: ['IsidoraSans-Regular'],
        isidoraMedium: ['IsidoraSans-Medium'],
        isidoraSemiBold: ['IsidoraSans-SemiBold'],
        isidoraBold: ['IsidoraSans-Bold'],
      },
      colors: {
        ...color,
      },
    },
  },
  plugins: [],
};
