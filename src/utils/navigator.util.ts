import { useRouter, useRoute, type RouteLocationRaw } from "vue-router";

/**
 * Vue Router 导航工具函数
 * 提供常用的路由跳转方法，简化路由操作
 */
export const useNavigator = () => {
  const router = useRouter();
  const route = useRoute();

  /**
   * 路径跳转
   * @param to - 目标路径
   * @param query - 查询参数
   * @example
   * go('/about', { tab: 'info' })
   */
  const go = (to: string, query: Record<string, any> = {}) => {
    router.push({ path: to, query });
  };

  /**
   * 命名路由跳转
   * @param name - 路由名称
   * @param params - 路由参数
   * @example
   * goName('user-profile', { id: 123 })
   */
  const goName = (name: string, params: Record<string, any> = {}) => {
    router.push({ name, params });
  };

  /**
   * 替换当前路由（不添加历史记录）
   * @param path - 目标路径
   * @param query - 查询参数
   * @example
   * replace('/login')
   */
  const replace = (path: string, query: Record<string, any> = {}) => {
    router.replace({ path, query });
  };

  /**
   * 返回上一页
   * @example
   * back()
   */
  const back = () => router.back();

  /**
   * 前进到下一页
   * @example
   * forward()
   */
  const forward = () => router.forward();

  /**
   * 跳转到指定历史记录
   * @param delta - 历史记录步数（正数前进，负数后退）
   * @example
   * goHistory(-2) // 后退两步
   */
  const goHistory = (delta: number) => router.go(delta);

  /**
   * 合并当前查询参数并跳转
   * @param path - 目标路径
   * @param newQuery - 新的查询参数
   * @example
   * goMergeQuery('/search', { page: 2 })
   */
  const goMergeQuery = (path: string, newQuery: Record<string, any> = {}) => {
    router.push({
      path,
      query: { ...route.query, ...newQuery }
    });
  };

  /**
   * 带状态的跳转（可传递复杂数据）
   * @param to - 目标路由
   * @param state - 要传递的状态数据
   * @example
   * goWithState('/result', { formData: {...} })
   */
  const goWithState = (to: RouteLocationRaw, state: Record<string, any> = {}) => {
    const target = typeof to === 'string' ? { path: to } : to;
    router.push({
      ...target,
      state
    });
  };

  /**
   * 获取当前路由的查询参数
   * @param key - 查询参数键名（可选）
   * @returns 查询参数值或所有查询参数
   * @example
   * const page = getQuery('page') // 获取单个参数
   * const allParams = getQuery() // 获取所有参数
   */
  const getQuery = <T = any>(key?: string): T | null => {
    if (!key) return route.query as T;
    return route.query[key] as T || null;
  };

  /**
   * 获取当前路由参数
   * @param key - 路由参数键名（可选）
   * @returns 路由参数值或所有路由参数
   * @example
   * const id = getParams('id')
   */
  const getParams = <T = any>(key?: string): T | null => {
    if (!key) return route.params as T;
    return route.params[key] as T || null;
  };

  /**
   * 检查当前路由是否匹配指定路径
   * @param path - 要检查的路径
   * @returns 是否匹配
   * @example
   * const isActive = isCurrentRoute('/home')
   */
  const isCurrentRoute = (path: string): boolean => {
    return route.path === path;
  };

  /**
   * 检查当前路由是否包含指定路径
   * @param path - 要检查的路径
   * @returns 是否包含
   * @example
   * const isInSection = isRouteIncluded('/admin')
   */
  const isRouteIncluded = (path: string): boolean => {
    return route.path.startsWith(path);
  };

  /**
   * 刷新当前页面（重新加载组件）
   * @example
   * refresh()
   */
  const refresh = () => {
    router.go(0);
  };

  /**
   * 带确认对话框的跳转
   * @param to - 目标路由
   * @param message - 确认消息
   * @example
   * goWithConfirm('/delete', '确定要删除吗？')
   */
  const goWithConfirm = async (to: RouteLocationRaw, message: string = '确定要离开当前页面吗？') => {
    if (window.confirm(message)) {
      router.push(to);
    }
  };

  /**
   * 带加载状态的跳转
   * @param to - 目标路由
   * @param loadingCallback - 加载状态回调
   * @example
   * goWithLoading('/heavy-page', (isLoading) => setLoading(isLoading))
   */
  const goWithLoading = async (
    to: RouteLocationRaw, 
    loadingCallback: (isLoading: boolean) => void
  ) => {
    loadingCallback(true);
    try {
      await router.push(to);
    } finally {
      loadingCallback(false);
    }
  };

  return {
    // 基础导航
    go,
    goName,
    replace,
    back,
    forward,
    goHistory,
    
    // 高级导航
    goMergeQuery,
    goWithState,
    goWithConfirm,
    goWithLoading,
    
    // 路由信息获取
    getQuery,
    getParams,
    isCurrentRoute,
    isRouteIncluded,
    
    // 工具方法
    refresh,
    
    // 原始路由对象（用于特殊情况）
    router,
    route
  };
};

/**
 * 导航工具类型定义
 */
export type Navigator = ReturnType<typeof useNavigator>;