import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  className?: string
}

export default function EmptyState({ icon = '🌱', title, description, className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'flex flex-col items-center justify-center py-16 text-center',
        className
      )}
    >
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="text-lg font-medium text-calm-700 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-calm-500 max-w-xs leading-relaxed">
          {description}
        </p>
      )}
    </motion.div>
  )
}
