// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
    vite: {
        css: {
          postcss: {
            plugins: []
          }
        },
        build: {
          target: 'esnext'
        }
      },
      build: {
        format: 'directory'
    }
});
