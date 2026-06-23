import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { FeatureDef } from '@/constants'

interface FeatureCardProps {
  feature: FeatureDef
  index: number
}

export default function FeatureCard({ feature, index }: FeatureCardProps) {
  const navigate = useNavigate()
  const Icon = feature.icon

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(feature.path)}
      className={cn(
        'group relative flex flex-col items-start gap-4 rounded-[var(--radius-card)] p-6 text-left transition-shadow duration-300',
        'bg-white/60 backdrop-blur-sm border border-white/80',
        'shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-glass)]'
      )}
    >
      <div
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110',
          feature.bgColor
        )}
      >
        <Icon className={cn('h-6 w-6', feature.color)} />
      </div>
      <div>
        <h3 className="text-base font-semibold text-calm-900 mb-1">
          {feature.title}
        </h3>
        <p className="text-sm text-calm-500 leading-relaxed">
          {feature.description}
        </p>
      </div>
    </motion.button>
  )
}
