import type { ServerConfig } from '@/types/configs/config.type';


export default {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api/v1/web', // 使用相对路径触发代理
  staticUrl: import.meta.env.VITE_STATIC_BASE_URL || 'http://localhost:3000/static',
  timeout: import.meta.env.VITE_TIMEOUT || 10000,
  retry: import.meta.env.VITE_RETRY || false,
  retryCount: import.meta.env.VITE_RETRY_COUNT || 3,
  retryDelay: import.meta.env.VITE_RETRY_Delay || 3,
} as ServerConfig; 