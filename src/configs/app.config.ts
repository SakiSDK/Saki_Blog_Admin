import type { AppConfig } from '@/types/configs/config.type';


export default {
  name: import.meta.env.VITE_APP_NAME || '',
  desciption: import.meta.env.VITE_APP_DESCRIPTION || '',
  version: import.meta.env.VITE_APP_VERSION || '',
  author: import.meta.env.VITE_APP_AUTHOR || '',
  authorEmail: import.meta.env.VITE_APP_AUTHOR_EMAIL || '',
  authorUrl: import.meta.env.VITE_APP_AUTHOR_URL || '',
} as AppConfig;