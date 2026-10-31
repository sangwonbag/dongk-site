import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function apiDevPlugin() {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/detail-images')) {
          try {
            const parsedUrl = new URL(req.url, 'http://localhost');
            req.query = Object.fromEntries(parsedUrl.searchParams.entries());
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try { req.body = body ? JSON.parse(body) : {}; } catch { req.body = body; }
              const { default: handler } = await import('./api/detail-images.js');
              res.status = (code) => { res.statusCode = code; return res; };
              res.json = (data) => {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
                return res;
              };
              await handler(req, res);
            });
            return;
          } catch (e) {
            console.error('[Vite Dev API Middleware Error]:', e);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
            return;
          }
        }
        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiDevPlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('src/data/generatedMaterials') || id.includes('src/data/materials.db')) {
            return 'fallback-materials-db';
          }
          if (id.includes('src/generated/imageManifest')) return 'image-hashes';
          if (id.includes('src/data/materialImageManifest') || id.includes('src/data/imageManifest')) {
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
