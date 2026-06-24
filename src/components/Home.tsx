import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useStreak } from '@/hooks/useStreak'
import DailyEncouragement from '@/components/DailyEncouragement'
import { getTodayStr } from '@/utils/date'
import { Utensils, Zap, Moon, Link, ChevronRight, Flame } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()
  const { currentStreak } = useStreak()

  // Quick stats
  const todayStr = getTodayStr()
  const todoCount = (() => {
    try {
      const raw = localStorage.getItem('llos-todos')
      if (!raw) return 0
      const todos = JSON.parse(raw)
      return todos.filter((t: { createdAt: string; completed: boolean }) => t.createdAt === todayStr && !t.completed).length
    } catch { return 0 }
  })()
  const achievementCount = (() => {
    try {
      const raw = localStorage.getItem('llos-achievements')
      if (!raw) return 0
      const entries = JSON.parse(raw)
      const today = entries.find((e: { date: string }) => e.date === todayStr)
      return today ? today.items.length : 0
    } catch { return 0 }
  })()

  const quickActions = [
    { icon: Utensils, label: '吃什么', path: '/food', color: 'bg-app-orange-light text-app-orange' },
    { icon: Zap, label: '粉碎任务', path: '/crusher', color: 'bg-app-teal-light text-app-teal' },
    { icon: Link, label: '收藏链接', path: '/links', color: 'bg-app-blue-light text-app-blue' },
    { icon: Moon, label: '今日记录', path: '/achievements', color: 'bg-app-purple-light text-app-purple' },
  ]

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-2"
      >
        <h1 className="apple-title text-app-gray-900">今日</h1>
        <p className="text-[15px] text-app-gray-500 mt-1">今天也辛苦了</p>
        <DailyEncouragement />
      </motion.div>

      {/* Streak ring */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-4 bg-app-card rounded-xl p-5"
      >
        <div className="relative h-16 w-16 shrink-0 flex items-center justify-center">
          <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
            <circle
              cx="32" cy="32" r="28"
              fill="none"
              stroke="#e5e5ea"
              strokeWidth="5"
            />
            <motion.circle
              cx="32" cy="32" r="28"
              fill="none"
              stroke="#ff9500"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${(Math.min(currentStreak, 30) / 30) * 176} 176`}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: Math.min(currentStreak, 30) / 30 }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Flame className="h-5 w-5 text-app-orange" />
            <span className="text-sm font-bold text-app-gray-900 -mt-0.5">
              {currentStreak}
            </span>
          </div>
        </div>
        <div>
          <p className="text-lg font-semibold text-app-gray-900">
            连续 {currentStreak} 天
          </p>
          <p className="text-[13px] text-app-gray-500">
            {currentStreak < 3 ? '好的开始，继续保持' :
             currentStreak < 7 ? '渐入佳境' :
             currentStreak < 30 ? '已经是一个习惯' : '这真的很了不起'}
          </p>
        </div>
      </motion.div>

      {/* Today stats */}
      <div className="grid grid-cols-2 gap-3">
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          onClick={() => navigate('/tasks')}
          className="bg-app-card rounded-xl p-4 text-left hover:bg-app-gray-50 transition-colors"
        >
          <p className="text-[11px] text-app-gray-400 font-medium uppercase tracking-wider">
            待办
          </p>
          <p className="text-3xl font-bold text-app-blue mt-1 tracking-tight">
            {todoCount}
            <span className="text-base font-medium text-app-gray-400 ml-0.5">项</span>
          </p>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigate('/achievements')}
          className="bg-app-card rounded-xl p-4 text-left hover:bg-app-gray-50 transition-colors"
        >
          <p className="text-[11px] text-app-gray-400 font-medium uppercase tracking-wider">
            今日已完成
          </p>
          <p className="text-3xl font-bold text-app-green mt-1 tracking-tight">
            {achievementCount}
            <span className="text-base font-medium text-app-gray-400 ml-0.5">件</span>
          </p>
        </motion.button>
      </div>

      {/* Quick actions */}
      <div>
        <p className="apple-section-header text-app-gray-500 uppercase tracking-wider mb-2 ml-1">
          快捷操作
        </p>
        <div className="bg-app-card rounded-xl overflow-hidden">
          {quickActions.map((action, i) => (
            <motion.button
              key={action.path}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              onClick={() => navigate(action.path)}
              className={`w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-app-gray-50 transition-colors ${
                i < quickActions.length - 1 ? 'border-b border-app-gray-100' : ''
              }`}
            >
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${action.color}`}>
                <action.icon className="h-4 w-4" />
              </div>
              <span className="flex-1 text-[15px] font-medium text-app-gray-900">
                {action.label}
              </span>
              <ChevronRight className="h-4 w-4 text-app-gray-300" />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
