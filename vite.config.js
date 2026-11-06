import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import chatHandler from './api/chat.js';

function vercelApiPlugin() {
  const middleware = (req, res, next) => {
    if (req.url && req.url.startsWith('/api/chat')) {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', async () => {
        try {
          req.body = body ? JSON.parse(body) : {};
        } catch (e) {
          req.body = body;
        }
        res.status = (code) => {
          res.statusCode = code;
          return res;
        };
        res.json = (data) => {
          if (!res.headersSent) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
          }
          res.end(JSON.stringify(data));
          return res;
        };
        await chatHandler(req, res);
      });
      return;
    }
    next();
  };

  return {
    name: 'vercel-api-local-middleware',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    }
  };
}

export default defineConfig(({ mode }) => {
  // Carga todas las variables de .env (con o sin prefijo VITE_) en process.env para pruebas locales
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
    plugins: [react(), vercelApiPlugin()],
    server: {
      port: 3000,
      open: true
    },
    build: {
      outDir: 'dist'
    }
  };
});
