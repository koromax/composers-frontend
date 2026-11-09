import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  login: string
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  login: '',
  isAuthenticated: false,
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authRequestStarted(state) {
      state.loading = true
      state.error = null
    },
    loginSucceeded(state, action: PayloadAction<string>) {
      state.login = action.payload
      state.isAuthenticated = true
      state.loading = false
      state.error = null
    },
    authRequestFailed(state, action: PayloadAction<string>) {
      state.loading = false
      state.error = action.payload
    },
    logoutSucceeded(state) {
      state.login = ''
      state.isAuthenticated = false
      state.loading = false
      state.error = null
    },
    clearAuthError(state) {
      state.error = null
    },
  },
})

export const {
  authRequestFailed,
  authRequestStarted,
  clearAuthError,
  loginSucceeded,
  logoutSucceeded,
} = authSlice.actions

export default authSlice.reducer
