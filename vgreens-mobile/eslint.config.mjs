import { defineConfig, globalIgnores } from 'eslint/config';
import expoConfig from 'eslint-config-expo';
import prettierConfig from 'eslint-config-prettier';

const eslintConfig = defineConfig([
  ...expoConfig,
  prettierConfig,
  globalIgnores([
    'node_modules/**',
    '.expo/**',
    'dist/**',
    'src/generated/**',
  ]),
]);

export default eslintConfig;
