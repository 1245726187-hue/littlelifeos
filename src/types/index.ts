// ============================
// AI / API
// ============================
export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface DeepSeekResponse {
  id: string
  choices: {
    index: number
    message: { role: string; content: string }
    finish_reason: string
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// ============================
// Food Planner
// ============================
export type FoodMood = 'lazy' | 'ritual' | 'energy' | 'random'

export interface Recipe {
  id: string
  name: string
  description: string
  ingredients: string[]
  steps: string[]
  time: string
  mood: string
  userIngredients: string
  createdAt: string
}

// ============================
// Link Walker
// ============================
export interface SavedLink {
  id: string
  title: string
  url: string
  tags: string[]
  createdAt: string
}

// ============================
// Task Crusher
// ============================
export interface MicroStep {
  id: string
  text: string
  completed: boolean
}

export interface CrushedTask {
  id: string
  originalTask: string
  microSteps: MicroStep[]
  createdAt: string
  completedAt: string | null
}

// ============================
// Achievement Log (Reverse Todo)
// ============================
export interface AchievementEntry {
  id: string
  date: string
  items: string[]
  aiSummary: {
    title: string
    summary: string
    achievements: string[]
  } | null
  createdAt: string
}

// ============================
// Streak
// ============================
export interface StreakData {
  currentStreak: number
  longestStreak: number
  lastVisitDate: string
  visitHistory: string[]
}

// ============================
// App State
// ============================
export interface AppState {
  apiKey: string | null
  onboardingComplete: boolean
}

// ============================
// Storage Keys
// ============================
export const STORAGE_KEYS = {
  apiKey: 'llos-api-key',
  streak: 'llos-streak',
  foodPlans: 'llos-food-plans',
  savedLinks: 'llos-saved-links',
  taskHistory: 'llos-task-history',
  achievements: 'llos-achievements',
  onboardingComplete: 'llos-onboarding-complete',
} as const
