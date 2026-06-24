import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChefHat, Clock, Plus, Trash2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { chat, parseAIResponse } from '@/services/ai'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
    if (valid.length === 0) { toast.error('请至少输入一种食材'); return }
    setLoading(true)
    const ingredientStr = valid.join('、')
    const moodLabel = FOOD_MOODS.find((m) => m.value === mood)?.label ?? '随便'
    try {
      const raw = await chat([
        { role: 'system', content: '你是一位温暖的家庭厨师助手。请始终返回严格的 JSON 格式，不要添加 markdown 代码块。' },
        { role: 'user', content: AI_PROMPTS.foodPlan(ingredientStr, moodLabel) },
      ], { temperature: 0.8, max_tokens: 1500 })
      const parsed = parseAIResponse<{ name: string; description: string; ingredients: string[]; steps: string[]; time: string; mood: string }>(raw, {
        name: '今日推荐', description: '根据你的食材搭配的一道菜', ingredients: valid, steps: ['准备食材', '开始烹饪', '享用美食'], time: '20分钟', mood: '随心搭配',
      })
      const recipe: Recipe = { id: generateId(), ...parsed, userIngredients: ingredientStr, createdAt: new Date().toISOString() }
      setRecipes((prev) => [recipe, ...prev])
      toast.success('菜单已生成 ✨')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '生成失败，请重试')
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
        <h1 className="apple-title text-app-gray-900">这周吃什么</h1>
        <p className="text-[15px] text-app-gray-500 mt-1">告诉 AI 你的食材，帮你搭配</p>
      </motion.div>

      {/* Input card */}
      <div className="bg-app-card rounded-xl p-5 space-y-4">
        <div className="space-y-2">
          {ingredients.map((item, i) => (
            <div key={i} className="flex gap-2">
              <Input
                placeholder={`食材 ${i + 1}，如：鸡蛋`}
                value={item}
                onChange={(e) => updateIngredient(i, e.target.value)}
                className="h-10 text-[15px] bg-app-gray-50 border-app-gray-200 rounded-lg shadow-none"
              />
              {ingredients.length > 1 && (
                <Button variant="ghost" size="icon" onClick={() => removeIngredient(i)} className="shrink-0 text-app-gray-400 hover:text-app-red h-10 w-10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button variant="ghost" size="sm" onClick={addIngredient} className="text-app-blue text-xs">
          <Plus className="h-3.5 w-3.5 mr-1" /> 添加食材
        </Button>

        <div>
          <p className="text-[13px] font-medium text-app-gray-600 mb-2">状态</p>
          <div className="grid grid-cols-2 gap-2">
            {FOOD_MOODS.map((m) => (
              <button
                key={m.value}
                onClick={() => setMood(m.value)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-[13px] transition-colors ${
                  mood === m.value
                    ? 'border-app-blue bg-app-blue-light/30 text-app-blue font-medium'
                    : 'border-app-gray-200 text-app-gray-600 hover:bg-app-gray-50'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={handleGenerate} disabled={loading} className="w-full h-11 rounded-lg bg-app-gray-900 hover:bg-app-gray-800 text-white">
          {loading ? (
            <span className="flex items-center gap-2"><RefreshCw className="h-4 w-4 animate-spin" /> AI 搭配中...</span>
          ) : (
            <span className="flex items-center gap-2"><ChefHat className="h-4 w-4" /> 生成菜单</span>
          )}
        </Button>
      </div>

      {loading && (
        <div className="bg-app-card rounded-xl p-5 space-y-3">
          <div className="h-5 w-28 bg-app-gray-100 rounded animate-soft-pulse" />
          <div className="h-4 w-48 bg-app-gray-100 rounded animate-soft-pulse" />
          <div className="space-y-2"><div className="h-3 w-full bg-app-gray-100 rounded animate-soft-pulse" /><div className="h-3 w-3/4 bg-app-gray-100 rounded animate-soft-pulse" /></div>
        </div>
      )}

      <AnimatePresence>
        {recipes.length === 0 && !loading ? (
          <EmptyState icon="🍳" title="还没有生成菜单" description="输入食材，让 AI 帮你想想今天吃什么" />
        ) : (
          <div className="space-y-3">
            {recipes.map((recipe, idx) => (
              <motion.div key={recipe.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                <div className="bg-app-card rounded-xl p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-[17px] font-semibold text-app-gray-900 flex items-center gap-2">
                        {recipe.name}
                        <Badge variant="secondary" className="text-[11px] font-normal bg-app-gray-100 text-app-gray-600">{recipe.mood}</Badge>
                      </h3>
                      <p className="text-[13px] text-app-gray-500 mt-1">{recipe.description}</p>
                    </div>
                    <button onClick={() => { setRecipes((prev) => prev.filter((r) => r.id !== recipe.id)); toast.success('已删除') }} className="text-app-gray-300 hover:text-app-red shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-app-gray-400 uppercase tracking-wider mb-2">食材</p>
                    <div className="flex flex-wrap gap-1.5">
                      {recipe.ingredients.map((ing) => (
                        <Badge key={ing} variant="outline" className="text-[12px] bg-app-gray-50 border-app-gray-200 text-app-gray-700">{ing}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-app-gray-400 uppercase tracking-wider mb-2">步骤</p>
                    <ol className="space-y-1.5">
                      {recipe.steps.map((step, i) => (
                        <li key={i} className="flex gap-2 text-[14px] text-app-gray-700">
                          <span className="text-app-blue font-medium shrink-0">{i + 1}.</span> {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div className="flex items-center gap-4 text-[12px] text-app-gray-400">
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{recipe.time}</span>
                    <span>{formatDate(recipe.createdAt)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
