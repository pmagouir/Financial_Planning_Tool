import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-config-prettier';

// Flat config (ESLint 10). The accessibility gate (errors.md rows 5/6) is the point:
// eslint-plugin-jsx-a11y runs as `error` so a regression fails CI, not the eye.
export default [
  {
    // Build output, generated types, and Wave-2 orphan/dead-code (scheduled for deletion;
    // not in the live tree — see studio/SWEEP-PLAN.md Wave 2). Don't gate on code we're removing.
    ignores: [
      'dist/**',
      '.astro/**',
      'node_modules/**',
      'src/components/tools/**',
      'src/components/calculator/CompoundInterest.tsx',
      'src/components/calculator/Resources.tsx',
      'src/components/pages/**',
      'src/components/ui/GradientBtn.tsx',
      'src/components/ui/GradientText.tsx',
      'src/components/ui/NavigationButton.tsx',
    ],
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
      // Pre-existing TS-hygiene cleanup is Wave 2; warn so it never blocks the a11y gate.
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      // financialPlan.ts:143 dead `r==g` branch is errors.md row 8 (engine, owned by the
      // Engineer); surface it without blocking the accessibility gate.
      'no-useless-assignment': 'warn',
    },
  },
  prettier,
];
