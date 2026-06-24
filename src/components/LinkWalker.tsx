import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, ExternalLink, Shuffle, Tag, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import EmptyState from '@/components/EmptyState'
import { generateId, getTodayStr, formatRelativeDate, daysBetween } from '@/utils/date'
import { STORAGE_KEYS, type SavedLink } from '@/types'

export default function LinkWalker() {
  const [links, setLinks] = useLocalStorage<SavedLink[]>(STORAGE_KEYS.savedLinks, [])
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [tags, setTags] = useState('')
  const [showRandom, setShowRandom] = useState(false)
  const [randomLink, setRandomLink] = useState<SavedLink | null>(null)
  const [shuffling, setShuffling] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const t = title.trim(); let u = url.trim()
    if (!t || !u) { toast.error('请填写标题和链接'); return }
    if (!u.startsWith('http')) u = `https://${u}`
    const tagList = tags.split(/[,，\s]+/).map((s) => s.trim()).filter(Boolean)
    setLinks((prev) => [{ id: generateId(), title: t, url: u, tags: tagList, createdAt: getTodayStr() }, ...prev])
    setTitle(''); setUrl(''); setTags('')
    toast.success('链接已收藏')
  }

  const handleRandomWalk = async () => {
    if (links.length === 0) { toast.error('还没有收藏链接'); return }
    setShuffling(true); setShowRandom(true)
    for (let i = 0; i < 15; i++) {
      await new Promise((r) => setTimeout(r, 80))
      setRandomLink(links[Math.floor(Math.random() * links.length)])
    }
    setRandomLink(links[Math.floor(Math.random() * links.length)])
    setShuffling(false)
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
        <h1 className="apple-title text-app-gray-900">链接收纳</h1>
        <p className="text-[15px] text-app-gray-500 mt-1">收藏 + 随机漫步</p>
      </motion.div>

      <form onSubmit={handleSave} className="bg-app-card rounded-xl p-5 space-y-3">
        <Input placeholder="标题" value={title} onChange={(e) => setTitle(e.target.value)} className="h-10 text-[15px] bg-app-gray-50 border-app-gray-200 rounded-lg shadow-none" />
        <Input placeholder="链接地址" value={url} onChange={(e) => setUrl(e.target.value)} className="h-10 text-[15px] bg-app-gray-50 border-app-gray-200 rounded-lg shadow-none" />
        <Input placeholder="标签（逗号分隔）" value={tags} onChange={(e) => setTags(e.target.value)} className="h-10 text-[15px] bg-app-gray-50 border-app-gray-200 rounded-lg shadow-none" />
        <Button type="submit" className="w-full h-10 rounded-lg bg-app-gray-900 hover:bg-app-gray-800 text-white text-sm">
          <Plus className="h-4 w-4 mr-1.5" /> 收藏
        </Button>
      </form>

      {links.length > 0 && (
        <Button variant="outline" onClick={handleRandomWalk} disabled={shuffling} className="w-full h-11 rounded-xl border-app-gray-200 text-app-gray-700 text-sm font-normal">
          <Shuffle className={`h-4 w-4 mr-2 ${shuffling ? 'animate-spin' : ''}`} />
          {shuffling ? '洗牌中...' : '随机漫步'}
        </Button>
      )}

      <AnimatePresence>
        {showRandom && randomLink && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="bg-app-blue-light/30 rounded-xl p-6 text-center">
            <p className="text-[11px] font-medium text-app-blue uppercase tracking-wider mb-2">今天偶遇了它</p>
            <h3 className="text-lg font-semibold text-app-gray-900 mb-1">{randomLink.title}</h3>
            <p className="text-[13px] text-app-gray-500 mb-1 truncate">{randomLink.url}</p>
            <p className="text-[13px] text-app-gray-600 mb-4">你 {daysBetween(randomLink.createdAt, getTodayStr())} 天前收藏了它</p>
            <div className="flex gap-2 justify-center">
              <Button size="sm" onClick={() => window.open(randomLink.url, '_blank')} className="rounded-lg bg-app-blue hover:bg-app-blue/90"><ExternalLink className="h-3.5 w-3.5 mr-1.5" /> 去看看</Button>
              <Button variant="ghost" size="sm" onClick={() => setShowRandom(false)} className="rounded-lg">关闭</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {links.length === 0 ? (
        <EmptyState icon="🔗" title="收藏你喜欢的链接" description="随时回来漫步" />
      ) : (
        <div className="space-y-1.5">
          <p className="text-[11px] font-medium text-app-gray-400 uppercase tracking-wider ml-1 mb-2">{links.length} 个链接</p>
          {links.map((link, idx) => (
            <motion.div key={link.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
              className="bg-app-card rounded-xl px-4 py-3.5 flex items-start gap-3 group hover:bg-app-gray-50 transition-colors">
              <div className="flex-1 min-w-0">
                <h4 className="text-[15px] font-medium text-app-gray-900 truncate">{link.title}</h4>
                <p className="text-[12px] text-app-gray-400 truncate mt-0.5">{link.url}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[11px] text-app-gray-400 flex items-center gap-1"><Clock className="h-3 w-3" />{formatRelativeDate(link.createdAt)}</span>
                  {link.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 bg-app-gray-100 text-app-gray-500"><Tag className="h-2.5 w-2.5 mr-0.5" />{tag}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => window.open(link.url, '_blank')}><ExternalLink className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-app-gray-400 hover:text-app-red" onClick={() => { setLinks((p) => p.filter((l) => l.id !== link.id)); toast.success('已删除') }}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
