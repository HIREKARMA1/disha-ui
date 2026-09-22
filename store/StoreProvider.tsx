'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { Provider } from 'react-redux'
import { hydrateAuth } from './auth/authSlice'
import { getPersistor, getStore } from './index'

export function StoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef(getStore())
  const persistorRef = useRef(getPersistor())
  const hydratedRef = useRef(false)

  useEffect(() => {
    const store = storeRef.current
    const persistor = persistorRef.current

    const runHydrate = () => {
      if (hydratedRef.current) return
      if (!persistor.getState().bootstrapped) return
      hydratedRef.current = true
      void store.dispatch(hydrateAuth())
    }

    runHydrate()
    return persistor.subscribe(runHydrate)
  }, [])

  return <Provider store={storeRef.current}>{children}</Provider>
}
