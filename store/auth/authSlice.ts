import { createAsyncThunk, createSlice, type Dispatch, type PayloadAction } from '@reduxjs/toolkit'
import {
  clearAuthStorage,
  persistLoginSession,
  readLocalSessionUser,
  setUserData,
  type AuthUser,
} from '@/lib/authSession'
import { clearEventPopupState, markEventPopupLoginPending } from '@/lib/eventPopupStorage'

export type { AuthUser }

export interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  hydrated: boolean
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  hydrated: false,
}

export const hydrateAuth = createAsyncThunk(
  'auth/hydrate',
  async (_, { getState }) => {
    const state = getState() as { auth: AuthState }
    if (state.auth.hydrated) {
      return { skipped: true as const, user: null }
    }

    // Expired/missing access token: never trust redux-persist user alone
    const localUser = readLocalSessionUser()
    if (!localUser) {
      clearAuthStorage()
      clearEventPopupState()
      return { skipped: false as const, user: null }
    }

    setUserData(localUser)
    return { skipped: false as const, user: localUser }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload
      state.isAuthenticated = true
      state.isLoading = false
      state.hydrated = true
    },
    clearAuth: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.isLoading = false
      state.hydrated = true
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateAuth.fulfilled, (state, action) => {
        if (!action.payload.skipped && action.payload.user) {
          state.user = action.payload.user
          state.isAuthenticated = true
        }
        if (!action.payload.skipped && !action.payload.user) {
          state.user = null
          state.isAuthenticated = false
        }
        state.isLoading = false
        state.hydrated = true
      })
      .addCase(hydrateAuth.rejected, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.isLoading = false
        state.hydrated = true
      })
  },
})

export const { setCredentials, clearAuth, setLoading } = authSlice.actions

export const loginUser =
  (payload: { user: AuthUser; accessToken: string; refreshToken: string }) =>
  (dispatch: Dispatch) => {
    persistLoginSession(payload.user, payload.accessToken, payload.refreshToken)
    markEventPopupLoginPending()
    dispatch(setCredentials(payload.user))
  }

export const logoutUser = () => (dispatch: Dispatch) => {
  clearAuthStorage()
  clearEventPopupState()
  dispatch(clearAuth())
}

export default authSlice.reducer
