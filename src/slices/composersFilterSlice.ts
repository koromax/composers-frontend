import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface FilterRange {
  min: number
  max: number
}

interface ComposersFilterState {
  range: FilterRange
  appliedRange: FilterRange
}

const initialState: ComposersFilterState = {
  range: { min: 0, max: 100 },
  appliedRange: { min: 0, max: 100 },
}

const composersFilterSlice = createSlice({
  name: 'composersFilter',
  initialState,
  reducers: {
    setMinimum(state, action: PayloadAction<number>) {
      state.range.min = action.payload
    },
    setMaximum(state, action: PayloadAction<number>) {
      state.range.max = action.payload
    },
    applyRange(state) {
      state.appliedRange = {
        min: Math.min(state.range.min, state.range.max),
        max: Math.max(state.range.min, state.range.max),
      }
    },
    resetRange(state) {
      state.range = { ...initialState.range }
      state.appliedRange = { ...initialState.appliedRange }
    },
  },
})

export const { applyRange, resetRange, setMaximum, setMinimum } =
  composersFilterSlice.actions

export default composersFilterSlice.reducer
