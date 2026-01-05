import { type NavigationGuardNext, type RouteLocationNormalized, type Router } from 'vue-router';
import { useStateStore } from '@/stores/state.store';
import { useAuthStore } from '@/stores/auth.store';


export function setupRouteGuard(router: Router) {
  // 全局前置守卫：权限校验
  router.beforeEach((to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
    const stateStore = useStateStore();
    const authStore = useAuthStore();
    
    if (to.name !== 'login') {
      stateStore.setRouteLoading(true);
    }

    // 检查是否需要登录权限
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      // 未登录，跳转到登录页，并携带重定向地址
      stateStore.setRouteLoading(false);
      next({ name: 'Login', query: { redirect: to.fullPath } });
      return;
    }

    // 已登录但访问登录页，重定向到控制台
    if (to.name === 'Login' && authStore.isAuthenticated) {
      stateStore.setRouteLoading(false);
      next({ name: 'Dashboard' });
      return;
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

