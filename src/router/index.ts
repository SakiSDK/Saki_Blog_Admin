import { createRouter, createWebHistory } from 'vue-router'
import routes from './route'
import { setupRouteGuard } from './guard'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // 优化用户体验，记录前进/回退的滚动位置
  scrollBehavior(to, _, savedPosition) {
    // 前进/后退：Vue Router 自带的 savedPosition
    if (savedPosition) {
      return savedPosition
    }

    // 你可以自行记录滚动位置（如果你需要增强行为）
    const key = to.fullPath
    const saved = sessionStorage.getItem(`scroll:${key}`)

    if (saved) {
      const pos = JSON.parse(saved)
      return {
        left: pos.left,
        top: pos.top,
        behavior: 'auto'
      }
    }

    //默认行为：没有记录时返回顶部
    return { left: 0, top: 0 }
  }
})

setupRouteGuard(router);

export default router