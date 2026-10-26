import { Link, useLocation } from 'react-router-dom'

const navigationItems = [
  { label: 'Лента', to: '/composers-feed', enabled: true },
  { label: 'Добавление', to: '#', enabled: false },
  { label: 'Плитка', to: '/composers-grid', enabled: true },
  { label: 'Вход', to: '#', enabled: false },
]

export function BottomNavigation() {
  const { pathname } = useLocation()
  const isFeed = pathname.startsWith('/composers-feed') || pathname === '/'

  return (
    <footer className="footer">
      {navigationItems.map(({ label, to, enabled }) =>
        enabled ? (
          <Link
            aria-current={
              (label === 'Лента' && isFeed) ||
              (label === 'Плитка' && pathname === '/composers-grid')
                ? 'page'
                : undefined
            }
            className={`nav-btn${(label === 'Лента' && isFeed) || (label === 'Плитка' && pathname === '/composers-grid') ? ' active' : ''}`}
            key={label}
            to={to}
          >
            <span className="nav-label">{label}</span>
          </Link>
        ) : (
          <span aria-disabled="true" className="nav-btn nav-disabled" key={label}>
            <span className="nav-label">{label}</span>
          </span>
        ),
      )}
    </footer>
  )
}
