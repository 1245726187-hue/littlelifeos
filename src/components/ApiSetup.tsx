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

  if (hasApiKey && onboardingComplete) {
    navigate('/', { replace: true })
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = key.trim()
    if (!trimmed) { setError('请输入 API Key'); return }
    if (!trimmed.startsWith('sk-')) { setError('API Key 格式不正确，应以 sk- 开头'); return }
    setSaving(true); setError('')
    await new Promise((r) => setTimeout(r, 600))
    setApiKey(trimmed)
    setSaving(false)
    navigate('/', { replace: true })
  }

  return (
    <div className="bg-app-bg min-h-screen flex items-center justify-center p-5">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
            className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-app-blue-light mb-5">
            <Sparkles className="h-7 w-7 text-app-blue" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-[22px] font-bold text-app-gray-900 tracking-tight mb-2">
            欢迎来到 {APP_NAME}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="text-[14px] text-app-gray-500 leading-relaxed">{APP_DESCRIPTION}</motion.p>
        </div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="bg-app-card rounded-xl p-5 shadow-none">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-app-gray-700 mb-1.5">DeepSeek API Key</label>
              <Input type="password" placeholder="sk-..." value={key} onChange={(e) => { setKey(e.target.value); setError('') }}
                className="font-mono text-[13px] bg-app-gray-50 border-app-gray-200 rounded-lg shadow-none" autoFocus />
              {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[12px] text-app-red mt-1.5">{error}</motion.p>}
              <p className="text-[11px] text-app-gray-400 mt-2 flex items-center gap-1"><Shield className="h-3 w-3" />Key 只保存在浏览器本地，不会上传。</p>
            </div>
            <Button type="submit" className="w-full h-11 rounded-lg bg-app-gray-900 hover:bg-app-gray-800 text-white text-[15px]" disabled={saving}>
              {saving ? <span className="flex items-center gap-2"><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />验证中...</span> :
                <span className="flex items-center gap-2">开始使用 <ArrowRight className="h-4 w-4" /></span>}
            </Button>
          </form>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="text-center text-[11px] text-app-gray-400 mt-6">
          还没有 API Key？前往{' '}
          <a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noopener noreferrer" className="text-app-blue underline underline-offset-2">DeepSeek 开放平台</a> 获取
        </motion.p>
      </motion.div>
    </div>
  )
}
