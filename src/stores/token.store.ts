import { defineStore } from "pinia";
import { computed, ref } from "vue";


// 1.2 Token 管理（替换 useToken，基于 localStorage 实现）
const TOKEN_KEY = 'accessToken';
const EXPIRES_KEY = 'tokenExpires'; // Token 过期时间（时间戳）
const USER_INFO_KEY = 'userInfo';

export const useTokenStore = defineStore('token', () => {
  // State
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY));
  const expiredAt = ref<string | null>(localStorage.getItem(EXPIRES_KEY));
  const userInfo = ref<any>(null);
  const storedUserInfo = localStorage.getItem(USER_INFO_KEY);
  if (storedUserInfo) {
    try {
      userInfo.value = JSON.parse(storedUserInfo);
    } catch (e) {
      console.error('Failed to parse user info from local storage', e);
    }
  }

  // 刷新状态管理
  const isRefreshing = ref<boolean>(false);
  const refreshSubscribers = ref<Array<((token: string | null)=>void)>>([])

  /** ---------- computed State ---------- */
  const isExpired = computed<boolean>(() => {
    if (!expiredAt.value) return true;
    return Date.now() > Number(expiredAt.value);
  });

  const isValid = computed<boolean>(() => {
    return !!token.value && !isExpired.value;
  });

  const isLoggedIn = computed<boolean>(() => {
    return !!token.value && !isExpired.value;
  });

  const getRemainingTime = computed<number>(() => {
    if (!expiredAt.value) return 0;
    return Math.max(0, Number(expiredAt.value) - Date.now());
  });


  // Actions
  const getToken = () => {
    return token.value;
  };
  const setToken = (newToken: string, expiresIn?: number): void => {
    token.value = newToken;
    localStorage.setItem(TOKEN_KEY, newToken);

    // 设置过期时间
    if (expiresIn) {
      const expiresAt = Date.now() + expiresIn * 1000;
      expiredAt.value = expiresAt.toString();
      localStorage.setItem(EXPIRES_KEY, expiresAt.toString());
    }
  };

  const setUserInfo = (info: any): void => {
    userInfo.value = info;
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(info));
  };

  const getUserInfo = (): any => {
    return userInfo.value;
  };

  const clearToken = (): void => {
    token.value = null;
    expiredAt.value = null;
    userInfo.value = null;
    isRefreshing.value = false;
    refreshSubscribers.value = []

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRES_KEY);
    localStorage.removeItem(USER_INFO_KEY);

    // 由于 refreshToken 在 HttpOnly Cookie 中，需要调用 API 来清除
    clearHttpOnlyRefreshToken();
  };

  /**
   * 添加刷新订阅者
   */
  const addRefreshSubscriber = (callback: (token: string | null) => void): void => {
    refreshSubscribers.value.push(callback);
  };

  /**
   * 通知所有订阅者刷新完成
   */
  const notifyRefreshSubscribers = (newToken: string | null): void => {
    refreshSubscribers.value.forEach(callback => callback(newToken));
    refreshSubscribers.value = [];
  };

  /**
   * 刷新 token（使用 HttpOnly Cookie 中的 refreshToken）
   * 防止并发刷新请求
   */
  const refreshToken = async (): Promise<string | null> => {
    // 如果已经在刷新，返回一个 Promise 等待刷新完成
    if (isRefreshing.value) {
      return new Promise((resolve) => {
        addRefreshSubscriber((newToken) => {
          resolve(newToken);
        });
      });
    }

    if (!token.value) {
      return null;
    }

    isRefreshing.value = true;

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.value}`,
          'Content-Type': 'application/json',
        },
        // 不需要手动传递 refreshToken，它会在 HttpOnly Cookie 中自动发送
      });

      if (response.ok) {
        const data = await response.json();
        
        // 更新 access token
        setToken(data.accessToken, data.expiresIn);
        
        // 更新用户信息（如果有）
        if (data.user) {
          setUserInfo(data.user);
        }
        
        // 通知所有等待的订阅者
        notifyRefreshSubscribers(data.accessToken);
        
        return data.accessToken;
      } else {
        // 刷新失败，清除所有 token
        clearToken();
        notifyRefreshSubscribers(null);
        return null;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearToken();
      notifyRefreshSubscribers(null);
      return null;
    } finally {
      isRefreshing.value = false;
    }
  };


  /**
   * 自动刷新 token（在 token 即将过期时）
   */
  const autoRefreshToken = async (): Promise<string | null> => {
    // 如果 token 还有超过 5 分钟的有效期，不需要刷新
    if (getRemainingTime.value > 5 * 60 * 1000) {
      return token.value;
    }

    return await refreshToken();
  };

  /**
   * 清除 HttpOnly Cookie 中的 refreshToken
   * 需要调用后端 API
   */
  const clearHttpOnlyRefreshToken = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // 如果需要，可以传递当前的 access token
        ...(token.value && {
          headers: {
            'Authorization': `Bearer ${token.value}`,
            'Content-Type': 'application/json',
          }
        })
      });
    } catch (error) {
      console.error('Failed to clear httpOnly refresh token:', error);
      // 即使清除失败，也继续执行，因为客户端 token 已经被清除
    }
  };

  /**
   * 初始化 token 状态
   * 在应用启动时调用
   */
  const initialize = (): void => {
    // 检查 token 是否存在且有效
    if (token.value && isExpired.value) {
      // Token 已过期，尝试刷新
      refreshToken().catch(error => {
        console.error('Failed to refresh token on initialization:', error);
        clearToken();
      });
    }
  };

  /**
   * 设置 token 并处理自动刷新
   */
  const setTokenWithAutoRefresh = (newToken: string, expiresIn: number): void => {
    setToken(newToken, expiresIn);
    
    // 设置自动刷新
    const refreshTime = Math.max(expiresIn * 1000 - 5 * 60 * 1000, 0); // 提前5分钟刷新
    if (refreshTime > 0) {
      setTimeout(() => {
        refreshToken().catch(error => {
          console.error('Auto refresh failed:', error);
        });
      }, refreshTime);
    }
  };
  return {
    // State
    token,
    expiredAt,
    userInfo,
    isRefreshing,
    
    // Getters
    isExpired,
    isValid,
    isLoggedIn,
    getRemainingTime,
    
    // Actions
    getToken,
    setToken,
    setTokenWithAutoRefresh,
    setUserInfo,
    getUserInfo,
    clearToken,
    refreshToken,
    autoRefreshToken,
    initialize,
  };
})

// 在应用启动时调用初始化
export const initializeTokenStore = () => {
  const store = useTokenStore();
  store.initialize();
  return store;
};