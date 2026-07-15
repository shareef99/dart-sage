import tsPlugin from '@typescript-eslint/eslint-plugin';
import { defineConfig } from 'eslint/config';
import expoConfig from 'eslint-config-expo/flat.js';
import unicorn from 'eslint-plugin-unicorn';

export default defineConfig([
  {
    ignores: ['node_modules', 'android', 'ios', '.expo', 'dist', 'tmp'],
  },
  expoConfig,
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: { '@typescript-eslint': tsPlugin, unicorn },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      'unicorn/filename-case': [
        'error',
        {
          case: 'kebabCase',
          ignore: ['^_layout\\.tsx$', '^\\+.*\\.tsx$', '^\\[.*\\]\\.tsx$'],
        },
      ],
      // Reanimated's shared values are written via `.value =` by design;
      // this React Compiler rule cannot distinguish them from React state.
      'react-hooks/immutability': 'off',
    },
  },
  {
    files: ['eslint.config.mjs'],
    rules: {
      // eslint-plugin-import cannot parse eslint-plugin-unicorn's modern syntax.
      'import/namespace': 'off',
      'import/no-named-as-default': 'off',
      'import/no-named-as-default-member': 'off',
    },
  },
]);
