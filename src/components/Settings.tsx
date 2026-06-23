import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Trash2, Eye, EyeOff, ArrowLeft, AlertTriangle, HardDrive } from 'lucide-react'
import { toast } from 'sonner'
import { useAppContext } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import ExportImport from '@/components/ExportImport'
import { clearAllData, getStorageSize, getStorageMaxSize } from '@/utils/storage'
import { APP_NAME } from '@/constants'

export default function Settings() {
  const { apiKey, setApiKey, clearApiKey } = useAppContext()
  const navigate = useNavigate()
  const [newKey, setNewKey] = useState(apiKey)
  const [showKey, setShowKey] = useState(false)
  const [saving, setSaving] = useState(false)

  const storageSize = getStorageSize()
  const storageMax = getStorageMaxSize()
  const storagePct = Math.round((storageSize / storageMax) * 100)

  const handleSaveKey = () => {
    const trimmed = newKey.trim()
    if (!trimmed) {
      toast.error('API Key 不能为空')
      return
    }
    if (!trimmed.startsWith('sk-')) {
      toast.error('API Key 格式不正确，应以 sk- 开头')
      return
    }
    setSaving(true)
    setApiKey(trimmed)
    setTimeout(() => {
      setSaving(false)
      toast.success('API Key 已更新')
    }, 400)
  }

  const handleDeleteKey = () => {
    clearApiKey()
    setNewKey('')
    toast.success('API Key 已删除')
    setTimeout(() => navigate('/welcome', { replace: true }), 500)
  }

  const handleClearAllData = () => {
    if (window.confirm('确定要清空所有数据吗？此操作不可恢复。')) {
      clearAllData()
      toast.success('所有数据已清空')
      setTimeout(() => window.location.reload(), 500)
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-semibold text-calm-900 font-[family-name:var(--font-serif)]">
          设置
        </h2>
      </motion.div>

      {/* API Key */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/80">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-warm-500" />
            DeepSeek API Key
          </CardTitle>
          <CardDescription>
            你的 Key 保存在浏览器本地，只会用于调用 DeepSeek API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={showKey ? 'text' : 'password'}
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="sk-..."
                className="pr-10 font-mono text-sm"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-calm-400 hover:text-calm-600"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Button onClick={handleSaveKey} disabled={saving} size="sm">
              {saving ? '保存中...' : '保存'}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteKey}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              删除 API Key
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data management */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/80">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-calm-500" />
            数据管理
          </CardTitle>
          <CardDescription>
            已使用 {storageSize} KB / {storageMax} KB ({storagePct}%)
          </CardDescription>
          {storagePct > 80 && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 text-amber-700 text-xs mt-2">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <p>存储空间使用较多，建议导出数据后清理不需要的内容。</p>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-5">
          <ExportImport />

          <Separator />

          <div>
            <p className="text-sm font-medium text-calm-700 mb-1">危险操作</p>
            <p className="text-xs text-calm-500 mb-3">
              清空 {APP_NAME} 的所有数据，包括 API Key、食谱、链接、任务和成就记录。
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAllData}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              清空所有数据
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/80">
        <CardContent className="p-6 text-center">
          <p className="text-sm font-medium text-calm-700 font-[family-name:var(--font-serif)]">
            {APP_NAME}
          </p>
          <p className="text-xs text-calm-400 mt-1">
            一个温柔、有温度、帮助你照顾自己的数字空间。
          </p>
          <p className="text-xs text-calm-400 mt-1">
            所有数据保存在浏览器本地 · 没有账号 · 没有服务器
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
