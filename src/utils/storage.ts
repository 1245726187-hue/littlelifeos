import { STORAGE_KEYS } from '@/types'

/**
 * Export all app data as a JSON blob.
 */
export function exportAllData(): string {
  const data: Record<string, unknown> = {}
  for (const key of Object.values(STORAGE_KEYS)) {
    const raw = localStorage.getItem(key)
    if (raw) {
      try {
        data[key] = JSON.parse(raw)
      } catch {
        data[key] = raw
      }
    }
  }
  return JSON.stringify(data, null, 2)
}

/**
 * Import all app data from a JSON blob.
 * Returns true if successful.
 */
export function importAllData(json: string): boolean {
  try {
    const data = JSON.parse(json)
    for (const key of Object.values(STORAGE_KEYS)) {
      if (key in data) {
        const value = data[key]
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
      }
    }
    return true
  } catch {
    return false
  }
}

/**
 * Clear all app data from localStorage.
 */
export function clearAllData(): void {
  for (const key of Object.values(STORAGE_KEYS)) {
    localStorage.removeItem(key)
  }
}

/**
 * Get the approximate size of localStorage usage in KB.
 */
export function getStorageSize(): number {
  let total = 0
  for (const key of Object.values(STORAGE_KEYS)) {
    const item = localStorage.getItem(key)
    if (item) {
      total += item.length * 2 // UTF-16
    }
  }
  return Math.round(total / 1024)
}

/**
 * Get the estimated maximum localStorage capacity (5MB).
 */
export function getStorageMaxSize(): number {
  return 5 * 1024 // 5MB in KB
}
