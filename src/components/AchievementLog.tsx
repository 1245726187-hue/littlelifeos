import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Moon, Plus, Trash2, Sparkles, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { chat, parseAIResponse } from '@/services/ai'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import EmptyState from '@/components/EmptyState'
import { AI_PROMPTS } from '@/constants'
import { generateId, getTodayStr, formatDate } from '@/utils/date'
import { STORAGE_KEYS, type AchievementEntry } from '@/types'

export default function AchievementLog() {
  const [entries, setEntries] = useLocalStorage<AchievementEntry[]>(STORAGE_KEYS.achievements, [])
  const [newItem, setNewItem] = useState('')
  const [loading, setLoading] = useState(false)
  const todayStr = getTodayStr()
  const todayEntry = entries.find((e) => e.date === todayStr)

  const handleAddItem = () => {
    const trimmed = newItem.trim()
    if (!trimmed) return
    if (todayEntry) {
      setEntries((prev) => prev.map((e) => e.date === todayStr ? { ...e, items: [...e.items, trimmed] } : e))
    } else {
      setEntries((prev) => [{ id: generateId(), date: todayStr, items: [trimmed], aiSummary: null, createdAt: new Date().toISOString() }, ...prev])
    }
    setNewItem('')
  }

  const handleRemoveItem = (i: number) => {
    if (!todayEntry) return
    const newItems = todayEntry.items.filter((_, idx) => idx !== i)
    if (newItems.length === 0) setEntries((prev) => prev.filter((e) => e.date !== todayStr))
    else setEntries((prev) => prev.map((e) => e.date === todayStr ? { ...e, items: newItems } : e))
  }

  const handleGenerateSummary = async () => {
    if (!todayEntry || todayEntry.items.length === 0) { toast.error('今天还没有记录'); return }
    setLoading(true)
    try {
      const raw = await chat([
        { role: 'system', content: '你是一位温暖的生活观察者。请始终返回严格的 JSON 格式。' },
        { role: 'user', content: AI_PROMPTS.achievementSummary(todayEntry.items) },
      ], { temperature: 0.8, max_tokens: 800 })
      const parsed = parseAIResponse<{ title: string; summary: string; achievements: string[] }>(raw, {
        title: '今日小结', summary: `今天你完成了 ${todayEntry.items.length} 件小事。`, achievements: todayEntry.items.map((item) => `✓ ${item}`),
      })
      setEntries((prev) => prev.map((e) => e.date === todayStr ? { ...e, aiSummary: parsed } : e))
      toast.success('小结已生成 ✨')
    } catch (err) { toast.error(err instanceof Error ? err.message : '生成失败') }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
        <h1 className="apple-title text-app-gray-900">反向待办</h1>
        <p className="text-[15px] text-app-gray-500 mt-1">记录今天已完成的事</p>
      </motion.div>

      <div className="bg-app-card rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Moon className="h-4 w-4 text-app-purple" />
          <span className="text-[15px] font-medium text-app-gray-900">今天完成了什么？</span>
        </div>
        <div className="flex gap-2">
          <Input placeholder="喝水、散步、读书..." value={newItem} onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddItem() } }}
            className="h-10 text-[15px] bg-app-gray-50 border-app-gray-200 rounded-lg shadow-none" />
          <Button onClick={handleAddItem} size="icon" className="shrink-0 h-10 w-10 rounded-lg bg-app-gray-900 hover:bg-app-gray-800"><Plus className="h-4 w-4" /></Button>
        </div>

        {todayEntry && todayEntry.items.length > 0 && (
          <div className="space-y-1.5">
            {todayEntry.items.map((item, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-app-gray-50 text-[14px] text-app-gray-700 group">
                <span className="text-app-green shrink-0">✓</span>
                <span className="flex-1">{item}</span>
                <button onClick={() => handleRemoveItem(i)} className="opacity-0 group-hover:opacity-100 text-app-gray-400 hover:text-app-red"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={handleGenerateSummary} disabled={loading} className="w-full mt-1 text-app-blue text-xs">
              {loading ? <span className="flex items-center gap-2"><RefreshCw className="h-3.5 w-3.5 animate-spin" /> 生成中...</span> :
                <span className="flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> 生成今日小结</span>}
            </Button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {todayEntry?.aiSummary && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-app-purple-light/30 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-app-purple" />
              <span className="text-[11px] font-medium text-app-purple uppercase tracking-wider">今日小结</span>
            </div>
            <h3 className="text-[17px] font-semibold text-app-gray-900 mb-2">{todayEntry.aiSummary.title}</h3>
            <p className="text-[14px] text-app-gray-600 leading-relaxed mb-3">{todayEntry.aiSummary.summary}</p>
            {todayEntry.aiSummary.achievements.map((a, i) => (
              <p key={i} className="text-[13px] text-app-gray-700 flex items-center gap-2"><span className="text-app-purple">✦</span>{a}</p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {entries.length === 0 ? (
        <EmptyState icon="🌙" title="这里还空空的" description="今天完成了什么小事？记下来吧" />
      ) : (
        <div className="space-y-1.5">
          <p className="text-[11px] font-medium text-app-gray-400 uppercase tracking-wider ml-1 mb-2">记录历史</p>
          {entries.filter((e) => e.date !== todayStr).map((entry, idx) => (
            <motion.div key={entry.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
              className="bg-app-card rounded-xl px-4 py-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[11px] bg-app-gray-100 text-app-gray-600">{formatDate(entry.date)}</Badge>
                  <span className="text-[11px] text-app-gray-400">{entry.items.length} 件小事</span>
                </div>
                <button onClick={() => { setEntries((p) => p.filter((e) => e.id !== entry.id)); toast.success('已删除') }} className="text-app-gray-300 hover:text-app-red"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
              <div className="flex flex-wrap gap-1">
                {entry.items.map((item, i) => (
                  <Badge key={i} variant="outline" className="text-[11px] bg-app-gray-50 border-app-gray-200 text-app-gray-600">✓ {item}</Badge>
                ))}
              </div>
              {entry.aiSummary && <p className="text-[12px] text-app-gray-400 mt-1.5 truncate">{entry.aiSummary.summary}</p>}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
