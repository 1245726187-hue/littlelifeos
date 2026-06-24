import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Check, Trash2, RefreshCw, PartyPopper } from 'lucide-react'
import { toast } from 'sonner'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { chat, parseAIResponse } from '@/services/ai'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import EmptyState from '@/components/EmptyState'
import { AI_PROMPTS } from '@/constants'
import { generateId, formatDate } from '@/utils/date'
import { STORAGE_KEYS, type CrushedTask, type MicroStep } from '@/types'

export default function TaskCrusher() {
  const [tasks, setTasks] = useLocalStorage<CrushedTask[]>(STORAGE_KEYS.taskHistory, [])
  const [newTask, setNewTask] = useState('')
  const [loading, setLoading] = useState(false)
  const [celebrating, setCelebrating] = useState<string | null>(null)

  const handleCrush = async () => {
    const trimmed = newTask.trim()
    if (!trimmed) { toast.error('请输入一个任务'); return }
    setLoading(true)
    try {
      const systemMsg = { role: 'system' as const, content: '你是一位温暖的任务拆解助手。请始终返回严格的 JSON 格式，不要添加 markdown 代码块。' }
      const userMsg = { role: 'user' as const, content: AI_PROMPTS.taskCrush(trimmed) }
      const raw = await chat([systemMsg, userMsg], { temperature: 0.7, max_tokens: 1500 })
      const parsed = parseAIResponse<{ steps: string[] }>(raw, { steps: ['开始第一步', '继续下一步', '完成任务'] })
      const steps: MicroStep[] = parsed.steps.map((text) => ({ id: generateId(), text, completed: false }))
      setTasks((prev) => [{ id: generateId(), originalTask: trimmed, microSteps: steps, createdAt: new Date().toISOString(), completedAt: null }, ...prev])
      setNewTask('')
      toast.success('任务已粉碎 ✨')
    } catch (err) { toast.error(err instanceof Error ? err.message : '拆解失败') }
    finally { setLoading(false) }
  }

  const toggleStep = (taskId: string, stepId: string) => {
    setTasks((prev) => prev.map((t) => {
      if (t.id !== taskId) return t
      const steps = t.microSteps.map((s) => s.id === stepId ? { ...s, completed: !s.completed } : s)
      const allDone = steps.every((s) => s.completed)
      return { ...t, microSteps: steps, completedAt: allDone ? new Date().toISOString() : null }
    }))
  }

  const handleDelete = (id: string) => { setTasks((prev) => prev.filter((t) => t.id !== id)); toast.success('已删除') }

  const completedCount = (t: CrushedTask) => t.microSteps.filter((s) => s.completed).length
  const totalCount = (t: CrushedTask) => t.microSteps.length

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
        <h1 className="apple-title text-app-gray-900">拖延症粉碎机</h1>
        <p className="text-[15px] text-app-gray-500 mt-1">把大任务交给 AI，拆成小到无法拒绝的步骤</p>
      </motion.div>

      {/* Input */}
      <div className="bg-app-card rounded-xl p-5 space-y-4">
        <Textarea
          placeholder="你拖延了什么？写报告、整理房间、准备考试..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          rows={3}
          className="text-[15px] bg-app-gray-50 border-app-gray-200 rounded-lg shadow-none resize-none"
          onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) { e.preventDefault(); handleCrush() } }}
        />
        <Button onClick={handleCrush} disabled={loading} className="w-full h-11 rounded-lg bg-app-gray-900 hover:bg-app-gray-800 text-white">
          {loading ? <span className="flex items-center gap-2"><RefreshCw className="h-4 w-4 animate-spin" />AI 粉碎中...</span> :
            <span className="flex items-center gap-2"><Zap className="h-4 w-4" />粉碎这个任务</span>}
        </Button>
        <p className="text-[11px] text-app-gray-400 text-center">Ctrl + Enter 快速粉碎</p>
      </div>

      {/* Task list — show ALL steps */}
      <AnimatePresence>
        {tasks.length === 0 && !loading ? (
          <EmptyState icon="💪" title="还没有粉碎过任务" description="输入一个让你头疼的大任务，把它变小" />
        ) : (
          <div className="space-y-3">
            {tasks.map((task, idx) => {
              const done = completedCount(task)
              const total = totalCount(task)
              const pct = total > 0 ? Math.round((done / total) * 100) : 0
              const allDone = done === total && total > 0

              return (
                <motion.div key={task.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                  <div className={`bg-app-card rounded-xl p-5 space-y-3 transition-colors ${allDone ? 'bg-app-green-light/30' : ''}`}>
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {allDone && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>🎉</motion.span>}
                          <h3 className={`text-[15px] font-semibold truncate ${allDone ? 'text-app-gray-400 line-through' : 'text-app-gray-900'}`}>
                            {task.originalTask}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Progress value={done} max={total} className="h-1 flex-1 max-w-24" />
                          <span className="text-[11px] text-app-gray-400">{done}/{total} · {pct}%</span>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {allDone && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-app-orange"
                            onClick={() => { setCelebrating(task.id); setTimeout(() => setCelebrating(null), 2500) }}>
                            <PartyPopper className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-app-gray-400 hover:text-app-red" onClick={() => handleDelete(task.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* ALL steps — no limit */}
                    <div className="space-y-1">
                      {task.microSteps.map((step) => (
                        <motion.button
                          key={step.id}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggleStep(task.id, step.id)}
                          className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-[14px] transition-colors ${
                            step.completed ? 'bg-app-green-light/50 text-app-gray-400 line-through' : 'hover:bg-app-gray-50 text-app-gray-700'
                          }`}
                        >
                          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                            step.completed ? 'border-app-green bg-app-green text-white' : 'border-app-gray-300'
                          }`}>
                            {step.completed && <Check className="h-3 w-3" strokeWidth={3} />}
                          </span>
                          {step.text}
                        </motion.button>
                      ))}
                    </div>

                    <p className="text-[11px] text-app-gray-400">{formatDate(task.createdAt)}{allDone ? ' · 已完成' : ''}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Celebration overlay */}
      <AnimatePresence>
        {celebrating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: [0.5, 1.2, 1] }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.6 }} className="text-center">
              <span className="text-6xl">🎉</span>
              <p className="text-xl font-semibold text-app-gray-900 mt-4">任务粉碎完成！</p>
              <p className="text-sm text-app-gray-500 mt-2">你做到了，真了不起。</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
