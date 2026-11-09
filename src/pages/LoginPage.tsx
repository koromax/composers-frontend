import { useState, type FormEvent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useNavigate } from 'react-router-dom'
import { getAuthError, login } from '../api/auth'
import {
  authRequestFailed,
  authRequestStarted,
  clearAuthError,
  loginSucceeded,
} from '../slices/authSlice'
import { isMockDataSource } from '../config/dataSource'
import type { AppDispatch, RootState } from '../store'

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

  if (isMockDataSource) {
    return (
      <main className="main-content login-page">
        <section aria-labelledby="login-title" className="login-panel">
          <h1 id="login-title">Вход недоступен</h1>
          <p>
            Сейчас включён демонстрационный режим с mock-данными. Для
            авторизации и изменения данных запустите приложение в режиме API.
          </p>
        </section>
      </main>
    )
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    dispatch(authRequestStarted())

    try {
      await login(loginValue, password)
      dispatch(loginSucceeded(loginValue))
      navigate('/composers-grid', { replace: true })
    } catch (requestError) {
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
