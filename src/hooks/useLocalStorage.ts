import { useState, useEffect, useCallback } from 'react'

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : defaultValue
    } catch {
      return defaultValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // localStorage full or inaccessible
    }
  }, [key, value])

  const remove = useCallback(() => {
    try {
      localStorage.removeItem(key)
    } catch {
      // ignore
    }
    setValue(defaultValue)
  }, [key, defaultValue])

  return [value, setValue, remove] as const
}
