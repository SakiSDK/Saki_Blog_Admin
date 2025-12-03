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
  apiUrl: string; // 接口地址
  apiBaseUrl: string; // 接口基础地址
  staticBaseUrl: string;
  uploadUrl: string;  // 上传地址

  timeout: number;
  retry?: number;
}