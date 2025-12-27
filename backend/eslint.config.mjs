import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPrettier from 'eslint-plugin-prettier';

// 直接内联Prettier规则，不读取外部文件
const prettierConfig = {
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 120,
  tabWidth: 2,
  semi: true,
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'lf',
};

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.js', '*.config.mjs', 'upload/**'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      'prettier/prettier': ['error', prettierConfig],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['log', 'warn', 'error'] }],
      'no-debugger': 'error',
    },
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
);