import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { STORAGE_KEYS } from '@/types'

interface AppContextType {
  apiKey: string
  hasApiKey: boolean
  setApiKey: (key: string) => void
  clearApiKey: () => void
  onboardingComplete: boolean
  setOnboardingComplete: (v: boolean) => void
}

const AppContext = createContext<AppContextType | null>(null)

function readApiKey(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.apiKey)
    if (!raw) return ''
    return JSON.parse(raw) as string
  } catch {
    return ''
  }
}

function readOnboardingComplete(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.onboardingComplete)
    if (!raw) return false
    return JSON.parse(raw) as boolean
  } catch {
    return false
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKeyState] = useState<string>(readApiKey)
  const [onboardingComplete, setOnboardingCompleteState] = useState<boolean>(readOnboardingComplete)

  const setApiKey = useCallback((key: string) => {
    setApiKeyState(key)
    localStorage.setItem(STORAGE_KEYS.apiKey, JSON.stringify(key))
    setOnboardingCompleteState(true)
    localStorage.setItem(STORAGE_KEYS.onboardingComplete, JSON.stringify(true))
  }, [])

  const clearApiKey = useCallback(() => {
    setApiKeyState('')
    localStorage.removeItem(STORAGE_KEYS.apiKey)
    setOnboardingCompleteState(false)
    localStorage.setItem(STORAGE_KEYS.onboardingComplete, JSON.stringify(false))
  }, [])

  const setOnboardingComplete = useCallback((v: boolean) => {
    setOnboardingCompleteState(v)
    localStorage.setItem(STORAGE_KEYS.onboardingComplete, JSON.stringify(v))
  }, [])

  return (
    <AppContext.Provider
      value={{
        apiKey,
        hasApiKey: apiKey.length > 0,
        setApiKey,
        clearApiKey,
        onboardingComplete,
        setOnboardingComplete,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext(): AppContextType {
  const ctx = useContext(AppContext)
  if (!ctx) {
    throw new Error('useAppContext must be used within AppProvider')
  }
  return ctx
}
