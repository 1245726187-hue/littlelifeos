import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Upload, AlertTriangle, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { exportAllData, importAllData } from '@/utils/storage'

export default function ExportImport() {
  const [importText, setImportText] = useState('')
  const [showImport, setShowImport] = useState(false)

  const handleExport = () => {
    try {
      const data = exportAllData()
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `little-life-os-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('数据已导出 ✨')
    } catch {
      toast.error('导出失败')
    }
  }

  const handleImport = () => {
    if (!importText.trim()) {
      toast.error('请粘贴备份数据')
      return
    }

    try {
      const success = importAllData(importText)
      if (success) {
        toast.success('数据已导入，请刷新页面')
        setImportText('')
        setShowImport(false)
        setTimeout(() => window.location.reload(), 1500)
      } else {
        toast.error('数据格式不正确')
      }
    } catch {
      toast.error('导入失败，请检查数据格式')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={handleExport}
          className="flex-1 h-11"
        >
          <Download className="h-4 w-4 mr-2" />
          导出数据 JSON
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowImport(!showImport)}
          className="flex-1 h-11"
        >
          <Upload className="h-4 w-4 mr-2" />
          导入数据 JSON
        </Button>
      </div>

      {showImport && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-3"
        >
          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 text-amber-700 text-xs">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>导入将覆盖现有的所有数据。建议先导出备份。</p>
          </div>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="粘贴之前导出的 JSON 数据..."
            className="w-full h-32 rounded-[var(--radius-input)] border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          />
          <Button
            onClick={handleImport}
            className="w-full h-10"
            size="sm"
          >
            <Check className="h-4 w-4 mr-2" />
            确认导入
          </Button>
        </motion.div>
      )}
    </div>
  )
}
