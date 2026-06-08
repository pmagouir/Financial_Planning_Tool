import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-config-prettier';

// Flat config (ESLint 10). The accessibility gate (errors.md rows 5/6) is the point:
// eslint-plugin-jsx-a11y runs as `error` so a regression fails CI, not the eye.
export default [
  {
    // Build output and generated types. The orphan/dead-code that used to be ignored here
    // was deleted in Wave 2 (studio/SWEEP-PLAN.md), so the whole live src/ tree is now gated.
    ignores: ['dist/**', '.astro/**', 'node_modules/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  jsxA11y.flatConfigs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // TS handles undefined references; core no-undef false-positives on browser/React globals.
      'no-undef': 'off',
      // TS-hygiene: warn (not error) so it never blocks the a11y gate.
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
  prettier,
];
