import { useState } from 'react'
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
      a.download = `little-life-os-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('数据已导出')
    } catch { toast.error('导出失败') }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleExport} className="flex-1 h-9 rounded-lg border-app-gray-200 text-[13px] font-normal">
          <Download className="h-3.5 w-3.5 mr-1.5" />导出 JSON
        </Button>
        <Button variant="outline" onClick={() => setShowImport(!showImport)} className="flex-1 h-9 rounded-lg border-app-gray-200 text-[13px] font-normal">
          <Upload className="h-3.5 w-3.5 mr-1.5" />导入 JSON
        </Button>
      </div>
      {showImport && (
        <div className="space-y-2">
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-app-orange-light/50 text-app-orange text-[11px]">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />导入将覆盖现有数据。建议先导出备份。
          </div>
          <textarea value={importText} onChange={(e) => setImportText(e.target.value)}
            placeholder="粘贴 JSON 数据..."
            className="w-full h-28 rounded-lg border border-app-gray-200 bg-app-gray-50 px-3 py-2 text-[12px] font-mono resize-none focus:outline-none focus:ring-2 focus:ring-app-blue/20" />
          <Button onClick={() => { if (importAllData(importText)) { toast.success('已导入，刷新页面'); setImportText(''); setShowImport(false); setTimeout(() => window.location.reload(), 1000) } else { toast.error('格式不正确') } }}
            className="w-full h-9 rounded-lg text-[13px]">
            <Check className="h-3.5 w-3.5 mr-1.5" />确认导入
          </Button>
        </div>
      )}
    </div>
  )
}
