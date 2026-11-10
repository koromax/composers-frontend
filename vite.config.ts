import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, '.', '')
  const isLanHttps = mode === 'api-https'
  const base =
    command === 'build' && mode === 'mock' ? '/composers-frontend/' : '/'
  const certificatePath = resolve('certs/cert.crt')
  const privateKeyPath = resolve('certs/cert.key')

  if (
    isLanHttps &&
    (!existsSync(certificatePath) || !existsSync(privateKeyPath))
  ) {
    throw new Error(
      'HTTPS certificates not found. Generate certs/dev-cert.pem and certs/dev-key.pem with mkcert; see the README.',
    )
  }

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: { enabled: true },
        manifest: {
          name: 'Композиторы',
          short_name: 'Композиторы',
          description: 'Атрибуция музыкальных произведений по частотности интервалов',
          lang: 'ru',
          start_url: base,
          scope: base,
          display: 'standalone',
          background_color: '#262626',
          theme_color: '#262626',
          icons: [
            {
              src: `${base}icons/icon-192.svg`,
              sizes: '192x192',
              type: 'image/svg+xml',
              purpose: 'any',
            },
            {
              src: `${base}icons/icon-512.svg`,
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'any',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2,mp4}'],
          maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        },
      }),
    ],
    base,
    server: {
      ...(isLanHttps && {
        host: '0.0.0.0',
        https: {
          cert: readFileSync(certificatePath),
          key: readFileSync(privateKeyPath),
        },
      }),
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET ?? 'http://localhost:8080',
          changeOrigin: true,
        },
        '/s3': {
          target: env.VITE_S3_PROXY_TARGET ?? 'http://localhost:9000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/s3/, ''),
        },
      },
    },
  }
})
