import type { AiErrorPayload, AiResult } from './types';

export type AiApiResponse<T> = { result: T; raw?: unknown } | { error: AiErrorPayload };

export const postJson = async <T>(url: string, body: unknown, signal?: AbortSignal): Promise<AiApiResponse<T>> => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });

  const payload = (await res.json().catch(() => null)) as unknown;
  if (!res.ok) {
    const message =
      payload && typeof payload === 'object' && payload && 'error' in payload
        ? ((payload as { error?: { message?: string } }).error?.message ?? `HTTP ${res.status}`)
        : `HTTP ${res.status}`;
    return { error: { message } };
  }

  if (!payload || typeof payload !== 'object' || !('result' in payload)) {
    return { error: { message: 'Invalid AI response' } };
  }
  return payload as AiApiResponse<T>;
};

export const analyzeReport = (body: { title?: string; context?: string; data?: unknown }, signal?: AbortSignal) =>
  postJson<AiResult>('/api/ai/interface-testing/report-analysis/', body, signal);

export const diagnoseError = (body: { title?: string; context?: string; errorText: string }, signal?: AbortSignal) =>
  postJson<AiResult>('/api/ai/interface-testing/diagnosis/', body, signal);
