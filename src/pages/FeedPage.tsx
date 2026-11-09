import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Button } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import defaultCover from '../../default_cover.jpg'
import defaultVideo from '../../default_video.mp4'
import {
  fetchComposerFeed,
  toggleComposerLike,
} from '../slices/composersSlice'
import type { AppDispatch, RootState } from '../store'

export function FeedPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const {
    feedComposer,
    feedLoading,
    feedError,
    feedLoadedForAuthenticatedUser,
    mutationError,
    likedById,
    pendingLikeIds,
  } = useSelector(
    (state: RootState) => state.composers,
  )
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  )
  const composerId =
    id !== undefined && Number.isInteger(Number(id)) ? Number(id) : undefined
  const composer = feedComposer
  const [expanded, setExpanded] = useState(false)
  const [hasMoreDescription, setHasMoreDescription] = useState(false)
  const descriptionTextRef = useRef<HTMLDivElement>(null)
  const nextNavigationPendingRef = useRef(false)

  useEffect(() => {
    if (composerId !== undefined && feedComposer?.id === composerId) {
      nextNavigationPendingRef.current = false
      if (feedLoadedForAuthenticatedUser === isAuthenticated) {
        return
      }
    }

    if (nextNavigationPendingRef.current) {
      return
    }

    dispatch(
      fetchComposerFeed({
        id: composerId,
        allowMockFallback: !isAuthenticated,
      }),
    )
  }, [
    dispatch,
    feedComposer?.id,
    feedLoadedForAuthenticatedUser,
    composerId,
    isAuthenticated,
  ])

  const isLiked = composer ? likedById[composer.id] ?? false : false
  const isLikePending = composer
    ? pendingLikeIds.includes(composer.id)
    : false

  useLayoutEffect(() => {
    const description = descriptionTextRef.current
    setHasMoreDescription(
      description !== null &&
        description.scrollHeight > description.clientHeight + 1,
    )
  }, [composer?.description])

  async function showNextComposer() {
    if (!composer) return

    nextNavigationPendingRef.current = true
    const result = await dispatch(
      fetchComposerFeed({
        id: composer.id,
        next: true,
        allowMockFallback: !isAuthenticated,
      }),
    )
    if (fetchComposerFeed.fulfilled.match(result)) {
      navigate(`/composers-feed/${result.payload.composer.id}`)
      setExpanded(false)
    } else {
      nextNavigationPendingRef.current = false
    }
  }

  function toggleLike() {
    if (!composer || !isAuthenticated) return

    dispatch(
      toggleComposerLike({
        composerId: composer.id,
        isLiked: !isLiked,
      }),
    )
  }

  if (!composer) {
    return (
      <main className="feed-body">
        {feedError && (
          <div aria-live="polite" className="feed-error" role="alert">
            {feedError}
          </div>
        )}
        <section className="info-card">
          {feedLoading ? 'Загрузка композиторов…' : 'Композиторы не найдены'}
        </section>
      </main>
    )
  }

  return (
    <main className="feed-body">
      <video
        aria-label={`Видео о композиторе ${composer.name}`}
        autoPlay
        className="feed-media"
        key={composer.id}
        loop
        muted
        preload="auto"
        playsInline
        poster={composer.imageUrl || defaultCover}
        src={composer.videoUrl || defaultVideo}
      >
        Ваш браузер не поддерживает воспроизведение видео.
      </video>

      {feedError && (
        <div aria-live="polite" className="feed-error" role="alert">
          {feedError}
        </div>
      )}

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
              className={`square-bg like-button${isLiked ? ' is-liked' : ''}${isLikePending ? ' request-pending' : ''}`}
              disabled={!isAuthenticated || feedLoading || isLikePending}
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
            <div className="label-text">{composer.likesCount}</div>
          </div>

          <Button
            aria-label="Следующий композитор"
            className={`action square-bg next-button${feedLoading ? ' request-pending' : ''}`}
            onClick={showNextComposer}
            disabled={feedLoading}
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
        {mutationError && (
          <div aria-live="polite" role="alert">
            {mutationError}
          </div>
        )}
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
