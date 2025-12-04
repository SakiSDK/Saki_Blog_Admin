import { type NavigationGuardNext, type RouteLocationNormalized, type Router } from 'vue-router';
import { useStateStore } from '@/stores/state.store';


export function setupRouteGuard(router: Router) {
  // 全局前置守卫：权限校验
  router.beforeEach((to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
    const stateStore = useStateStore();
    if (to.name !== 'login') {
      stateStore.setRouteLoading(true);
    }
    next();
  })
  // 跳转后：隐藏加载页
  router.afterEach(() => {
    const stateStore = useStateStore();
    // 延迟300ms，避免加载页闪一下（快速跳转时）
    setTimeout(() => {
      stateStore.setRouteLoading(false);
    }, 1500);
  })
}

