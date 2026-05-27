import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api/v1/upload': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/api/v1/posts': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/api/v1/categories': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/api/v1/comments': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/api/v1/likes': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/api/v1/admin': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'three-vendor',
              test: /[\\/]node_modules[\\/](three|@react-three|maath)[\\/]/,
            },
            {
              name: 'firebase-vendor',
              test: /[\\/]node_modules[\\/]firebase[\\/]/,
            },
            {
              name: 'jodit-vendor',
              test: /[\\/]node_modules[\\/]jodit(-react)?[\\/]/,
            },
            {
              name: 'recharts-vendor',
              test: /[\\/]node_modules[\\/]recharts[\\/]/,
            },
            {
              name: 'framer-motion-vendor',
              test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
            },
            {
              name: 'react-query-vendor',
              test: /[\\/]node_modules[\\/]@tanstack[\\/]react-query[\\/]/,
            },
            {
              name: 'vendor',
              test: /[\\/]node_modules[\\/]/,
            },
          ],
        },
      },
    },
  }
})

