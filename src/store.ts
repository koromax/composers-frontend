import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import composersReducer from './slices/composersSlice'
import composersFilterReducer from './slices/composersFilterSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    composers: composersReducer,
    composersFilter: composersFilterReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActionPaths: ['meta.arg.image', 'meta.arg.video'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
