import { Link } from 'react-router-dom'
import defaultCover from '../../default_cover.jpg'
import type { Composer } from '../data/composers'

interface GridCardProps {
  indicator: Composer
  onLike: () => void
  onDelete: () => void
}

export function GridCard({ indicator, onLike, onDelete }: GridCardProps) {
  return (
    <article className="grid-card">
      <Link
        aria-label={`Открыть карточку ${indicator.name}`}
        className="card-link"
        to={`/composers-feed/${indicator.id}`}
      >
        <img
          alt={indicator.name}
          className="card-picture"
          src={indicator.imageUrl || defaultCover}
        />
        <div className="card-info">
          <div className="card-title">{indicator.name}</div>
          <div className="card-freq">Частотность: {indicator.freq1}</div>
        </div>
      </Link>
      <div className="card-footer">
        <button
          aria-label={`Поставить лайк ${indicator.name}`}
          className="card-likes"
          onClick={onLike}
          type="button"
        >
          <svg
            aria-hidden="true"
            className="like-icon"
            viewBox="0 0 30 27"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M8.75 1.43c-1.92 0-3.85.62-5.31 2.12-2.93 3-2.85 7.63 0 10.63l10.1 10.7c.8.84 2.13.84 2.92 0l10.1-10.7c2.85-3 2.93-7.63 0-10.63-2.93-2.87-7.7-2.87-10.62 0-.51.54-1.37.54-1.88 0-1.47-1.5-3.4-2.12-5.31-2.12Z" />
          </svg>
          <span className="like-val">{indicator.likesCount}</span>
        </button>
        <button
          aria-label={`Удалить ${indicator.name} из плитки`}
          className="card-delete-btn"
          onClick={onDelete}
          type="button"
        >
          Удалить
        </button>
      </div>
    </article>
  )
}
