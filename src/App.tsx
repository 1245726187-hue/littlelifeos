import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAppContext } from '@/context/AppContext'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import { useStreak } from '@/hooks/useStreak'

export default function App() {
  const { onboardingComplete } = useAppContext()
  const location = useLocation()
  const navigate = useNavigate()
  const { recordVisit } = useStreak()

  useEffect(() => {
    if (!onboardingComplete) {
      navigate('/welcome', { replace: true })
    }
  }, [onboardingComplete, navigate])

  useEffect(() => {
    if (onboardingComplete) {
      recordVisit()
    }
  }, [onboardingComplete, recordVisit])

  return (
    <div className="bg-page min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl px-4 pb-24 pt-20 md:px-6 md:pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
  )
}
