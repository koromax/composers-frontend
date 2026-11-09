import { Api } from './Api'

export const api = new Api({
  baseURL: '/api',
  securityWorker: () => {
    const token = window.localStorage.getItem('access_token')
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {}
  },
})

export function proxyMediaUrl(mediaUrl: string): string {
  const minioUrl = mediaUrl.match(
    /^https?:\/\/(?:localhost|127\.0\.0\.1):9000(\/.*)$/,
  )

  return minioUrl ? `/s3${minioUrl[1]}` : mediaUrl
}
