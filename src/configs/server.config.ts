import type { ServerConfig } from '@/types/configs/config.type';


export default {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1/admin',
  staticBaseUrl: import.meta.env.VITE_STATIC_BASE_URL || 'http://localhost:3000/static',
  uploadUrl: import.meta.env.VITE_UPLOAD_URL || 'http://localhost:3000/api/v1/admin/upload',
  timeout: Number(import.meta.env.VITE_TIMEOUT || 10000),
  retry: Number(import.meta.env.VITE_RETRY_COUNT || 3),
} as ServerConfig;