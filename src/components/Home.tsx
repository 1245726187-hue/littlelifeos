import { motion } from 'framer-motion'
import { useStreak } from '@/hooks/useStreak'
import StreakCounter from '@/components/StreakCounter'
import DailyEncouragement from '@/components/DailyEncouragement'
import FeatureCard from '@/components/FeatureCard'
import { FEATURES } from '@/constants'

export default function Home() {
  const { currentStreak } = useStreak()

  return (
    <div className="space-y-8">
      {/* Hero area */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="pt-4"
      >
        <h1 className="text-center text-2xl font-semibold text-calm-900 font-[family-name:var(--font-serif)] tracking-tight">
          今天也辛苦了
        </h1>
        <StreakCounter days={currentStreak} variant="home" />
        <DailyEncouragement />
      </motion.div>

      {/* Feature grid */}
      <div>
        <p className="text-xs font-medium text-calm-400 uppercase tracking-wider mb-4 px-1">
          今天想做点什么？
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.path} feature={feature} index={i} />
          ))}
        </div>
      </div>

      {/* Footer note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="text-center text-xs text-calm-400 py-8"
      >
        你的所有数据都保存在浏览器本地，不会上传。
      </motion.p>
    </div>
  )
}
