module.exports = {
  root: true,
  env: {
    node: true,
  },
  // plugins: ['prettier'],
  extends: [
    'plugin:vue/essential',
    'eslint:recommended',
    '@vue/airbnb',
  ],
  parserOptions: {
    parser: '@babel/eslint-parser',
  },
  rules: {
    'generator-star-spacing': 'off',
    'vuejs-accessibility/click-events-have-key-events': 'off',
    'no-tabs': 'off',
    'import/extensions': ['error', 'always', {
      js: 'never',
      vue: 'never',
    }],
  },
};
