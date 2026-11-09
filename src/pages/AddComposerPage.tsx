import { useEffect, useState, type FormEvent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useNavigate } from 'react-router-dom'
import defaultCover from '../../default_cover.jpg'
import defaultVideo from '../../default_video.mp4'
import {
  createComposerDraft,
  fetchComposerDraft,
  publishComposer,
} from '../slices/composersSlice'
import type { AppDispatch, RootState } from '../store'

function useObjectUrl(file?: File) {
  const [url, setUrl] = useState<string>()

  useEffect(() => {
    if (!file) {
      setUrl(undefined)
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  return url
}

export function AddComposerPage() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { draft, draftChecked, loading, error } = useSelector(
    (state: RootState) => state.composers,
  )
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  )
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [freq1, setFreq1] = useState('')
  const [freq2, setFreq2] = useState('')
  const [image, setImage] = useState<File>()
  const [video, setVideo] = useState<File>()
  const imagePreviewUrl = useObjectUrl(image)
  const videoPreviewUrl = useObjectUrl(video)

  useEffect(() => {
    if (isAuthenticated && !draftChecked && !loading) {
      dispatch(fetchComposerDraft())
    }
  }, [dispatch, draftChecked, isAuthenticated, loading])

  useEffect(() => {
    if (!draft) return
    setName(draft.name)
    setDescription(draft.description)
    setFreq1(draft.freq1 ? String(draft.freq1) : '')
    setFreq2(draft.freq2 ? String(draft.freq2) : '')
  }, [draft])

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!draft) {
      await dispatch(createComposerDraft({ name, image, video }))
      return
    }

    const result = await dispatch(
      publishComposer({
        composer: {
          ...draft,
          description,
          freq1: Number(freq1),
          freq2: Number(freq2),
        },
      }),
    )
    if (publishComposer.fulfilled.match(result)) {
      navigate('/composers-grid')
    }
  }

  if (!draftChecked && loading) {
    return (
      <main className="main-content draft">
        <div aria-live="polite" className="page-title" role="status">
          Загрузка черновика…
        </div>
        <button
          aria-busy="true"
          className="save-btn request-pending"
          disabled
          type="button"
        >
          Подождите
        </button>
      </main>
    )
  }

  const imageUrl = draft?.imageUrl || imagePreviewUrl || defaultCover
  const videoUrl = draft?.videoUrl || videoPreviewUrl || defaultVideo

  return (
    <main className="main-content draft">
      <div className="page-title">
        {draft ? 'Публикация черновика' : 'Создание'}
      </div>

      {error && (
        <div aria-live="polite" className="composers-message" role="alert">
          {draft
            ? `Черновик #${draft.id} сохранён. ${error}`
            : error}
        </div>
      )}
      {!draftChecked && (
        <div className="input-section">
          <div className="input-body-vertical">
            <div className="input-field">
              <button
                className="save-btn"
                disabled={loading}
                onClick={() => dispatch(fetchComposerDraft())}
                type="button"
              >
                Повторить загрузку
              </button>
            </div>
          </div>
        </div>
      )}

      <form className="draft-form" onSubmit={handleSubmit}>
        <div className="input-section">
          <div className="input-head">Предпросмотр медиа</div>
          <div className="input-body media-preview">
            <img
              alt={draft?.name || name || 'Предпросмотр изображения'}
              className="card-picture preview"
              src={imageUrl}
            />
            <video
              aria-label={`Предпросмотр видео ${draft?.name || name || 'композитора'}`}
              autoPlay
              className="feed-media preview"
              controls
              loop
              muted
              playsInline
              poster={imageUrl}
            >
              <source src={videoUrl} type="video/mp4" />
              Ваш браузер не поддерживает воспроизведение видео.
            </video>
          </div>
        </div>

        <div className="input-section">
          <div className="input-head">Заголовки</div>
          <div className="input-body-vertical">
            <div className="input-field">
              <label htmlFor="composer-name">Имя композитора</label>
              <input
                disabled={loading || Boolean(draft)}
                id="composer-name"
                onChange={(event) => setName(event.target.value)}
                required
                type="text"
                value={draft?.name ?? name}
              />
            </div>

            {draft && (
              <div className="input-field">
                <label htmlFor="composer-description">Описание</label>
                <textarea
                  disabled={loading}
                  id="composer-description"
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  value={description}
                />
              </div>
            )}
          </div>
        </div>

        {!draft && (
          <div className="input-section">
            <div className="input-head">Загрузка медиа</div>
            <div className="input-body-vertical">
              <div className="input-field">
                <label htmlFor="composer-image">Изображение</label>
                <input
                  accept="image/*"
                  disabled={loading}
                  id="composer-image"
                  onChange={(event) => setImage(event.target.files?.[0])}
                  type="file"
                />
              </div>
              <div className="input-field">
                <label htmlFor="composer-video">Видео</label>
                <input
                  accept="video/mp4,video/webm"
                  disabled={loading}
                  id="composer-video"
                  onChange={(event) => setVideo(event.target.files?.[0])}
                  type="file"
                />
                <small className="media-format-hint">
                  Для поддержки в разных браузерах используйте MP4 (H.264) или
                  WebM.
                </small>
              </div>
            </div>
          </div>
        )}

        {draft && (
          <div className="input-section">
            <div className="input-head">Поля по теме</div>
            <div className="input-body-vertical">
              <div className="input-field">
                <label htmlFor="composer-freq1">Частотность 1</label>
                <input
                  disabled={loading}
                  id="composer-freq1"
                  max="100"
                  min="0"
                  onChange={(event) => setFreq1(event.target.value)}
                  placeholder="38.5"
                  required
                  step="0.1"
                  type="number"
                  value={freq1}
                />
              </div>
              <div className="input-field">
                <label htmlFor="composer-freq2">Частотность 2</label>
                <input
                  disabled={loading}
                  id="composer-freq2"
                  max="100"
                  min="0"
                  onChange={(event) => setFreq2(event.target.value)}
                  placeholder="12.4"
                  required
                  step="0.1"
                  type="number"
                  value={freq2}
                />
              </div>
            </div>
          </div>
        )}

        <div className="save-btn-container">
          <button
            className={`save-btn${loading ? ' request-pending' : ''}`}
            disabled={loading || !draftChecked}
            type="submit"
          >
            <span className="save-btn-text">
              {loading ? 'Выполняется…' : draft ? 'Опубликовать' : 'Далее'}
            </span>
          </button>
        </div>
      </form>
    </main>
  )
}
