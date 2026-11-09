import { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { GridCard } from '../components/GridCard'
import {
  deleteComposer,
  fetchComposers,
  toggleComposerLike,
} from '../slices/composersSlice'
import {
  applyRange,
  setMaximum,
  setMinimum,
} from '../slices/composersFilterSlice'
import type { AppDispatch, RootState } from '../store'

export function GridPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { range, appliedRange } = useSelector(
    (state: RootState) => state.composersFilter,
  )
  const {
    items: composers,
    composersLoading,
    error,
    mutationError,
    likedById,
    pendingLikeIds,
    pendingDeleteIds,
  } = useSelector((state: RootState) => state.composers)
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  )
  const [activeThumb, setActiveThumb] = useState<'min' | 'max'>('max')
  const visibleComposers = composers

  useEffect(() => {
    dispatch(
      fetchComposers({
        minFreq: appliedRange.min,
        maxFreq: appliedRange.max,
        allowMockFallback: !isAuthenticated,
      }),
    )
  }, [appliedRange.max, appliedRange.min, dispatch, isAuthenticated])

  function updateMinimum(value: number) {
    dispatch(setMinimum(value))
    if (value === range.max) {
      setActiveThumb('max')
    }
  }

  function updateMaximum(value: number) {
    dispatch(setMaximum(value))
    if (value === range.min) {
      setActiveThumb('min')
    }
  }

  return (
    <main className="main-content grid">
      <div className="page-title">Запросы</div>

      <form
        className="filter-section"
        onSubmit={(event) => {
          event.preventDefault()
          dispatch(applyRange())
        }}
      >
        <div className="filter-head">
          Фильтр частоты доминирующего
          <br />
          интервала
        </div>
        <div className="filter-body">
          <div className="slider-container">
            <div className="slider-labels">
              <span
                className="slider-label"
                style={{ left: `${range.min}%` }}
              >
                {range.min.toFixed(1)}
              </span>
              <span
                className="slider-label"
                style={{ left: `${range.max}%` }}
              >
                {range.max.toFixed(1)}
              </span>
            </div>
            <div className="slider-track-container">
              <div className="slider-track" />
              <input
                aria-label="Значение первого ползунка"
                className="range-input"
                disabled={composersLoading}
                max="100"
                min="0"
                onChange={(event) => updateMinimum(Number(event.target.value))}
                onFocus={() => setActiveThumb('min')}
                step="0.1"
                onPointerDown={() => setActiveThumb('min')}
                type="range"
                value={range.min}
                style={{ zIndex: activeThumb === 'min' ? 2 : 1 }}
              />
              <input
                aria-label="Значение второго ползунка"
                className="range-input"
                disabled={composersLoading}
                max="100"
                min="0"
                onChange={(event) => updateMaximum(Number(event.target.value))}
                onFocus={() => setActiveThumb('max')}
                step="0.1"
                onPointerDown={() => setActiveThumb('max')}
                type="range"
                value={range.max}
                style={{ zIndex: activeThumb === 'max' ? 2 : 1 }}
              />
            </div>
          </div>
          <Button
            className={`apply-btn${composersLoading ? ' request-pending' : ''}`}
            disabled={composersLoading}
            type="submit"
            variant="custom"
          >
            Применить
          </Button>
        </div>
      </form>

      {error && (
        <div aria-live="polite" className="composers-message" role="alert">
          {error}
        </div>
      )}
      {mutationError && (
        <div aria-live="polite" className="composers-message" role="alert">
          {mutationError}
        </div>
      )}
      <div className="grid-cards">
        {visibleComposers.length === 0 ? (
          composersLoading ? null : (
            <div className="no-items">Композиторы не найдены</div>
          )
        ) : (
          visibleComposers.map((composer) => (
            <GridCard
              indicator={composer}
              canDelete={isAuthenticated && composer.currentUserIsCreator}
              isLiked={likedById[composer.id] ?? false}
              isDisabled={
                composersLoading ||
                !isAuthenticated ||
                pendingLikeIds.includes(composer.id) ||
                pendingDeleteIds.includes(composer.id)
              }
              isLikePending={pendingLikeIds.includes(composer.id)}
              isDeletePending={pendingDeleteIds.includes(composer.id)}
              key={composer.id}
              onDelete={() =>
                dispatch(deleteComposer({ composerId: composer.id }))
              }
              onLike={() =>
                dispatch(
                  toggleComposerLike({
                    composerId: composer.id,
                    isLiked: !(likedById[composer.id] ?? false),
                  }),
                )
              }
            />
          ))
        )}
      </div>
    </main>
  )
}
