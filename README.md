# Little Life OS 🌱

一个温柔、有温度、帮助你照顾自己的个人生活空间。

**不是效率工具，而是一个完全属于你自己的数字角落。**

---

## ✨ 功能

- 🍳 **这周吃什么** — 告诉 AI 你冰箱里的食材，帮你搭配今天的菜
- 🔗 **链接收纳 + 随机漫步** — 收藏想看的链接，随机遇见旧时光
- 💪 **一键拖延症粉碎机** — 把大任务交给 AI，拆成小到无法拒绝的步骤
- 🌙 **反向待办清单** — 不记录未来要做什么，只记录今天已经完成的事

## 🔒 隐私

- **没有账号系统**，没有登录
- **没有数据库**，没有后端
- 所有数据保存在你浏览器的 **LocalStorage** 中
- API Key 只在你的浏览器本地，只用于调用 DeepSeek API

## 🛠️ 技术栈

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- shadcn/ui
- Framer Motion
- Lucide Icons
- DeepSeek API (deepseek-chat)

## 🚀 本地运行

```bash
# 克隆项目
git clone <your-repo-url>
cd littlelifeos

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

浏览器打开 http://localhost:5173

## 📦 构建

```bash
npm run build
```

构建产物在 `dist/` 目录。

## 🌐 部署

### GitHub Pages

1. Push 到 GitHub 仓库的 `main` 分支
2. 在仓库 Settings → Pages 中启用 GitHub Actions
3. 部署后通过 `https://<username>.github.io/littlelifeos/` 访问

> 注意：GitHub Pages 部署时需要在 Action 环境变量中设置 `VITE_ROUTER_MODE=hash`

### Vercel

1. 导入 GitHub 仓库到 Vercel
2. Vercel 会自动检测 Vite 项目
3. 无需额外配置，直接部署

## 📋 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `VITE_ROUTER_MODE` | 路由模式，GitHub Pages 设为 `hash` | 空（BrowserRouter） |

## 🎨 设计理念

- **Premium · Minimal · Calm · Cozy · Human**
- 大面积留白，柔和渐变背景
- 圆角卡片，玻璃效果
- 温暖的中性色调
- 移动优先，响应式布局

---

> 「这里记录你的生活，不评价你的生活。」

Made with ❤️
