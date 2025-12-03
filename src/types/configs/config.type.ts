export interface EnvConfig {
  env: string;
}
export interface AppConfig {
  name: string;
  desciption: string;
  version: string;
  author: string;
  authorEmail: string;
  authorUrl: string;
}
export interface ServerConfig {
  apiUrl: string;
  apiBaseUrl: string;
  staticUrl: string;
  timeout: number;
  retry: boolean;
  retryDelay: number;
  retryCount: number;
}