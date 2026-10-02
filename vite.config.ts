import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  appType: 'spa',
  base: "/",
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    {
      name: 'router-fallback',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url?.split('?')[0] || '';
          if (url === '/demo' || url === '/demo/') {
            req.url = '/demo/index.html';
            next();
          } else if (
            url === '/' ||
            url === '/index.html' ||
            url === '/demo/index.html' ||
            url === '/404.html' ||
            url.includes('.') ||
            url.startsWith('/@') ||
            url.startsWith('/src') ||
            url.startsWith('/node_modules')
          ) {
            next();
          } else {
            req.url = '/404.html';
            next();
          }
        });
      }
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        demo: path.resolve(__dirname, "demo/index.html"),
        "404": path.resolve(__dirname, "404.html"),
      },
    },
  },
}));
