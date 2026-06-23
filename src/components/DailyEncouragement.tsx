import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getDailyEncouragement } from '@/data/encouragements'

export default function DailyEncouragement() {
  const [text] = useState(() => getDailyEncouragement())
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 400)
    return () => clearTimeout(t)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center text-sm text-calm-500 font-[family-name:var(--font-serif)] italic mt-2"
        >
          「{text}」
        </motion.p>
      )}
    </AnimatePresence>
  )
}
