import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Utensils, Link, Moon, Zap, Settings, ChevronRight } from 'lucide-react'

const ITEMS = [
  {
    title: '拖延症粉碎机',
    desc: 'AI 拆解大任务为小步骤',
    icon: Zap,
    color: 'bg-app-teal-light text-app-teal',
    path: '/crusher',
  },
  {
    title: '这周吃什么',
    desc: 'AI 搭配今日菜单',
    icon: Utensils,
    color: 'bg-app-orange-light text-app-orange',
    path: '/food',
  },
  {
    title: '链接收纳',
    desc: '收藏 + 随机漫步',
    icon: Link,
    color: 'bg-app-blue-light text-app-blue',
    path: '/links',
  },
  {
    title: '反向待办清单',
    desc: '记录今天已完成',
    icon: Moon,
    color: 'bg-app-purple-light text-app-purple',
    path: '/achievements',
  },
  {
    title: '设置',
    desc: 'API Key · 数据管理',
    icon: Settings,
    color: 'bg-app-gray-100 text-app-gray-600',
    path: '/settings',
  },
]

export default function Browse() {
  const navigate = useNavigate()

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-2"
      >
        <h1 className="apple-title text-app-gray-900">更多</h1>
        <p className="text-[15px] text-app-gray-500 mt-1">全部工具</p>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <SummaryCard
          label="连续记录"
          value={(() => {
            try {
              const raw = localStorage.getItem('llos-streak')
              if (!raw) return '0'
              const d = JSON.parse(raw)
              return String(d.currentStreak || 0)
            } catch {
              return '0'
            }
          })()}
          unit="天"
          color="app-orange"
        />
        <SummaryCard
          label="链接收藏"
          value={(() => {
            try {
              const raw = localStorage.getItem('llos-saved-links')
              if (!raw) return '0'
              return String(JSON.parse(raw).length)
            } catch {
              return '0'
            }
          })()}
          unit="个"
          color="app-blue"
        />
      </div>

      {/* Tool list */}
      <div>
        <p className="apple-section-header text-app-gray-500 uppercase tracking-wider mb-2 ml-1">
          工具
        </p>
        <div className="bg-app-card rounded-xl overflow-hidden">
          {ITEMS.map((item, i) => (
            <motion.button
              key={item.path}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-app-gray-50 transition-colors ${
                i < ITEMS.length - 1 ? 'border-b border-app-gray-100' : ''
              }`}
            >
              <div
                className={`h-8 w-8 rounded-lg flex items-center justify-center ${item.color}`}
              >
                <item.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-medium text-app-gray-900">
                  {item.title}
                </p>
                <p className="text-[13px] text-app-gray-500">{item.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-app-gray-300" />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  unit,
  color,
}: {
  label: string
  value: string
  unit: string
  color: string
}) {
  return (
    <div className="bg-app-card rounded-xl p-4">
      <p className="text-[11px] text-app-gray-400 font-medium uppercase tracking-wider">
        {label}
      </p>
      <p className={`text-3xl font-bold text-${color} mt-1 tracking-tight`}>
        {value}
        <span className="text-base font-medium text-app-gray-400 ml-0.5">
          {unit}
        </span>
      </p>
    </div>
  )
}
