import { createBrowserRouter, createHashRouter, RouterProvider } from 'react-router-dom'
import App from '@/App'
import Home from '@/components/Home'
import ApiSetup from '@/components/ApiSetup'
import FoodPlanner from '@/components/FoodPlanner'
import LinkWalker from '@/components/LinkWalker'
import TodoList from '@/components/TodoList'
import TaskCrusher from '@/components/TaskCrusher'
import Browse from '@/components/Browse'
import AchievementLog from '@/components/AchievementLog'
import Settings from '@/components/Settings'

const routes = [
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'food', element: <FoodPlanner /> },
      { path: 'links', element: <LinkWalker /> },
      { path: 'tasks', element: <TodoList /> },
      { path: 'crusher', element: <TaskCrusher /> },
      { path: 'browse', element: <Browse /> },
      { path: 'achievements', element: <AchievementLog /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
  {
    path: '/welcome',
    element: <ApiSetup />,
  },
]

const USE_HASH = import.meta.env.VITE_ROUTER_MODE === 'hash'
const router = USE_HASH ? createHashRouter(routes) : createBrowserRouter(routes)

export default function Router() {
  return <RouterProvider router={router} />
}
