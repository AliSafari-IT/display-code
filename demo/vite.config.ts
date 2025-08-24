import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    plugins: [react(), {
      name: 'css-modules-transform',
      transform(code, id) {
        if (id.includes('display-code') && id.endsWith('.module.css')) {
          console.log('Processing CSS module:', id);
          return {
            code: `const styles = {}; export default styles;`,
            map: null
          };
        }
        return null;
      }
    }],
    server: {
      port: 3003,
      open: true
    },
    base: '/display-code/',
    build: {
      assetsInlineLimit: 0, // Ensure all assets are processed as files
      commonjsOptions: {
        include: [/node_modules/]
      }
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
      dedupe: ['react', 'react-dom']
    },
    optimizeDeps: {
      include: ['react', 'react-dom']
    }
  }
});

