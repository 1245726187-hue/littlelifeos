import { motion } from 'framer-motion'

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
}

export default function EmptyState({ icon = '🌱', title, description }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <span className="text-4xl mb-3">{icon}</span>
      <h3 className="text-[15px] font-medium text-app-gray-600 mb-1">{title}</h3>
      {description && (
        <p className="text-[13px] text-app-gray-400 max-w-xs leading-relaxed">{description}</p>
      )}
    </motion.div>
  )
}
