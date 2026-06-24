import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Check, Trash2 } from 'lucide-react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import EmptyState from '@/components/EmptyState'
import { generateId, getTodayStr, formatRelativeDate } from '@/utils/date'

interface TodoItem {
  id: string
  text: string
  completed: boolean
  createdAt: string
}

export default function TodoList() {
  const [todos, setTodos] = useLocalStorage<TodoItem[]>('llos-todos', [])
  const [newTodo, setNewTodo] = useState('')

  const todayStr = getTodayStr()
  const todayTodos = todos.filter((t) => t.createdAt === todayStr)
  const activeTodos = todayTodos.filter((t) => !t.completed)
  const completedTodos = todayTodos.filter((t) => t.completed)
  const olderTodos = todos.filter((t) => t.createdAt !== todayStr && !t.completed)

  const handleAdd = () => {
    const text = newTodo.trim()
    if (!text) return
    setTodos((prev) => [{ id: generateId(), text, completed: false, createdAt: todayStr }, ...prev])
    setNewTodo('')
  }

  const handleToggle = (id: string) => {
    setTodos((prev) => prev.map((t) => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  const handleDelete = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
        <h1 className="apple-title text-app-gray-900">待办</h1>
        <p className="text-[15px] text-app-gray-500 mt-1">
          {activeTodos.length > 0 ? `${activeTodos.length} 件事等你` : '今天还没有待办'}
        </p>
      </motion.div>

      {/* Input */}
      <form onSubmit={(e) => { e.preventDefault(); handleAdd() }} className="flex gap-2">
        <Input value={newTodo} onChange={(e) => setNewTodo(e.target.value)}
          placeholder="添加待办..."
          className="h-11 text-[15px] bg-app-card border-app-gray-200 rounded-xl shadow-none focus-visible:ring-app-blue" />
        <Button type="submit" size="icon" className="h-11 w-11 shrink-0 rounded-xl bg-app-blue hover:bg-app-blue/90">
          <Plus className="h-5 w-5" />
        </Button>
      </form>

      <AnimatePresence mode="popLayout">
        {activeTodos.length === 0 && completedTodos.length === 0 && olderTodos.length === 0 ? (
          <EmptyState icon="☀️" title="今天还没有待办" description="写下今天想做的事，从第一件小事开始" />
        ) : (
          <div className="space-y-6">
            {/* Active */}
            {activeTodos.length > 0 && (
              <section>
                {activeTodos.map((todo, i) => (
                  <motion.div key={todo.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12, height: 0 }} transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3 px-4 py-3.5 bg-app-card rounded-xl mb-1.5 group">
                    <button onClick={() => handleToggle(todo.id)}
                      className="h-5 w-5 rounded-full border-2 border-app-gray-300 hover:border-app-blue flex items-center justify-center shrink-0 transition-colors" />
                    <span className="flex-1 text-[15px] text-app-gray-900">{todo.text}</span>
                    <button onClick={() => handleDelete(todo.id)}
                      className="opacity-0 group-hover:opacity-100 text-app-gray-400 hover:text-app-red transition-all">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </section>
            )}

            {/* Completed */}
            {completedTodos.length > 0 && (
              <section>
                <p className="apple-section-header text-app-gray-400 mb-2 ml-1">已完成 · {completedTodos.length}</p>
                {completedTodos.map((todo) => (
                  <motion.div key={todo.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex items-center gap-3 px-4 py-3 bg-transparent mb-0.5">
                    <button onClick={() => handleToggle(todo.id)}
                      className="h-5 w-5 rounded-full bg-app-green border-2 border-app-green flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-white" strokeWidth={3} />
                    </button>
                    <span className="flex-1 text-[15px] text-app-gray-400 line-through">{todo.text}</span>
                  </motion.div>
                ))}
              </section>
            )}

            {/* Older */}
            {olderTodos.length > 0 && (
              <section>
                <p className="apple-section-header text-app-gray-400 mb-2 ml-1">之前 · {olderTodos.length}</p>
                {olderTodos.map((todo) => (
                  <div key={todo.id} className="flex items-center gap-3 px-4 py-3 bg-app-card rounded-xl mb-1.5 group">
                    <button onClick={() => handleToggle(todo.id)}
                      className="h-5 w-5 rounded-full border-2 border-app-gray-300 hover:border-app-blue flex items-center justify-center shrink-0 transition-colors" />
                    <div className="flex-1 min-w-0">
                      <span className="text-[15px] text-app-gray-900 block truncate">{todo.text}</span>
                      <span className="text-[11px] text-app-gray-400">{formatRelativeDate(todo.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </section>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
