import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Check, Trash2, Zap, RefreshCw, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { chat, parseAIResponse } from '@/services/ai'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import EmptyState from '@/components/EmptyState'
import { AI_PROMPTS } from '@/constants'
import { generateId, getTodayStr, formatRelativeDate } from '@/utils/date'
import { STORAGE_KEYS } from '@/types'

interface TodoItem {
  id: string
  text: string
  completed: boolean
  createdAt: string
}

interface CrushedTaskLocal {
  id: string
  originalTask: string
  steps: { id: string; text: string; completed: boolean }[]
  createdAt: string
  completedAt: string | null
  progress: number
}

export default function TodoList() {
  const [todos, setTodos] = useLocalStorage<TodoItem[]>('llos-todos', [])
  const [crushedTasks, setCrushedTasks] = useLocalStorage<CrushedTaskLocal[]>(
    STORAGE_KEYS.taskHistory,
    []
  )
  const [newTodo, setNewTodo] = useState('')

  // Task crusher state
  const [showCrusher, setShowCrusher] = useState(false)
  const [crushInput, setCrushInput] = useState('')
  const [crushing, setCrushing] = useState(false)

  const todayStr = getTodayStr()
  const todayTodos = todos.filter((t) => t.createdAt === todayStr)
  const activeTodos = todayTodos.filter((t) => !t.completed)
  const completedTodos = todayTodos.filter((t) => t.completed)
  const olderTodos = todos.filter((t) => t.createdAt !== todayStr && !t.completed)

  const handleAdd = () => {
    const text = newTodo.trim()
    if (!text) return
    const todo: TodoItem = {
      id: generateId(),
      text,
      completed: false,
      createdAt: todayStr,
    }
    setTodos((prev) => [todo, ...prev])
    setNewTodo('')
  }

  const handleToggle = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    )
  }

  const handleDelete = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }

  const handleCrush = async () => {
    const task = crushInput.trim()
    if (!task) {
      toast.error('请输入一个任务')
      return
    }
    setCrushing(true)
    try {
      const systemMsg = {
        role: 'system' as const,
        content: '你是一位温暖的任务拆解助手。请始终返回严格的 JSON 格式，不要添加 markdown 代码块。',
      }
      const userMsg = { role: 'user' as const, content: AI_PROMPTS.taskCrush(task) }
      const raw = await chat([systemMsg, userMsg], { temperature: 0.7, max_tokens: 1000 })
      const parsed = parseAIResponse<{ steps: string[] }>(raw, {
        steps: ['开始第一步', '继续下一步', '完成任务'],
      })

      const crushTask: CrushedTaskLocal = {
        id: generateId(),
        originalTask: task,
        steps: parsed.steps.map((text) => ({
          id: generateId(),
          text,
          completed: false,
        })),
        createdAt: new Date().toISOString(),
        completedAt: null,
        progress: 0,
      }
      setCrushedTasks((prev) => [crushTask, ...prev])
      setCrushInput('')
      setShowCrusher(false)
      toast.success('任务已粉碎 ✨')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '拆解失败')
    } finally {
      setCrushing(false)
    }
  }

  const handleCrushToggle = (taskId: string, stepId: string) => {
    setCrushedTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t
        const steps = t.steps.map((s) =>
          s.id === stepId ? { ...s, completed: !s.completed } : s
        )
        const done = steps.filter((s) => s.completed).length
        const allDone = steps.every((s) => s.completed)
        return {
          ...t,
          steps,
          progress: Math.round((done / steps.length) * 100),
          completedAt: allDone ? new Date().toISOString() : null,
        }
      })
    )
  }

  const handleCrushDelete = (id: string) => {
    setCrushedTasks((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-2"
      >
        <h1 className="apple-title text-app-gray-900">待办</h1>
        <p className="text-[15px] text-app-gray-500 mt-1">
          {activeTodos.length > 0
            ? `${activeTodos.length} 件事等你`
            : '今天还没有待办'}
        </p>
      </motion.div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleAdd()
        }}
        className="flex gap-2"
      >
        <Input
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="添加待办..."
          className="h-11 text-[15px] bg-app-card border-app-gray-200 rounded-xl shadow-none focus-visible:ring-app-blue"
        />
        <Button
          type="submit"
          size="icon"
          className="h-11 w-11 shrink-0 rounded-xl bg-app-blue hover:bg-app-blue/90"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </form>

      {/* Active todos */}
      <AnimatePresence mode="popLayout">
        {activeTodos.length === 0 && completedTodos.length === 0 && olderTodos.length === 0 ? (
          <EmptyState
            icon="☀️"
            title="今天还没有待办"
            description="写下今天想做的事，从第一件小事开始"
          />
        ) : (
          <div className="space-y-6">
            {activeTodos.length > 0 && (
              <section>
                {activeTodos.map((todo, i) => (
                  <motion.div
                    key={todo.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12, height: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3 px-4 py-3.5 bg-app-card rounded-xl mb-1.5 group"
                  >
                    <button
                      onClick={() => handleToggle(todo.id)}
                      className="h-5 w-5 rounded-full border-2 border-app-gray-300 hover:border-app-blue flex items-center justify-center shrink-0 transition-colors"
                    />
                    <span className="flex-1 text-[15px] text-app-gray-900">
                      {todo.text}
                    </span>
                    <button
                      onClick={() => handleDelete(todo.id)}
                      className="opacity-0 group-hover:opacity-100 text-app-gray-400 hover:text-app-red transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </section>
            )}

            {/* Completed */}
            {completedTodos.length > 0 && (
              <section>
                <p className="apple-section-header text-app-gray-400 mb-2 ml-1">
                  已完成 · {completedTodos.length}
                </p>
                {completedTodos.map((todo) => (
                  <motion.div
                    key={todo.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3 px-4 py-3 bg-transparent mb-0.5"
                  >
                    <button
                      onClick={() => handleToggle(todo.id)}
                      className="h-5 w-5 rounded-full bg-app-green border-2 border-app-green flex items-center justify-center shrink-0"
                    >
                      <Check className="h-3 w-3 text-white" strokeWidth={3} />
                    </button>
                    <span className="flex-1 text-[15px] text-app-gray-400 line-through">
                      {todo.text}
                    </span>
                  </motion.div>
                ))}
              </section>
            )}

            {/* Older uncompleted */}
            {olderTodos.length > 0 && (
              <section>
                <p className="apple-section-header text-app-gray-400 mb-2 ml-1">
                  之前 · {olderTodos.length}
                </p>
                {olderTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-3 px-4 py-3 bg-app-card rounded-xl mb-1.5 group"
                  >
                    <button
                      onClick={() => handleToggle(todo.id)}
                      className="h-5 w-5 rounded-full border-2 border-app-gray-300 hover:border-app-blue flex items-center justify-center shrink-0 transition-colors"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[15px] text-app-gray-900 block truncate">
                        {todo.text}
                      </span>
                      <span className="text-[11px] text-app-gray-400">
                        {formatRelativeDate(todo.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </section>
            )}
          </div>
        )}
      </AnimatePresence>

      {/* Divider */}
      <div className="h-px bg-app-gray-200" />

      {/* Task Crusher section */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="apple-section-header text-app-gray-500 uppercase tracking-wider">
            拖延症粉碎机
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCrusher(!showCrusher)}
            className="text-app-blue h-8 text-xs font-medium hover:bg-app-blue-light/50"
          >
            <Zap className="h-3.5 w-3.5 mr-1" />
            {showCrusher ? '收起' : '粉碎任务'}
          </Button>
        </div>

        <AnimatePresence>
          {showCrusher && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-app-card rounded-xl p-4 mb-4 space-y-3">
                <Textarea
                  placeholder="输入一个让你拖延的大任务..."
                  value={crushInput}
                  onChange={(e) => setCrushInput(e.target.value)}
                  rows={2}
                  className="text-[15px] border-app-gray-200 rounded-lg shadow-none resize-none"
                />
                <Button
                  onClick={handleCrush}
                  disabled={crushing}
                  className="w-full h-10 rounded-lg bg-app-gray-900 hover:bg-app-gray-800 text-white text-sm"
                >
                  {crushing ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" /> 粉碎中...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" /> AI 粉碎
                    </span>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Crushed tasks list */}
        {crushedTasks.length > 0 && (
          <div className="space-y-3">
            {crushedTasks.slice(0, 3).map((task) => {
              const allDone = task.progress === 100
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`bg-app-card rounded-xl p-4 ${
                    allDone ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {allDone && <span>🎉</span>}
                      <span
                        className={`text-sm font-medium truncate ${
                          allDone ? 'text-app-gray-400 line-through' : 'text-app-gray-900'
                        }`}
                      >
                        {task.originalTask}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-app-gray-400">{task.progress}%</span>
                      <button
                        onClick={() => handleCrushDelete(task.id)}
                        className="text-app-gray-300 hover:text-app-red"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <Progress value={task.progress} max={100} className="h-1 mb-3" />
                  <div className="space-y-1">
                    {task.steps.slice(0, 4).map((step) => (
                      <button
                        key={step.id}
                        onClick={() => handleCrushToggle(task.id, step.id)}
                        className={`flex items-center gap-2.5 w-full text-left py-1.5 text-[13px] transition-colors ${
                          step.completed
                            ? 'text-app-gray-400 line-through'
                            : 'text-app-gray-700'
                        }`}
                      >
                        <span
                          className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            step.completed
                              ? 'border-app-green bg-app-green'
                              : 'border-app-gray-300'
                          }`}
                        >
                          {step.completed && (
                            <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                          )}
                        </span>
                        {step.text}
                      </button>
                    ))}
                    {task.steps.length > 4 && (
                      <p className="text-[11px] text-app-gray-400 ml-6">
                        +{task.steps.length - 4} 步
                      </p>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
