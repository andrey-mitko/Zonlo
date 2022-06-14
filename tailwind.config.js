const colors = require('tailwindcss/colors')

module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'media', // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'brand-black-primary': {
          DEFAULT: '#1E1E1E'
        },
        'brand-black-secondary': {
          DEFAULT: '#393939'
        },
        'brand-black-tertiary': {
          DEFAULT: '#787878'
        },
        'brand-elementBG': {
          DEFAULT: '#F6F6F6'
        },
        'brand-green-1': {
          DEFAULT: '#01703D'
        },
        'brand-green-2': {
          DEFAULT: '#1DA768'
        },
        'brand-green-3': {
          DEFAULT: '#52DA9C'
        },
        'brand-green-4': {
          DEFAULT: '#DAF7EA'
        },
        'brand-green-gradient-dark': {
          DEFAULT: '#66E0A8'
        },
        'brand-green-gradient-light': {
          DEFAULT: '#A3F4B2'
        },
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms')
  ],
  daisyui: {
    styled: true,
    themes: false,
    base: true,
    utils: true,
    logs: true,
    rtl: false,
  },
}
