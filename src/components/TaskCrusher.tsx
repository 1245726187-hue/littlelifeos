import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Check, Trash2, RefreshCw, PartyPopper } from 'lucide-react'
import { toast } from 'sonner'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { chat, parseAIResponse } from '@/services/ai'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
    if (!trimmed) {
      toast.error('请输入一个任务')
      return
    }

    setLoading(true)
    try {
      const systemMsg = { role: 'system' as const, content: '你是一位温暖的任务拆解助手。请始终返回严格的 JSON 格式，不要添加 markdown 代码块。' }
      const userMsg = { role: 'user' as const, content: AI_PROMPTS.taskCrush(trimmed) }
      const raw = await chat([systemMsg, userMsg], { temperature: 0.7, max_tokens: 1000 })

      const parsed = parseAIResponse<{ steps: string[] }>(raw, {
        steps: ['开始第一步', '继续下一步', '完成任务'],
      })

      const steps: MicroStep[] = parsed.steps.map((text) => ({
        id: generateId(),
        text,
        completed: false,
      }))

      const task: CrushedTask = {
        id: generateId(),
        originalTask: trimmed,
        microSteps: steps,
        createdAt: new Date().toISOString(),
        completedAt: null,
      }

      setTasks((prev) => [task, ...prev])
      setNewTask('')
      toast.success('任务已粉碎 ✨')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '拆解失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const toggleStep = (taskId: string, stepId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t
        const steps = t.microSteps.map((s) =>
          s.id === stepId ? { ...s, completed: !s.completed } : s
        )
        const allDone = steps.every((s) => s.completed)
        return {
          ...t,
          microSteps: steps,
          completedAt: allDone ? new Date().toISOString() : null,
        }
      })
    )
  }

  const handleDelete = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    toast.success('已删除')
  }

  const completedCount = (task: CrushedTask) =>
    task.microSteps.filter((s) => s.completed).length

  const totalCount = (task: CrushedTask) => task.microSteps.length

  const handleCelebrate = (taskId: string) => {
    setCelebrating(taskId)
    setTimeout(() => setCelebrating(null), 2500)
  }

  // Check for newly completed tasks
  const newlyCompleted = (task: CrushedTask) => {
    if (task.completedAt && celebrating === task.id) return true
    if (task.completedAt && !celebrating && completedCount(task) === totalCount(task)) {
      // This just completed — trigger celebration once
      // We detect via the celebrating state being set
      return false
    }
    return false
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-xl font-semibold text-calm-900 font-[family-name:var(--font-serif)] mb-1">
          一键拖延症粉碎机
        </h2>
        <p className="text-sm text-calm-500">把大任务交给 AI，拆成小到无法拒绝的步骤</p>
      </motion.div>

      {/* Input area */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/80">
        <CardHeader>
          <CardTitle className="text-base">你拖延了什么？</CardTitle>
          <CardDescription>输入一个让你感到压力的大任务</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="例如：写季度报告、整理房间、准备考试..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            rows={3}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault()
                handleCrush()
              }
            }}
          />
          <Button
            onClick={handleCrush}
            disabled={loading}
            className="w-full h-11"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                AI 正在粉碎任务...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                粉碎这个任务
              </span>
            )}
          </Button>
          <p className="text-[10px] text-calm-400 text-center">
            Ctrl + Enter 快速粉碎
          </p>
        </CardContent>
      </Card>

      {/* Task list */}
      <AnimatePresence>
        {tasks.length === 0 && !loading ? (
          <EmptyState
            icon="💪"
            title="这里还空空的，等你放一点生活进去。"
            description="输入一个让你头疼的任务，让我们把它变小"
          />
        ) : (
          <div className="space-y-4">
            {tasks.map((task, idx) => {
              const done = completedCount(task)
              const total = totalCount(task)
              const pct = total > 0 ? Math.round((done / total) * 100) : 0
              const allDone = done === total && total > 0

              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card
                    className={`bg-white/70 backdrop-blur-sm border-white/80 overflow-hidden transition-all duration-500 ${
                      allDone ? 'border-green-200 bg-green-50/30' : ''
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            {allDone && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring' }}
                              >
                                🎉
                              </motion.span>
                            )}
                            <span className={allDone ? 'line-through text-calm-400' : ''}>
                              {task.originalTask}
                            </span>
                          </CardTitle>
                          <CardDescription className="mt-1">
                            <span className="flex items-center gap-2">
                              <Progress
                                value={done}
                                max={total}
                                className="h-1.5 flex-1 max-w-32"
                              />
                              <span className="text-xs">
                                {done}/{total} · {pct}%
                              </span>
                            </span>
                          </CardDescription>
                        </div>
                        <div className="flex gap-1">
                          {allDone && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-amber-500"
                              onClick={() => handleCelebrate(task.id)}
                            >
                              <PartyPopper className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-calm-400 hover:text-red-500"
                            onClick={() => handleDelete(task.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1.5">
                        {task.microSteps.map((step) => (
                          <motion.button
                            key={step.id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleStep(task.id, step.id)}
                            className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${
                              step.completed
                                ? 'bg-green-50 text-calm-400 line-through'
                                : 'hover:bg-calm-50 text-calm-700'
                            }`}
                          >
                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                                step.completed
                                  ? 'border-green-400 bg-green-400 text-white'
                                  : 'border-calm-300'
                              }`}
                            >
                              {step.completed && <Check className="h-3 w-3" />}
                            </span>
                            {step.text}
                          </motion.button>
                        ))}
                      </div>
                      <p className="text-[10px] text-calm-400 mt-3">
                        {formatDate(task.createdAt)} · {allDone ? '已完成 ✅' : '进行中...'}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Celebration overlay */}
      <AnimatePresence>
        {celebrating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: [0.5, 1.2, 1] }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <span className="text-6xl">🎉</span>
              <p className="text-xl font-semibold text-calm-900 mt-4 font-[family-name:var(--font-serif)]">
                任务粉碎完成！
              </p>
              <p className="text-sm text-calm-500 mt-2">你做到了，真了不起。</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
