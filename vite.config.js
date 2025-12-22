const path = require('path');

export default {
  root: process.cwd(),
  build: {
    outDir: 'public',
    emptyOutDir: true,
    minify: 'esbuild',
    esbuild: {
      keepNames: true
    },
    rollupOptions: {
      input: path.resolve(__dirname, 'src/js/main.ts'),
      output: {
        entryFileNames: 'js/[name].js',
        chunkFileNames: 'js/chunk-[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const ext = path.extname(assetInfo.name || '');
          if (ext === '.css') {
            return 'css/styles.css';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    cssCodeSplit: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
};
