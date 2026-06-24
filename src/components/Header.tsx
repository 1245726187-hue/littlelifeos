import { useNavigate } from 'react-router-dom'
import { Settings } from 'lucide-react'
import { useStreak } from '@/hooks/useStreak'
import { APP_NAME } from '@/constants'

export default function Header() {
  const navigate = useNavigate()
  const { currentStreak } = useStreak()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-5 md:px-6">
        <button
          onClick={() => navigate('/')}
          className="text-[15px] font-semibold text-app-gray-900 tracking-tight"
        >
          {APP_NAME}
        </button>

        <div className="flex items-center gap-1">
          {currentStreak > 0 && (
            <span className="text-[13px] font-medium text-app-orange mr-1">
              {currentStreak}天
            </span>
          )}
          <button
            onClick={() => navigate('/settings')}
            className="flex h-8 w-8 items-center justify-center rounded-full text-app-gray-400 hover:bg-app-gray-100 hover:text-app-gray-600 transition-colors"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
