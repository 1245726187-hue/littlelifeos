import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChefHat, Clock, Plus, Trash2, Sparkles, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { chat, parseAIResponse } from '@/services/ai'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import EmptyState from '@/components/EmptyState'
import { FOOD_MOODS, AI_PROMPTS } from '@/constants'
import { generateId, formatDate } from '@/utils/date'
import { STORAGE_KEYS, type Recipe, type FoodMood } from '@/types'

export default function FoodPlanner() {
  const [recipes, setRecipes] = useLocalStorage<Recipe[]>(STORAGE_KEYS.foodPlans, [])
  const [ingredients, setIngredients] = useState<string[]>([''])
  const [mood, setMood] = useState<FoodMood>('random')
  const [loading, setLoading] = useState(false)

  const addIngredient = () => setIngredients([...ingredients, ''])
  const removeIngredient = (i: number) => {
    if (ingredients.length <= 1) return
    setIngredients(ingredients.filter((_, idx) => idx !== i))
  }
  const updateIngredient = (i: number, v: string) => {
    const next = [...ingredients]
    next[i] = v
    setIngredients(next)
  }

  const handleGenerate = async () => {
    const valid = ingredients.map((s) => s.trim()).filter(Boolean)
    if (valid.length === 0) {
      toast.error('请至少输入一种食材')
      return
    }

    setLoading(true)
    const ingredientStr = valid.join('、')
    const moodLabel = FOOD_MOODS.find((m) => m.value === mood)?.label ?? '随便'

    try {
      const systemMsg = { role: 'system' as const, content: '你是一位温暖的家庭厨师助手。请始终返回严格的 JSON 格式，不要添加 markdown 代码块。' }
      const userMsg = { role: 'user' as const, content: AI_PROMPTS.foodPlan(ingredientStr, moodLabel) }
      const raw = await chat([systemMsg, userMsg], { temperature: 0.8, max_tokens: 1500 })

      const parsed = parseAIResponse<{
        name: string
        description: string
        ingredients: string[]
        steps: string[]
        time: string
        mood: string
      }>(raw, {
        name: '今日推荐',
        description: '根据你的食材搭配的一道菜',
        ingredients: valid,
        steps: ['准备食材', '开始烹饪', '享用美食'],
        time: '20分钟',
        mood: '随心搭配',
      })

      const recipe: Recipe = {
        id: generateId(),
        name: parsed.name,
        description: parsed.description,
        ingredients: parsed.ingredients,
        steps: parsed.steps,
        time: parsed.time,
        mood: parsed.mood,
        userIngredients: ingredientStr,
        createdAt: new Date().toISOString(),
      }

      setRecipes((prev) => [recipe, ...prev])
      toast.success('✨ 菜单已生成')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '生成失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (id: string) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id))
    toast.success('已删除')
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-xl font-semibold text-calm-900 font-[family-name:var(--font-serif)] mb-1">
          这周吃什么
        </h2>
        <p className="text-sm text-calm-500">告诉 AI 你冰箱里的食材，帮你搭配今天的菜</p>
      </motion.div>

      {/* Input area */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/80">
        <CardHeader>
          <CardTitle className="text-base">冰箱食材</CardTitle>
          <CardDescription>输入你手边有的食材</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {ingredients.map((item, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder={`食材 ${i + 1}，如：鸡蛋`}
                  value={item}
                  onChange={(e) => updateIngredient(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      if (i === ingredients.length - 1 && item.trim()) {
                        addIngredient()
                      }
                    }
                  }}
                />
                {ingredients.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeIngredient(i)}
                    className="shrink-0 text-calm-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={addIngredient}
            className="text-calm-500"
          >
            <Plus className="h-4 w-4 mr-1" /> 添加食材
          </Button>

          {/* Mood selector */}
          <div>
            <p className="text-sm font-medium text-calm-700 mb-2">今天的状态</p>
            <div className="grid grid-cols-2 gap-2">
              {FOOD_MOODS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMood(m.value)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-all ${
                    mood === m.value
                      ? 'border-warm-400 bg-warm-50 text-warm-700 shadow-sm'
                      : 'border-[hsl(var(--border))] bg-transparent text-calm-600 hover:bg-calm-50'
                  }`}
                >
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full h-11"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                AI 正在为你搭配...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <ChefHat className="h-4 w-4" />
                生成菜单
              </span>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Loading skeleton */}
      {loading && (
        <Card className="bg-white/70 backdrop-blur-sm border-white/80 overflow-hidden">
          <CardContent className="p-6 space-y-4">
            <div className="h-6 w-32 bg-calm-100 rounded animate-soft-pulse" />
            <div className="h-4 w-64 bg-calm-100 rounded animate-soft-pulse" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-calm-100 rounded animate-soft-pulse" />
              <div className="h-3 w-3/4 bg-calm-100 rounded animate-soft-pulse" />
              <div className="h-3 w-1/2 bg-calm-100 rounded animate-soft-pulse" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recipe list */}
      <AnimatePresence>
        {recipes.length === 0 && !loading ? (
          <EmptyState
            icon="🍳"
            title="还没有生成菜单"
            description="输入食材，让 AI 帮你想想今天吃什么"
          />
        ) : (
          <div className="space-y-4">
            {recipes.map((recipe, idx) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 20, rotateX: -10 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
              >
                <Card className="bg-white/70 backdrop-blur-sm border-white/80 overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {recipe.name}
                          <Badge variant="secondary" className="text-xs font-normal">
                            {recipe.mood}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {recipe.description}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(recipe.id)}
                        className="text-calm-400 hover:text-red-500 shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-xs font-medium text-calm-500 mb-2">🥬 食材</p>
                      <div className="flex flex-wrap gap-1.5">
                        {recipe.ingredients.map((ing) => (
                          <Badge key={ing} variant="outline" className="text-xs bg-white/50">
                            {ing}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-calm-500 mb-2">📝 步骤</p>
                      <ol className="space-y-1.5">
                        {recipe.steps.map((step, i) => (
                          <li key={i} className="flex gap-2 text-sm text-calm-700">
                            <span className="text-warm-500 font-medium shrink-0">{i + 1}.</span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-calm-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {recipe.time}
                      </span>
                      <span>食材：{recipe.userIngredients}</span>
                      <span className="ml-auto">{formatDate(recipe.createdAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
