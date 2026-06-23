import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Moon, Plus, Trash2, Sparkles, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { chat, parseAIResponse } from '@/services/ai'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import EmptyState from '@/components/EmptyState'
import { AI_PROMPTS } from '@/constants'
import { generateId, getTodayStr, formatDate } from '@/utils/date'
import { STORAGE_KEYS, type AchievementEntry } from '@/types'

export default function AchievementLog() {
  const [entries, setEntries] = useLocalStorage<AchievementEntry[]>(
    STORAGE_KEYS.achievements,
    []
  )
  const [newItem, setNewItem] = useState('')
  const [loading, setLoading] = useState(false)

  const todayStr = getTodayStr()
  const todayEntry = entries.find((e) => e.date === todayStr)

  const handleAddItem = () => {
    const trimmed = newItem.trim()
    if (!trimmed) return

    if (todayEntry) {
      setEntries((prev) =>
        prev.map((e) =>
          e.date === todayStr ? { ...e, items: [...e.items, trimmed] } : e
        )
      )
    } else {
      const entry: AchievementEntry = {
        id: generateId(),
        date: todayStr,
        items: [trimmed],
        aiSummary: null,
        createdAt: new Date().toISOString(),
      }
      setEntries((prev) => [entry, ...prev])
    }
    setNewItem('')
  }

  const handleRemoveItem = (itemIdx: number) => {
    if (!todayEntry) return
    const newItems = todayEntry.items.filter((_, i) => i !== itemIdx)
    if (newItems.length === 0) {
      setEntries((prev) => prev.filter((e) => e.date !== todayStr))
    } else {
      setEntries((prev) =>
        prev.map((e) =>
          e.date === todayStr ? { ...e, items: newItems } : e
        )
      )
    }
  }

  const handleGenerateSummary = async () => {
    if (!todayEntry || todayEntry.items.length === 0) {
      toast.error('今天还没有记录任何成就')
      return
    }

    setLoading(true)
    try {
      const systemMsg = { role: 'system' as const, content: '你是一位温暖的生活观察者。请始终返回严格的 JSON 格式，不要添加 markdown 代码块。' }
      const userMsg = { role: 'user' as const, content: AI_PROMPTS.achievementSummary(todayEntry.items) }
      const raw = await chat([systemMsg, userMsg], { temperature: 0.8, max_tokens: 800 })

      const parsed = parseAIResponse<{
        title: string
        summary: string
        achievements: string[]
      }>(raw, {
        title: '今日小结',
        summary: `今天你完成了 ${todayEntry.items.length} 件小事，每一件都值得被记住。`,
        achievements: todayEntry.items.map((item) => `✓ ${item}`),
      })

      setEntries((prev) =>
        prev.map((e) =>
          e.date === todayStr ? { ...e, aiSummary: parsed } : e
        )
      )
      toast.success('✨ 今日小结已生成')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '生成失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
    toast.success('已删除')
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-xl font-semibold text-calm-900 font-[family-name:var(--font-serif)] mb-1">
          反向待办清单
        </h2>
        <p className="text-sm text-calm-500">不记录未来要做什么，只记录今天已经完成的事</p>
      </motion.div>

      {/* Today's input */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/80">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Moon className="h-4 w-4 text-indigo-500" />
            今天完成了什么？
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="喝水、散步、读书..."
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddItem()
                }
              }}
            />
            <Button
              onClick={handleAddItem}
              size="icon"
              className="shrink-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Today's items */}
          {todayEntry && todayEntry.items.length > 0 && (
            <div className="space-y-1.5">
              {todayEntry.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-calm-50/50 text-sm text-calm-700 group"
                >
                  <span className="text-green-500 shrink-0">✓</span>
                  <span className="flex-1">{item}</span>
                  <button
                    onClick={() => handleRemoveItem(i)}
                    className="opacity-0 group-hover:opacity-100 text-calm-400 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateSummary}
                disabled={loading}
                className="w-full mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    AI 正在生成小结...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5" />
                    生成今日小结
                  </span>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Summary for today */}
      <AnimatePresence>
        {todayEntry?.aiSummary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-indigo-50/50 to-white/70 backdrop-blur-sm border-indigo-100/50 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                  <span className="text-xs font-medium text-indigo-500 uppercase tracking-wider">
                    今日小结
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-calm-900 mb-2 font-[family-name:var(--font-serif)]">
                  {todayEntry.aiSummary.title}
                </h3>
                <p className="text-sm text-calm-600 leading-relaxed mb-4">
                  {todayEntry.aiSummary.summary}
                </p>
                <div className="space-y-1">
                  {todayEntry.aiSummary.achievements.map((a, i) => (
                    <p key={i} className="text-sm text-calm-700 flex items-center gap-2">
                      <span className="text-indigo-400">✦</span>
                      {a}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History */}
      <AnimatePresence>
        {entries.length === 0 ? (
          <EmptyState
            icon="🌙"
            title="这里还空空的，等你放一点生活进去。"
            description="今天完成了什么小事？记下来吧"
          />
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-medium text-calm-400 uppercase tracking-wider">
              记录历史
            </p>
            {entries
              .filter((e) => e.date !== todayStr)
              .map((entry, idx) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <Card className="bg-white/60 backdrop-blur-sm border-white/80">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {formatDate(entry.date)}
                          </Badge>
                          <span className="text-xs text-calm-500">
                            {entry.items.length} 件小事
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-calm-400 hover:text-red-500"
                          onClick={() => handleDeleteEntry(entry.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {entry.items.map((item, i) => (
                          <Badge key={i} variant="outline" className="text-xs bg-white/50">
                            ✓ {item}
                          </Badge>
                        ))}
                      </div>
                      {entry.aiSummary && (
                        <p className="text-xs text-calm-500 mt-2 italic line-clamp-1">
                          {entry.aiSummary.summary}
                        </p>
                      )}
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
