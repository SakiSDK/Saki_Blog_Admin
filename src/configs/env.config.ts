import type { EnvConfig } from '@/types/configs/config.type';

export default {
  env: import.meta.env.VITE_ENV,
} as EnvConfig;