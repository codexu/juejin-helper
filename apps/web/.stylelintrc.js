module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-prettier',
    'stylelint-config-recess-order',
  ],
  plugins: ['stylelint-scss'],
  rules: {
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'mixin',
          'include',
          'tailwind',
          'extend',
          'apply',
          'variants',
          'responsive',
          'screen',
        ],
      },
    ],
    'scss/at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['tailwind'],
      },
    ],
    'selector-pseudo-class-no-unknown': [true, { ignorePseudoElements: ['deep'] }],
  },
};
