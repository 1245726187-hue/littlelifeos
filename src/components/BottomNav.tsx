import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { FEATURES } from '@/constants'
import { Home } from 'lucide-react'

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass border-t border-white/50">
      <div className="flex items-center justify-around h-16 px-2">
        <NavItem
          icon={<Home className="h-5 w-5" />}
          label="首页"
          active={location.pathname === '/'}
          onClick={() => navigate('/')}
        />
        {FEATURES.map((f) => (
          <NavItem
            key={f.path}
            icon={<f.icon className="h-5 w-5" />}
            label={f.title}
            active={location.pathname === f.path}
            onClick={() => navigate(f.path)}
          />
        ))}
      </div>
    </nav>
  )
}

function NavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors',
        active ? 'text-warm-500' : 'text-calm-400 hover:text-calm-600'
      )}
    >
      {active && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute -top-1 h-1 w-6 rounded-full bg-warm-500"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
      {icon}
      <span className="text-[10px] font-medium truncate max-w-[4rem]">{label}</span>
    </button>
  )
}
