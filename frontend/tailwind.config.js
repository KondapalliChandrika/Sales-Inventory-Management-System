import { colors, fontFamily, shadows } from './src/theme/index.js';

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors,
      fontFamily,
      boxShadow: shadows,
    },
  },
  plugins: [],
};
