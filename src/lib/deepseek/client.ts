import type { DeepSeekChatCompletionRequest, DeepSeekChatCompletionResponse, DeepSeekChatMessage } from './types';

export type DeepSeekChatClientInput = Omit<DeepSeekChatCompletionRequest, 'model' | 'stream'> & { model?: string };

export type DeepSeekChatClientResult = {
  content: string;
  raw: DeepSeekChatCompletionResponse;
};

export type DeepSeekChatClientOptions = {
  endpoint?: string;
  signal?: AbortSignal;
};

export const deepseekChat = async (
  input: DeepSeekChatClientInput,
  options: DeepSeekChatClientOptions = {}
): Promise<DeepSeekChatClientResult> => {
  const endpoint = options.endpoint ?? '/api/ai/deepseek/chat/';

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    signal: options.signal,
  });

  const payload = (await res.json().catch(() => null)) as
    | { content: string; raw: DeepSeekChatCompletionResponse }
    | { error: { message?: string } };

  if (!res.ok) {
    const message =
      payload && 'error' in payload && payload.error?.message
        ? payload.error.message
        : `DeepSeek request failed: HTTP ${res.status}`;
    throw new Error(message);
  }

  if (!payload || !('raw' in payload)) {
    throw new Error('Invalid DeepSeek response');
  }

  return payload;
};

export const toMessages = (content: string, system?: string): DeepSeekChatMessage[] => {
  const messages: DeepSeekChatMessage[] = [];
  if (system) messages.push({ role: 'system', content: system });
  messages.push({ role: 'user', content });
  return messages;
};
