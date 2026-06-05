import js from '@eslint/js';
import vue from 'eslint-plugin-vue';
import ts from '@vue/eslint-config-typescript';

export default [
  {
    ignores: ['dist/**', 'node_modules/**']
  },
  js.configs.recommended,
  ...vue.configs['flat/essential'],
  ...ts(),
  {
    files: ['**/*.vue', '**/*.ts'],
    rules: {
      'vue/multi-word-component-names': 'off'
    }
  }
];
