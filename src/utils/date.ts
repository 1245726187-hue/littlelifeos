/**
 * Format a date string to a human-readable form.
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Format a date string to relative format (今天, 昨天, X天前).
 */
export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)

  const diffMs = today.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `${diffDays} 天前`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} 周前`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} 个月前`
  return `${Math.floor(diffDays / 365)} 年前`
}

/**
 * Get today's date string in YYYY-MM-DD format.
 */
export function getTodayStr(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Get the number of days between two date strings.
 */
export function daysBetween(dateStr1: string, dateStr2: string): number {
  const d1 = new Date(dateStr1)
  const d2 = new Date(dateStr2)
  d1.setHours(0, 0, 0, 0)
  d2.setHours(0, 0, 0, 0)
  const diffMs = Math.abs(d2.getTime() - d1.getTime())
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

/**
 * Generate a simple unique ID.
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/**
 * Check if the date string is today.
 */
export function isToday(dateStr: string): boolean {
  return dateStr === getTodayStr()
}

/**
 * Get short date format (MM/DD).
 */
export function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
  })
}
