import 'zone.js';
import type { Preview } from '@storybook/angular-vite'
import '../src/styles.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
  },
};

export default preview;