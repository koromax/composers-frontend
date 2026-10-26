import { useLayoutEffect, useRef, useState } from 'react'
import { Button } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import defaultCover from '../../default_cover.jpg'
import defaultVideo from '../../default_video.mp4'
import { COMPOSERS_MOCK } from '../data/composers'

export function FeedPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const currentIndex = COMPOSERS_MOCK.findIndex(
    (composer) => composer.id === Number(id),
  )
  const composerIndex = currentIndex >= 0 ? currentIndex : 0
  const composer = COMPOSERS_MOCK[composerIndex]
  const [likedIds, setLikedIds] = useState<number[]>([])
  const [expanded, setExpanded] = useState(false)
  const [hasMoreDescription, setHasMoreDescription] = useState(false)
  const descriptionTextRef = useRef<HTMLDivElement>(null)

  const isLiked = likedIds.includes(composer.id)
  const likesCount = composer.likesCount + Number(isLiked)

  useLayoutEffect(() => {
    const description = descriptionTextRef.current
    setHasMoreDescription(
      description !== null &&
        description.scrollHeight > description.clientHeight + 1,
    )
  }, [composer.description])

  function showNextComposer() {
    const next = COMPOSERS_MOCK[(composerIndex + 1) % COMPOSERS_MOCK.length]
    navigate(`/composers-feed/${next.id}`)
    setExpanded(false)
  }

  function toggleLike() {
    setLikedIds((liked) =>
      isLiked
        ? liked.filter((composerId) => composerId !== composer.id)
        : [...liked, composer.id],
    )
  }

  return (
    <main className="feed-body">
      <video
        aria-label={`Видео о композиторе ${composer.name}`}
        autoPlay
        className="feed-media"
        loop
        muted
        playsInline
        poster={composer.imageUrl || defaultCover}
      >
        <source src={composer.videoUrl || defaultVideo} type="video/mp4" />
        Ваш браузер не поддерживает воспроизведение видео.
      </video>

      <aside className="sidebar">
        <div className="freq-wrapper">
          <div className="freq-field">
            <div className="label-text">Freq 1</div>
            <div className="square-bg text-value">{composer.freq1}</div>
          </div>
          <div className="freq-field">
            <div className="label-text">Freq 2</div>
            <div className="square-bg text-value">{composer.freq2}</div>
          </div>
        </div>

        <div className="actions-wrapper">
          <div className="action">
            <Button
              aria-label={isLiked ? 'Убрать отметку нравится' : 'Нравится'}
              aria-pressed={isLiked}
              className={`square-bg like-button${isLiked ? ' is-liked' : ''}`}
              onClick={toggleLike}
              type="button"
              variant="custom"
            >
              <svg
                className={`heart${isLiked ? ' liked' : ''}`}
                viewBox="0 0 30 27"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M8.75 1.43c-1.92 0-3.85.62-5.31 2.12-2.93 3-2.85 7.63 0 10.63l10.1 10.7c.8.84 2.13.84 2.92 0l10.1-10.7c2.85-3 2.93-7.63 0-10.63-2.93-2.87-7.7-2.87-10.62 0-.51.54-1.37.54-1.88 0-1.47-1.5-3.4-2.12-5.31-2.12Z" />
              </svg>
            </Button>
            <div className="label-text">{likesCount}</div>
          </div>

          <Button
            aria-label="Следующий композитор"
            className="action square-bg next-button"
            onClick={showNextComposer}
            type="button"
            variant="custom"
          >
            <svg viewBox="0 0 25 15" xmlns="http://www.w3.org/2000/svg">
              <path d="M24.4 3.47 13.91 13.96a2 2 0 0 1-2.83 0L.6 3.47A2.04 2.04 0 0 1 3.47.6l7.61 7.61a2 2 0 0 0 2.83 0L21.53.6a2.03 2.03 0 0 1 2.87 2.87Z" />
            </svg>
          </Button>
        </div>
      </aside>

      <section className="info-card">
        <div className="composer-name">
          <span>{composer.name}</span>
        </div>
        <div className={`description${expanded ? ' expanded' : ''}`}>
          <div className="description-text" ref={descriptionTextRef}>
            {composer.description}
          </div>
          {hasMoreDescription && (
            <button
              aria-expanded={expanded}
              className="description-show"
              onClick={() => setExpanded((value) => !value)}
              type="button"
            >
              {expanded ? 'Скрыть' : 'Показать больше'}
            </button>
          )}
        </div>
      </section>
    </main>
  )
}
