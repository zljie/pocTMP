import 'server-only';

import type {
  DeepSeekChatCompletionRequest,
  DeepSeekChatCompletionResponse,
  DeepSeekErrorResponse,
} from './types';

export class DeepSeekUpstreamError extends Error {
  status: number;
  upstream?: unknown;

  constructor(message: string, status: number, upstream?: unknown) {
    super(message);
    this.name = 'DeepSeekUpstreamError';
    this.status = status;
    this.upstream = upstream;
  }
}

export type DeepSeekClientConfig = {
  apiKey?: string;
  baseUrl?: string;
  apiUrl?: string;
  timeoutMs?: number;
};

const defaultApiUrl = () => process.env.DEEPSEEK_API_URL || '';
const defaultBaseUrl = () => process.env.DEEPSEEK_API_BASE_URL || 'https://api.deepseek.com';
const defaultApiKey = () => process.env.DEEPSEEK_API_KEY || '';
const defaultModel = () => process.env.DEEPSEEK_MODEL || 'deepseek-chat';

const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, '');
const normalizeApiUrl = (url: string) => url.trim();

export const deepseekChatCompletions = async (
  input: Omit<DeepSeekChatCompletionRequest, 'model' | 'stream'> & { model?: string },
  config: DeepSeekClientConfig = {}
): Promise<DeepSeekChatCompletionResponse> => {
  const apiKey = (config.apiKey ?? defaultApiKey()).trim();
  if (!apiKey) {
    throw new Error('Missing DEEPSEEK_API_KEY');
  }

  const baseUrl = normalizeBaseUrl((config.baseUrl ?? defaultBaseUrl()).trim());
  const timeoutMs = config.timeoutMs ?? 30_000;

  const body: DeepSeekChatCompletionRequest = {
    model: input.model ?? defaultModel(),
    messages: input.messages,
    temperature: input.temperature,
    top_p: input.top_p,
    max_tokens: input.max_tokens,
    stop: input.stop,
    presence_penalty: input.presence_penalty,
    frequency_penalty: input.frequency_penalty,
    user: input.user,
    stream: false,
  };

  const configuredApiUrl = normalizeApiUrl(config.apiUrl ?? defaultApiUrl());
  const url = configuredApiUrl ? configuredApiUrl : `${baseUrl}/v1/chat/completions`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal: controller.signal,
    cache: 'no-store',
  }).finally(() => clearTimeout(timeout));

  if (!response.ok) {
    let upstream: unknown = undefined;
    try {
      upstream = (await response.json()) as DeepSeekErrorResponse;
    } catch {
      upstream = await response.text().catch(() => undefined);
    }

    const upstreamMessage =
      typeof upstream === 'object' && upstream && 'error' in upstream
        ? (upstream as DeepSeekErrorResponse).error?.message
        : undefined;

    throw new DeepSeekUpstreamError(
      upstreamMessage || `DeepSeek upstream error: HTTP ${response.status}`,
      response.status,
      upstream
    );
  }

  return (await response.json()) as DeepSeekChatCompletionResponse;
};

export const deepseekChat = async (
  input: Omit<DeepSeekChatCompletionRequest, 'model' | 'stream'> & { model?: string },
  config: DeepSeekClientConfig = {}
) => {
  const result = await deepseekChatCompletions(input, config);
  const content = result.choices?.[0]?.message?.content ?? '';
  return { content, raw: result };
};
