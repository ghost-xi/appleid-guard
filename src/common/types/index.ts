export interface TaskConfig {
  id: string;
  username: string;
  password: string;
  dob: string;
  q1: string;
  a1: string;
  q2: string;
  a2: string;
  q3: string;
  a3: string;
  check_interval: number;
  webdriver: string;
  proxy_id?: number;
  proxy_protocol?: string;
  proxy_content?: string;
  tg_chat_id?: string;
  tg_bot_token?: string;
  wx_pusher_id?: string;
  webhook?: string;
  check_password_correct?: boolean;
  enable_delete_devices?: boolean;
  enable_auto_update_password?: boolean;
  task_headless?: boolean;
  fail_retry: boolean;
  enable: boolean;
}

export interface ApiResponse<T = any> {
  code: number;
  status: boolean;
  msg?: string;
  data?: T;
}

export interface SecurityAnswer {
  [key: string]: string;
}

export interface ProxyConfig {
  type: string;
  content: string;
  url?: string;
}

export type Language = 'zh_cn' | 'en_us' | 'vi_vn';

export interface AppConfig {
  apiUrl: string;
  apiKey: string;
  taskId: string;
  lang: Language;
  debug: boolean;
}
