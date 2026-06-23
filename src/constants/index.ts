import {
  Utensils,
  Link,
  Zap,
  Moon,
  type LucideIcon,
} from 'lucide-react'

// ============================
// Feature Card Definitions
// ============================
export interface FeatureDef {
  title: string
  description: string
  icon: LucideIcon
  path: string
  color: string
  bgColor: string
}

export const FEATURES: FeatureDef[] = [
  {
    title: '这周吃什么',
    description: '告诉 AI 你冰箱里的食材，帮你搭配今天的菜',
    icon: Utensils,
    path: '/food',
    color: 'text-warm-500',
    bgColor: 'bg-warm-50',
  },
  {
    title: '链接收纳 + 随机漫步',
    description: '收藏想看的链接，让系统随机带你遇见旧时光',
    icon: Link,
    path: '/links',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  {
    title: '一键拖延症粉碎机',
    description: '把大任务交给 AI，拆成小到无法拒绝的步骤',
    icon: Zap,
    path: '/tasks',
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
  },
  {
    title: '反向待办清单',
    description: '不记录未来要做什么，只记录今天已完成的温柔',
    icon: Moon,
    path: '/achievements',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50',
  },
]

// ============================
// Food Moods
// ============================
export const FOOD_MOODS = [
  { value: 'lazy', label: '🥱 摆烂', desc: '越简单越好' },
  { value: 'ritual', label: '❇️ 仪式感', desc: '认真做一顿' },
  { value: 'energy', label: '🔥 元气', desc: '高蛋白高能量' },
  { value: 'random', label: '😌 随便', desc: '交给命运' },
] as const

// ============================
// Default AI Prompts
// ============================
export const AI_PROMPTS = {
  foodPlan: (ingredients: string, mood: string) => `你是一位温暖的家庭厨师助手。用户冰箱里有这些食材：${ingredients}。用户今天的状态是：${mood}。

请根据食材和用户状态，推荐一道菜。返回严格的 JSON 格式（不要 markdown 代码块）：

{
  "name": "菜名",
  "description": "一句话温暖描述这道菜",
  "ingredients": ["需要的食材1", "食材2"],
  "steps": ["步骤1", "步骤2", "步骤3"],
  "time": "预计时间（如：15分钟）",
  "mood": "这道菜的心情（如：治愈系 / 元气满满）"
}`,

  taskCrush: (task: string) => `用户有一个大任务感到拖延。请把这个任务拆解成极小的步骤。

规则：
- 每一步必须小到用户几乎无法拒绝去做
- 第一步必须简单到只需要 30 秒就能完成
- 最多拆成 8 步
- 用温暖鼓励的语气

任务：${task}

返回严格的 JSON 格式（不要 markdown 代码块）：
{
  "steps": ["打开文档", "写标题", "写第一句话", "保存文件"]
}`,

  achievementSummary: (items: string[]) => `用户今天完成了以下事情：${items.join('、')}。

请用温暖、鼓励的语气，生成一份今日小结。返回严格的 JSON 格式（不要 markdown 代码块）：

{
  "title": "今日小结标题",
  "summary": "一段温暖的话，肯定用户今天的付出",
  "achievements": ["成就点1", "成就点2", "成就点3"]
}`,
} as const

// ============================
// UI
// ============================
export const APP_NAME = 'Little Life OS'
export const APP_DESCRIPTION = '这里记录你的生活，不评价你的生活。'
