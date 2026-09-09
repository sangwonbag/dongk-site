import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('src/data/generatedMaterials') || id.includes('src/data/materials.db')) {
            return 'fallback-materials-db';
          }
          if (id.includes('src/data/materialImageManifest') || id.includes('src/generated/imageManifest')) {
            return 'fallback-image-manifest';
          }
          if (id.includes('node_modules')) {
            if (id.includes('@react-pdf')) {
              return 'vendor-pdf';
            }
            if (id.includes('three') || id.includes('@react-three')) {
              return 'vendor-three';
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('react-router-dom') || id.includes('react-dom') || id.includes('react/')) {
              return 'vendor-react';
            }
          }
        }
      }
    }
  }
})
