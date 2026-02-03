export type DeepSeekRole = 'system' | 'user' | 'assistant' | 'tool';

export type DeepSeekChatMessage = {
  role: DeepSeekRole;
  content: string;
  name?: string;
};

export type DeepSeekChatCompletionRequest = {
  model: string;
  messages: DeepSeekChatMessage[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stream?: false;
  stop?: string | string[];
  presence_penalty?: number;
  frequency_penalty?: number;
  user?: string;
};

export type DeepSeekChatCompletionChoice = {
  index: number;
  message: {
    role: 'assistant';
    content: string;
  };
  finish_reason: string | null;
};

export type DeepSeekChatCompletionResponse = {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: DeepSeekChatCompletionChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export type DeepSeekErrorResponse = {
  error?: {
    message?: string;
    type?: string;
    code?: string | number | null;
    param?: string | null;
  };
};
