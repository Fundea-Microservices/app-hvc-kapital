import type { StorybookConfig } from '@storybook/angular-vite';

const config: StorybookConfig = {
stories: [
  "../src/stories/**/*.mdx",
  "../src/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"
],
  "addons": [],
  "framework": {
    "name": "@storybook/angular-vite",
    "options": {
      "compodoc": false
    }
  }
};
export default config;