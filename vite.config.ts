import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, '.', '')
  const base =
    command === 'build' && mode === 'mock' ? '/composers-frontend/' : '/'

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
