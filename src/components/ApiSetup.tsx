import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Shield, ArrowRight } from 'lucide-react'
import { useAppContext } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { APP_NAME, APP_DESCRIPTION } from '@/constants'

export default function ApiSetup() {
  const { setApiKey, hasApiKey, onboardingComplete } = useAppContext()
  const navigate = useNavigate()
  const [key, setKey] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // If already set up, redirect to home
  if (hasApiKey && onboardingComplete) {
    navigate('/', { replace: true })
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = key.trim()
    if (!trimmed) {
      setError('请输入 API Key')
      return
    }
    if (!trimmed.startsWith('sk-')) {
      setError('API Key 格式不正确，应以 sk- 开头')
      return
    }

    setSaving(true)
    setError('')

    // Small delay for animation feel
    await new Promise((r) => setTimeout(r, 600))
    setApiKey(trimmed)
    setSaving(false)

    navigate('/', { replace: true })
  }

  return (
    <div className="bg-page min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Logo & Title */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
            className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-warm-50 mb-6"
          >
            <Sparkles className="h-8 w-8 text-warm-500" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-2xl font-semibold text-calm-900 font-[family-name:var(--font-serif)] mb-3"
          >
            欢迎来到你的 {APP_NAME}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-calm-500 leading-relaxed"
          >
            {APP_DESCRIPTION}
          </motion.p>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="bg-white/70 backdrop-blur-sm border border-white/80 rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-calm-700 mb-2">
                DeepSeek API Key
              </label>
              <Input
                type="password"
                placeholder="sk-..."
                value={key}
                onChange={(e) => {
                  setKey(e.target.value)
                  setError('')
                }}
                className="font-mono text-sm"
                autoFocus
              />
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-500 mt-2"
                >
                  {error}
                </motion.p>
              )}
              <p className="text-xs text-calm-400 mt-2 flex items-center gap-1.5">
                <Shield className="h-3 w-3" />
                你的 Key 只会保存在你的浏览器本地，不会上传。
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-sm font-medium"
              disabled={saving}
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  正在验证...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  开始使用
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-xs text-calm-400 mt-8"
        >
          还没有 API Key？前往{' '}
          <a
            href="https://platform.deepseek.com/api_keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-warm-500 underline underline-offset-2 hover:text-warm-600"
          >
            DeepSeek 开放平台
          </a>{' '}
          获取
        </motion.p>
      </motion.div>
    </div>
  )
}
