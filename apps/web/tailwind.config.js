module.exports = {
  mode: 'jit',
  purge: ['index.html', './src/**/*.{js,jsx,ts,tsx,vue,html}'],
  darkMode: 'media', // or 'media' or 'class'
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {},
  },
  plugins: [],
};
