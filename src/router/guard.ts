import { type Router } from 'vue-router';
import { ElMessage } from 'element-plus';

export function setupRouteGuard(router: Router) {
  // 全局前置守卫：权限校验
  router.beforeEach((to, from, next) => {
    
  })
}