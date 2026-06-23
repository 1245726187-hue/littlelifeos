import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { getTodayStr } from '@/utils/date'
import type { StreakData } from '@/types'
import { STORAGE_KEYS } from '@/types'

const DEFAULT_STREAK: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastVisitDate: '',
  visitHistory: [],
}

export function useStreak() {
  const [streak, setStreak] = useLocalStorage<StreakData>(
    STORAGE_KEYS.streak,
    DEFAULT_STREAK
  )

  const recordVisit = useCallback(() => {
    const today = getTodayStr()
    setStreak((prev) => {
      if (prev.lastVisitDate === today) {
        return prev // Already visited today
      }

      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      let newStreak = 1
      if (prev.lastVisitDate === yesterdayStr) {
        newStreak = prev.currentStreak + 1
      } else if (prev.lastVisitDate === '') {
        newStreak = 1
      }

      const newHistory = [...prev.visitHistory]
      if (!newHistory.includes(today)) {
        newHistory.push(today)
        // Keep only last 365 days
        if (newHistory.length > 365) {
          newHistory.shift()
        }
      }

      return {
        currentStreak: newStreak,
        longestStreak: Math.max(prev.longestStreak, newStreak),
        lastVisitDate: today,
        visitHistory: newHistory,
      }
    })
  }, [setStreak])

  return {
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    lastVisitDate: streak.lastVisitDate,
    visitHistory: streak.visitHistory,
    recordVisit,
  }
}
