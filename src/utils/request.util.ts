import type { Axios, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'
import { trackRequest } from './apiTracker.util'
import serverConfig from '@/config/server.config'
import { useTokenStore } from '@/stores/token.store'
import { useNavigator } from './navigator.util'




/** ---------- 页面跳转 ---------- */
const { go } = useNavigator();


/** ---------- Axios 核心配置 ---------- */
// 创建 Axios 实例
const service: AxiosInstance = axios.create({
  baseURL: serverConfig.api_url,
  timeout: 10000, // 请求超时时间（10秒）
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
})


/** ---------- 请求拦截器 ---------- */
service.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const tokenStore = useTokenStore()
    const token: string | null = tokenStore.getToken();   
    if (token && config.headers) {
      // Token 未过期，直接携带
      if (!tokenStore.isExpired) {
        config.headers.Authorization = `Bearer ${token}`
        return config;
      }

      // Token 已过期，处理刷新逻辑
      try {
        const newToken = await tokenStore.refreshToken();
        if (newToken) {
          config.headers.Authorization = `Bearer ${newToken}`;
          return config;
        } else {
          // 刷新失败（无新 Token）→ 跳登录页
          tokenStore.clearToken();
          go('/login');
          // message.show({
          //   type: 'error',
          //   duration: 3000,
          //   title: '登录已过期，请重新登录',
          // });
          return Promise.reject(new Error('Token 刷新失败'));
        }
      } catch (error) {
        tokenStore.clearToken();
        go('/login');
        // message.show({
        //   type: 'error',
        //   duration: 3000,
        //   title: '登录已过期，请重新登录',
        // });
        return Promise.reject(error);
      }
    }
    // 无 Token => 直接放行
    return config;
  },
  (error) => {
    // message.show({
    //   type: 'error',
    //   duration: 3000,
    //   title: `请求配置错误: ${error.message}`,
    // });
    return Promise.reject(error);
  }
)

/** ---------- 响应拦截器 ---------- */
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data;
    if (response.status < 200 || response.status >= 300) {
      // message.show({
      //   type: 'error',
      //   duration: 3000,
      //   title: `请求错误: ${res.message}`,
      // });
    }
    // 成功返回业务数据
    return res;
  },
  async (error) => { 
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    const tokenStore = useTokenStore()
    // 处理 401 错误（Token 过期/无效，拦截器未处理到的场景）
    if (error.response?.status === 401) {
      // 避免无限重试
      if (originalRequest._retry) {
        tokenStore.clearToken();
        go('/login')
        // message.show({
        //   type: 'error',
        //   title: '登录已过期，请重新登录',
        //   duration: 5000,
        // })
      }
      originalRequest._retry = true;

      //尝试刷新 Token(复用Pinia逻辑)
      try {
        const newToken = await tokenStore.refreshToken();
        if (newToken) {
          // 刷新成功 → 重试当前请求
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return service(originalRequest);
        } else { 
          // 刷新失败 → 清 Token 跳登录
          tokenStore.clearToken();
          go('/login');
          // message.show({
          //   type: 'error',
          //   title: '登录已过期，请重新登录',
          //   duration: 5000,
          // })
          return Promise.reject(error);
        }
      } catch (error) {
        tokenStore.clearToken();
        go('/login');
        // message.show({
        //   type: 'error',
        //   title: '登录已过期，请重新登录',
        //   duration: 5000,
        // })
        return Promise.reject(error);
      }
    }

    // 处理其他错误（404/500 等）
    const errorMsg = error.response?.data?.message || error.message || '请求出错';
    // message.show({
    //   type: 'error',
    //   title: errorMsg,
    //   duration: 5000,
    // });
    return Promise.reject(error);
  }
)


/** ---------- 封装请求方法（集成接口跟踪） ---------- */
const requestWithTrack = async <T = any>(config: AxiosRequestConfig): Promise<T> => {
  const reqPromise = service(config) as Promise<T>;
  // 跟踪请求（供加载页等待，过滤无需等待的接口）
  return trackRequest(reqPromise, config);
}

// GET 请求
export const get = async <T = any>(
  url: string,
  params?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  return requestWithTrack<T>({
    url,
    method: 'get',
    params,
    ...config,
  });
};

// POST 请求
export const post = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  return requestWithTrack<T>({
    url,
    method: 'post',
    data,
    ...config,
  });
};

// PUT 请求
export const put = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  return requestWithTrack<T>({
    url,
    method: 'put',
    data,
    ...config,
  });
};

// DELETE 请求
export const del = async <T = any>(
  url: string,
  params?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  return requestWithTrack<T>({
    url,
    method: 'delete',
    params,
    ...config,
  });
};

// 导出原始实例（备用）
export default service;