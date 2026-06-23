import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'

interface StreakCounterProps {
  days: number
  variant?: 'header' | 'home'
}

export default function StreakCounter({ days, variant = 'header' }: StreakCounterProps) {
  if (variant === 'header') {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className="flex items-center gap-1.5 text-sm font-medium text-warm-500"
      >
        <Flame className="h-4 w-4" />
        <span>{days}</span>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col items-center py-8"
    >
      <motion.div
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
        className="mb-3"
      >
        <Flame className="h-10 w-10 text-warm-500" />
      </motion.div>
      <p className="text-2xl font-semibold text-calm-900 font-[family-name:var(--font-serif)]">
        你已经照顾自己 <span className="text-warm-500 text-3xl">{days}</span> 天
      </p>
      {days === 1 && (
        <p className="text-sm text-calm-500 mt-2">今天是第一天，欢迎回家。</p>
      )}
      {days >= 7 && days < 30 && (
        <p className="text-sm text-calm-500 mt-2">一周了，你比想象中的更有力量。</p>
      )}
      {days >= 30 && (
        <p className="text-sm text-calm-500 mt-2">一个月的坚持，这真的很了不起。</p>
      )}
    </motion.div>
  )
}
