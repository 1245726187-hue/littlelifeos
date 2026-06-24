import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getDailyEncouragement } from '@/data/encouragements'

export default function DailyEncouragement() {
  const [text] = useState(() => getDailyEncouragement())
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300)
    return () => clearTimeout(t)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-[13px] text-app-gray-400 mt-2"
        >
          「{text}」
        </motion.p>
      )}
    </AnimatePresence>
  )
}
