import tailwindcssPlugin from '@tailwindcss/vite';
import viteReactPlugin from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import viteConfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  // Load environment variables based on mode
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // Define environment variables for the client
    define: {
      __APP_ENV__: JSON.stringify(env.VITE_APP_ENV || mode),
    },
    build: {
      reportCompressedSize: false,
      commonjsOptions: { transformMixedEsModules: true },
    },
    plugins: [
      tailwindcssPlugin(),
      viteConfigPaths(),
      viteReactPlugin(),
      // eslint-disable-next-line no-undef
      process.env.INLINE ? viteSingleFile() : null,
    ].filter(Boolean),
    
    // Configure server with proxy for API requests to avoid CORS issues
    server: {
      proxy: {
        // Proxy all API requests to the backend
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
          cors: true,
        },
      },
    },
  };
});
