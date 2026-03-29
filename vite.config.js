import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import https from 'node:https'
import http from 'node:http'
import { URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // GitHub Pages serves from /QuantumStudio/ — use '/' locally, '/QuantumStudio/' in production
  base: process.env.NODE_ENV === 'production' ? '/QuantumStudio/' : '/',
  plugins: [
    react(),
    command === 'serve' && {
      name: 'cors-bypass-proxy',
      configureServer(server) {
        server.middlewares.use('/api/proxy', (req, res) => {
          const targetUrlStr = req.headers['x-target-url'];
          if (!targetUrlStr) {
            res.statusCode = 400;
            return res.end('Missing x-target-url header');
          }

          try {
            const targetUrl = new URL(targetUrlStr);
            const client = targetUrl.protocol === 'https:' ? https : http;

            const options = {
              hostname: targetUrl.hostname,
              port: targetUrl.port,
              path: targetUrl.pathname + targetUrl.search,
              method: req.method,
              headers: { ...req.headers },
              rejectUnauthorized: false,
            };

            delete options.headers['host'];
            delete options.headers['x-forwarded-for'];
            delete options.headers['x-target-url'];

            const proxyReq = client.request(options, (proxyRes) => {
              res.writeHead(proxyRes.statusCode, proxyRes.headers);
              proxyRes.pipe(res, { end: true });
            });

            proxyReq.on('error', (err) => {
              if (!res.headersSent) {
                res.writeHead(502);
                res.end("Bad Gateway: " + err.message);
              }
            });

            req.pipe(proxyReq, { end: true });
          } catch (err) {
            if (!res.headersSent) {
              res.writeHead(500);
              res.end("Proxy Error: " + err.message);
            }
          }
        });
      }
    }
  ].filter(Boolean),
}))
