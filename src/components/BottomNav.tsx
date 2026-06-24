import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sun, CheckCircle, Grid3X3 } from 'lucide-react'

const TABS = [
  { path: '/', label: '今日', icon: Sun },
  { path: '/tasks', label: '待办', icon: CheckCircle },
  { path: '/browse', label: '更多', icon: Grid3X3 },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Safe area spacer */}
      <div className="h-2 glass-nav" />

      <div className="glass-nav border-t border-app-gray-200/60">
        <div className="flex items-center justify-around h-12 px-2 max-w-lg mx-auto">
          {TABS.map((tab) => {
            const active = isActive(tab.path)
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="relative flex flex-col items-center justify-center w-20 h-12"
              >
                {active && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-x-1 top-0.5 h-7 rounded-lg bg-app-blue-light/60"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <tab.icon
                  className={`relative z-10 h-5 w-5 transition-colors ${
                    active ? 'text-app-blue' : 'text-app-gray-400'
                  }`}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span
                  className={`relative z-10 text-[10px] font-medium mt-0.5 transition-colors ${
                    active ? 'text-app-blue' : 'text-app-gray-400'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
