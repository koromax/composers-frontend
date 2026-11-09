import { resolve } from 'node:path'
import { generateApi } from 'swagger-typescript-api'

const input = process.env.OPENAPI_FILE

await generateApi({
  name: 'Api.ts',
  output: resolve(process.cwd(), './src/api'),
  ...(input
    ? { input: resolve(input) }
    : {
        url:
          process.env.OPENAPI_URL ??
          'http://localhost:8080/swagger/doc.json',
      }),
  httpClientType: 'axios',
})
