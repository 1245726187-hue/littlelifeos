import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, Plus, Trash2, ExternalLink, Shuffle, Tag, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import EmptyState from '@/components/EmptyState'
import { generateId, formatDate, formatRelativeDate, daysBetween, getTodayStr } from '@/utils/date'
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
    const trimmedTitle = title.trim()
    let trimmedUrl = url.trim()

    if (!trimmedTitle || !trimmedUrl) {
      toast.error('请填写标题和链接')
      return
    }

    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      trimmedUrl = `https://${trimmedUrl}`
    }

    const tagList = tags
      .split(/[,，\s]+/)
      .map((t) => t.trim())
      .filter(Boolean)

    const link: SavedLink = {
      id: generateId(),
      title: trimmedTitle,
      url: trimmedUrl,
      tags: tagList,
      createdAt: getTodayStr(),
    }

    setLinks((prev) => [link, ...prev])
    setTitle('')
    setUrl('')
    setTags('')
    toast.success('链接已收藏 ✨')
  }

  const handleRandomWalk = async () => {
    if (links.length === 0) {
      toast.error('还没有收藏链接')
      return
    }

    setShuffling(true)
    setShowRandom(true)

    // Shuffle animation: cycle through links quickly
    const duration = 1200
    const interval = 80
    const steps = Math.floor(duration / interval)
    const shuffled = [...links]

    for (let i = 0; i < steps; i++) {
      await new Promise((r) => setTimeout(r, interval))
      const ri = Math.floor(Math.random() * shuffled.length)
      setRandomLink(shuffled[ri])
    }

    // Final pick
    const final = links[Math.floor(Math.random() * links.length)]
    setRandomLink(final)
    setShuffling(false)
  }

  const handleDelete = (id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id))
    toast.success('已删除')
  }

  const handleOpenLink = (linkUrl: string) => {
    window.open(linkUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-xl font-semibold text-calm-900 font-[family-name:var(--font-serif)] mb-1">
          链接收纳 + 随机漫步
        </h2>
        <p className="text-sm text-calm-500">收藏想看的链接，随机遇见旧时光</p>
      </motion.div>

      {/* Add form */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/80">
        <CardHeader>
          <CardTitle className="text-base">收藏新链接</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-3">
            <Input
              placeholder="标题"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input
              placeholder="链接地址"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Input
              placeholder="标签（用逗号分隔）"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
            <Button type="submit" className="w-full h-10" size="sm">
              <Plus className="h-4 w-4 mr-1.5" /> 收藏
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Random walk button */}
      {links.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Button
            variant="outline"
            onClick={handleRandomWalk}
            disabled={shuffling}
            className="w-full h-12 text-sm border-dashed"
          >
            <Shuffle className={`h-4 w-4 mr-2 ${shuffling ? 'animate-spin' : ''}`} />
            {shuffling ? '洗牌中...' : '随机漫步 —— 遇见一个旧收藏'}
          </Button>
        </motion.div>
      )}

      {/* Random result */}
      <AnimatePresence>
        {showRandom && randomLink && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <Card className="bg-gradient-to-br from-warm-50/80 to-white/70 backdrop-blur-sm border-warm-200/50 overflow-hidden">
              <CardContent className="p-6 text-center">
                <p className="text-xs font-medium text-warm-500 mb-3 uppercase tracking-wider">
                  今天偶遇了它
                </p>
                <h3 className="text-lg font-semibold text-calm-900 mb-2 font-[family-name:var(--font-serif)]">
                  {randomLink.title}
                </h3>
                <p className="text-sm text-calm-500 mb-4 truncate">
                  {randomLink.url}
                </p>
                <p className="text-sm text-calm-600 mb-4">
                  你 {daysBetween(randomLink.createdAt, getTodayStr())} 天前收藏了它
                </p>
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleOpenLink(randomLink.url)}
                  >
                    <ExternalLink className="h-4 w-4 mr-1.5" /> 去看看
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRandom(false)}
                  >
                    关闭
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Link list */}
      <AnimatePresence>
        {links.length === 0 ? (
          <EmptyState
            icon="🔗"
            title="这里还空空的，等你放一点生活进去。"
            description="收藏你喜欢的链接，随时回来漫步"
          />
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-medium text-calm-400 uppercase tracking-wider">
              已收藏 {links.length} 个链接
            </p>
            {links.map((link, idx) => (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <Card className="bg-white/60 backdrop-blur-sm border-white/80 hover:shadow-[var(--shadow-glass)] transition-shadow group">
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-calm-900 truncate">
                        {link.title}
                      </h4>
                      <p className="text-xs text-calm-400 truncate mt-0.5">
                        {link.url}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-calm-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatRelativeDate(link.createdAt)}
                        </span>
                        {link.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {link.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                                <Tag className="h-2.5 w-2.5 mr-0.5" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleOpenLink(link.url)}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-calm-400 hover:text-red-500"
                        onClick={() => handleDelete(link.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
