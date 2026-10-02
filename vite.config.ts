import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { handleRouteFallback } from "./src/lib/routerFallback";

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
          const result = handleRouteFallback(req.url || '');
          if (result.rewriteUrl) {
            req.url = result.rewriteUrl;
          }
          next();
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
        LMX: path.resolve(__dirname, "LMX/index.html"),
        DEEF: path.resolve(__dirname, "DEEF/index.html"),
        IPA: path.resolve(__dirname, "IPA/index.html"),
        "404": path.resolve(__dirname, "404.html"),
      },
    },
  },
}));
