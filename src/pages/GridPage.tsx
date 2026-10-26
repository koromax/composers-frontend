import { useState } from 'react'
import { Button } from 'react-bootstrap'
import { GridCard } from '../components/GridCard'
import { COMPOSERS_MOCK } from '../data/composers'

export function GridPage() {
  const [range, setRange] = useState({ min: 0, max: 100 })
  const [appliedRange, setAppliedRange] = useState({ min: 0, max: 100 })
  const [activeThumb, setActiveThumb] = useState<'min' | 'max'>('max')
  const [deletedIds, setDeletedIds] = useState<number[]>([])
  const [likeCounts, setLikeCounts] = useState<Record<number, number>>({})
  const filterMin = Math.min(appliedRange.min, appliedRange.max)
  const filterMax = Math.max(appliedRange.min, appliedRange.max)

  const composers = COMPOSERS_MOCK.filter(
    ({ freq1, id }) =>
      !deletedIds.includes(id) &&
      freq1 >= filterMin &&
      freq1 <= filterMax,
  )

  function updateMinimum(value: number) {
    setRange((current) => ({ ...current, min: value }))
    if (value === range.max) {
      setActiveThumb('max')
    }
  }

  function updateMaximum(value: number) {
    setRange((current) => ({ ...current, max: value }))
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
          setAppliedRange({
            min: Math.min(range.min, range.max),
            max: Math.max(range.min, range.max),
          })
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
          <Button className="apply-btn" type="submit" variant="custom">
            Применить
          </Button>
        </div>
      </form>

      <div className="grid-cards">
        {composers.length === 0 ? (
          <div className="no-items">Композиторы не найдены</div>
        ) : (
          composers.map((composer) => (
            <GridCard
              indicator={{
                ...composer,
                likesCount: likeCounts[composer.id] ?? composer.likesCount,
              }}
              key={composer.id}
              onDelete={() =>
                setDeletedIds((ids) => [...ids, composer.id])
              }
              onLike={() =>
                setLikeCounts((counts) => ({
                  ...counts,
                  [composer.id]:
                    (counts[composer.id] ?? composer.likesCount) + 1,
                }))
              }
            />
          ))
        )}
      </div>
    </main>
  )
}
