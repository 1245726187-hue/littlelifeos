import { useNavigate, useLocation } from 'react-router-dom'
import { Settings } from 'lucide-react'
import { useStreak } from '@/hooks/useStreak'
import StreakCounter from '@/components/StreakCounter'
import { APP_NAME } from '@/constants'

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentStreak } = useStreak()

  const isHome = location.pathname === '/'

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-subtle border-b border-white/50">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 md:px-6">
        <button
          onClick={() => navigate('/')}
          className="text-base font-semibold text-calm-900 font-[family-name:var(--font-serif)] tracking-tight"
        >
          {APP_NAME}
        </button>

        <div className="flex items-center gap-3">
          {!isHome && currentStreak > 0 && (
            <StreakCounter days={currentStreak} variant="header" />
          )}
          <button
            onClick={() => navigate('/settings')}
            className="flex h-9 w-9 items-center justify-center rounded-full text-calm-400 hover:bg-calm-100 hover:text-calm-600 transition-colors"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
