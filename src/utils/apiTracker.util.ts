import type { AxiosRequestConfig } from "axios";


// 存储当前正在请求的接口Promise
const pendingRequests = new Set<Promise<any>>();

/**
 * 跟踪接口（支持过滤）
 */
export const trackRequest = (
  request: Promise<any>,
  config?: AxiosRequestConfig
): Promise<any> => { 
  // 过滤不需要等待的接口
  const ignoreUrls = [
    '/api/v1/web/auth/login',
    '/api/v1/web/auth/refresh',
    '/api/v1/web/auth/logout',
    '/api/v1/web/auth/register',
    '/api/v1/web/auth/send-code'
  ]
  if (
    config?.url
    && typeof config.url === 'string'
    && ignoreUrls.some(
      url => config.url!.includes(url)
    )
  ) {
    return request;
  }
  pendingRequests.add(request);
  // 接口完成后移除
  const wrappedRequest = request.finally(() => {
    pendingRequests.delete(request); // 不再删 wrappedRequest，删原始 request
  });
  return wrappedRequest;
}

/** 
 * 等待所有页面接口完成（带超时）
 */ 
export const waitForAllRequests = (timeout: number = 15000): Promise<void> => {
  return new Promise<void>((resolve) => {
    let finished = false;               // 是否已结束，用于避免重复回调
    let timeoutId: number | null = null;

    /** --- 超时定时器 --- */
    timeoutId = setTimeout(() => {
      if (finished) return;
      finished = true;
      console.warn('接口加载超时，强制隐藏加载页');
      pendingRequests.clear(); 
      resolve();
    }, timeout) as unknown as number;

    /** --- 轮询 pendingRequests --- */
    const checkInterval = setInterval(() => {
      if (pendingRequests.size === 0) {
        if (finished) return; // race 已结束
        finished = true;

        console.log('所有接口已完成，隐藏加载页');
        clearInterval(checkInterval);

        // 清理超时定时器（关键步骤）
        if (timeoutId !== null) clearTimeout(timeoutId);

        resolve();
      }
    }, 100);

    // 无接口立即 resolve
    if (pendingRequests.size === 0) {
      clearInterval(checkInterval);
      if (timeoutId !== null) clearTimeout(timeoutId);
      finished = true;
      resolve();
    }
  });
};