import { configureStore } from '@reduxjs/toolkit'
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  type Persistor,
} from 'redux-persist'
import createWebStorage from 'redux-persist/lib/storage/createWebStorage'
import authReducer from './auth/authSlice'

function createNoopStorage() {
  return {
    getItem(_key: string) {
      return Promise.resolve(null)
    },
    setItem(_key: string, value: string) {
      return Promise.resolve(value)
    },
    removeItem(_key: string) {
      return Promise.resolve()
    },
  }
}

const storage = typeof window !== 'undefined' ? createWebStorage('local') : createNoopStorage()

const authPersistConfig = {
  key: 'disha-auth',
  storage,
  whitelist: ['user', 'isAuthenticated'],
}

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer)

export function makeStore() {
  return configureStore({
    reducer: {
      auth: persistedAuthReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']

let browserStore: AppStore | undefined
let browserPersistor: Persistor | undefined

export function getStore(): AppStore {
  if (typeof window === 'undefined') {
    return makeStore()
  }
  if (!browserStore) {
    browserStore = makeStore()
  }
  return browserStore
}

export function getPersistor(): Persistor {
  const store = getStore()
  if (typeof window === 'undefined') {
    return persistStore(store)
  }
  if (!browserPersistor) {
    browserPersistor = persistStore(store)
  }
  return browserPersistor
}
