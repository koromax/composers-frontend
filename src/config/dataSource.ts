const configuredDataSource = import.meta.env.VITE_DATA_SOURCE

if (
  configuredDataSource !== undefined &&
  configuredDataSource !== 'api' &&
  configuredDataSource !== 'mock'
) {
  throw new Error(
    `Unsupported VITE_DATA_SOURCE value: "${configuredDataSource}". Use "api" or "mock".`,
  )
}

export const isMockDataSource = configuredDataSource === 'mock'
