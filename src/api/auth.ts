import axios from 'axios'
import { keepPendingFeedbackVisible } from './requestTiming'

interface LoginResponse {
  access_token: string
  token_type: string
  expires_in: number
}

const authClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

export async function login(login: string, password: string): Promise<void> {
  const startedAt = Date.now()
  try {
    const response = await authClient.post<LoginResponse>('/user/login', {
      login,
      password,
    })

    if (!response.data.access_token) {
      throw new Error('Сервис авторизации не вернул токен.')
    }

    window.localStorage.setItem('access_token', response.data.access_token)
  } finally {
    await keepPendingFeedbackVisible(startedAt)
  }
}

export async function logout(): Promise<void> {
  const startedAt = Date.now()
  try {
    const token = window.localStorage.getItem('access_token')
    if (!token) {
      throw new Error('Токен авторизации не найден.')
    }

    await authClient.post('/user/logout', undefined, {
      headers: { Authorization: `Bearer ${token}` },
    })

    window.localStorage.removeItem('access_token')
  } finally {
    await keepPendingFeedbackVisible(startedAt)
  }
}

export function getAuthError(error: unknown): string {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    return (
      error.response?.data?.error ??
      error.message ??
      'Не удалось связаться с сервисом авторизации.'
    )
  }

  return error instanceof Error
    ? error.message
    : 'Не удалось выполнить запрос авторизации.'
}
