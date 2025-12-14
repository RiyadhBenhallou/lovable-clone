export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface GeneratedResponse {
  message: string;
  html: string;
}

export enum ViewMode {
  PREVIEW = 'PREVIEW',
  CODE = 'CODE',
}
