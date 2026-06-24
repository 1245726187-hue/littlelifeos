import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Trash2, Eye, EyeOff, ArrowLeft, AlertTriangle, HardDrive } from 'lucide-react'
import { toast } from 'sonner'
import { useAppContext } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  const storagePct = Math.round((storageSize / getStorageMaxSize()) * 100)

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 pt-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="h-8 w-8 rounded-lg"><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="apple-title text-app-gray-900">设置</h1>
      </motion.div>

      {/* API Key */}
      <div className="bg-app-card rounded-xl p-5 space-y-4">
        <h3 className="text-[15px] font-semibold text-app-gray-900 flex items-center gap-2"><Shield className="h-4 w-4 text-app-blue" />DeepSeek API Key</h3>
        <p className="text-[13px] text-app-gray-500">Key 保存在浏览器本地，仅用于调用 DeepSeek API</p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input type={showKey ? 'text' : 'password'} value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="sk-..." className="pr-10 font-mono text-[13px] bg-app-gray-50 border-app-gray-200 rounded-lg shadow-none" />
            <button onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-app-gray-400">{showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
          </div>
          <Button onClick={() => { setSaving(true); setApiKey(newKey.trim()); setTimeout(() => { setSaving(false); toast.success('已保存') }, 300) }} disabled={saving} size="sm" className="rounded-lg">{saving ? '...' : '保存'}</Button>
        </div>
        <Button variant="ghost" size="sm" onClick={() => { clearApiKey(); setNewKey(''); toast.success('已删除'); setTimeout(() => navigate('/welcome', { replace: true }), 500) }} className="text-app-red text-xs"><Trash2 className="h-3.5 w-3.5 mr-1.5" />删除 API Key</Button>
      </div>

      {/* Data */}
      <div className="bg-app-card rounded-xl p-5 space-y-4">
        <h3 className="text-[15px] font-semibold text-app-gray-900 flex items-center gap-2"><HardDrive className="h-4 w-4 text-app-gray-500" />数据管理</h3>
        <p className="text-[13px] text-app-gray-500">{storageSize} KB / 5 MB · {storagePct}%</p>
        {storagePct > 80 && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-app-orange-light/50 text-app-orange text-[12px]">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />存储空间使用较多，建议导出备份。
          </div>
        )}
        <ExportImport />
        <div className="h-px bg-app-gray-100" />
        <div>
          <p className="text-[13px] font-medium text-app-gray-700 mb-1">危险操作</p>
          <p className="text-[12px] text-app-gray-400 mb-2">清空所有数据，包括 API Key、食谱、链接、待办和记录。</p>
          <Button variant="ghost" size="sm" onClick={() => { if (window.confirm('确定清空所有数据？不可恢复。')) { clearAllData(); toast.success('已清空'); setTimeout(() => window.location.reload(), 500) } }} className="text-app-red text-xs border border-app-red/20 rounded-lg"><Trash2 className="h-3.5 w-3.5 mr-1.5" />清空所有数据</Button>
        </div>
      </div>

      <div className="text-center py-6">
        <p className="text-[13px] font-medium text-app-gray-600">{APP_NAME}</p>
        <p className="text-[11px] text-app-gray-400 mt-1">一个温柔的数字空间 · 数据完全本地 · 没有账号</p>
      </div>
    </div>
  )
}
