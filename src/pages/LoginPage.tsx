import axios from 'axios'
import { useState, type FormEvent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useNavigate } from 'react-router-dom'
import { keepPendingFeedbackVisible } from '../api/requestTiming'
import {
  authRequestFailed,
  authRequestStarted,
  clearAuthError,
  loginSucceeded,
} from '../slices/authSlice'
import type { AppDispatch, RootState } from '../store'

interface LoginResponse {
  access_token: string
}

function getAuthError(error: unknown): string {
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

export function LoginPage() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { isAuthenticated, loading, error } = useSelector(
    (state: RootState) => state.auth,
  )
  const [loginValue, setLoginValue] = useState('')
  const [password, setPassword] = useState('')

  if (isAuthenticated) {
    return <Navigate replace to="/composers-grid" />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (loading) return

    dispatch(authRequestStarted())
    const startedAt = Date.now()

    try {
      const { data } = await axios.post<LoginResponse>('/api/user/login', {
        login: loginValue,
        password,
      })
      if (!data.access_token) {
        throw new Error('Сервис авторизации не вернул токен.')
      }

      await keepPendingFeedbackVisible(startedAt)
      window.localStorage.setItem('access_token', data.access_token)
      dispatch(loginSucceeded(loginValue))
      navigate('/composers-grid', { replace: true })
    } catch (requestError) {
      await keepPendingFeedbackVisible(startedAt)
      dispatch(authRequestFailed(getAuthError(requestError)))
    }
  }

  return (
    <main className="main-content login-page">
      <section aria-labelledby="login-title" className="login-panel">
        <h1 id="login-title">Вход</h1>
        {error && (
          <div aria-live="polite" className="login-error" role="alert">
            {error}
          </div>
        )}
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="login">Логин</label>
          <input
            autoComplete="username"
            disabled={loading}
            id="login"
            onChange={(event) => {
              setLoginValue(event.target.value)
              dispatch(clearAuthError())
            }}
            required
            value={loginValue}
          />
          <label htmlFor="password">Пароль</label>
          <input
            autoComplete="current-password"
            disabled={loading}
            id="password"
            onChange={(event) => {
              setPassword(event.target.value)
              dispatch(clearAuthError())
            }}
            required
            type="password"
            value={password}
          />
          <button
            className={loading ? 'request-pending' : ''}
            disabled={loading}
            type="submit"
          >
            {loading ? 'Входим…' : 'Войти'}
          </button>
        </form>
      </section>
    </main>
  )
}
