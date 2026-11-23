import axios from 'axios'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { keepPendingFeedbackVisible } from '../api/requestTiming'
import {
  authRequestFailed,
  authRequestStarted,
  logoutSucceeded,
} from '../slices/authSlice'
import { resetRange } from '../slices/composersFilterSlice'
import type { AppDispatch, RootState } from '../store'

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

export function BottomNavigation() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { isAuthenticated, loading } = useSelector(
    (state: RootState) => state.auth,
  )
  const [logoutError, setLogoutError] = useState<string | null>(null)
  const isFeed = pathname.startsWith('/composers-feed') || pathname === '/'

  async function handleLogout() {
    dispatch(authRequestStarted())
    setLogoutError(null)
    const startedAt = Date.now()

    try {
      const token = window.localStorage.getItem('access_token')
      if (!token) {
        throw new Error('Токен авторизации не найден.')
      }

      await axios.post('/api/user/logout', undefined, {
        headers: { Authorization: `Bearer ${token}` },
      })

      await keepPendingFeedbackVisible(startedAt)
      window.localStorage.removeItem('access_token')
      dispatch(logoutSucceeded())
      dispatch(resetRange())
      navigate('/composers-feed')
    } catch (requestError) {
      await keepPendingFeedbackVisible(startedAt)
      const message = getAuthError(requestError)
      dispatch(authRequestFailed(message))
      setLogoutError(message)
    }
  }

  return (
    <footer className="footer">
      <Link
        aria-current={isFeed ? 'page' : undefined}
        className={`nav-btn${isFeed ? ' active' : ''}`}
        draggable={false}
        to="/composers-feed"
      >
        <span className="nav-label">Лента</span>
      </Link>
      {isAuthenticated ? (
        <Link
          aria-current={pathname === '/composers-add' ? 'page' : undefined}
          className={`nav-btn${pathname === '/composers-add' ? ' active' : ''}`}
          draggable={false}
          to="/composers-add"
        >
          <span className="nav-label">Добавление</span>
        </Link>
      ) : (
        <span aria-disabled="true" className="nav-btn nav-disabled">
          <span className="nav-label">Добавление</span>
        </span>
      )}
      <Link
        aria-current={pathname === '/composers-grid' ? 'page' : undefined}
        className={`nav-btn${pathname === '/composers-grid' ? ' active' : ''}`}
        draggable={false}
        to="/composers-grid"
      >
        <span className="nav-label">Плитка</span>
      </Link>
      {isAuthenticated ? (
        <button
          className={`nav-btn nav-auth${loading ? ' request-pending' : ''}`}
          disabled={loading}
          onClick={handleLogout}
          type="button"
        >
          <span className="nav-label">{loading ? '...' : 'Выход'}</span>
        </button>
      ) : (
        <Link
          aria-current={pathname === '/login' ? 'page' : undefined}
          className={`nav-btn${pathname === '/login' ? ' active' : ''}`}
          draggable={false}
          to="/login"
        >
          <span className="nav-label">Вход</span>
        </Link>
      )}
      {logoutError && (
        <div aria-live="polite" className="logout-error" role="alert">
          {logoutError}
        </div>
      )}
    </footer>
  )
}
