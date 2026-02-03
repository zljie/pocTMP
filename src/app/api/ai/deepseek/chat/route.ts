import { NextResponse } from 'next/server';

import { DeepSeekUpstreamError, deepseekChatCompletions } from '@/lib/deepseek/server';
import type { DeepSeekChatCompletionRequest, DeepSeekChatMessage } from '@/lib/deepseek/types';

type ChatRequestBody = Omit<DeepSeekChatCompletionRequest, 'model' | 'stream'> & { model?: string };

const isValidMessage = (v: unknown): v is DeepSeekChatMessage => {
  if (!v || typeof v !== 'object') return false;
  const obj = v as Record<string, unknown>;
  return (
    (obj.role === 'system' || obj.role === 'user' || obj.role === 'assistant' || obj.role === 'tool') &&
    typeof obj.content === 'string'
  );
};

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: { message: 'Invalid JSON body' } }, { status: 400 });
  }

  const input = body as Partial<ChatRequestBody>;
  const messages = Array.isArray(input.messages) ? input.messages : [];
  if (!messages.length || !messages.every(isValidMessage)) {
    return NextResponse.json({ error: { message: 'Invalid messages' } }, { status: 400 });
  }

  try {
    const result = await deepseekChatCompletions({
      model: input.model,
      messages,
      temperature: input.temperature,
      top_p: input.top_p,
      max_tokens: input.max_tokens,
      stop: input.stop,
      presence_penalty: input.presence_penalty,
      frequency_penalty: input.frequency_penalty,
      user: input.user,
    });

    const content = result.choices?.[0]?.message?.content ?? '';
    return NextResponse.json({ content, raw: result });
  } catch (err) {
    if (err instanceof DeepSeekUpstreamError) {
      return NextResponse.json(
        { error: { message: err.message, status: err.status, upstream: err.upstream ?? null } },
        { status: err.status }
      );
    }
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message === 'Missing DEEPSEEK_API_KEY') {
      return NextResponse.json({ error: { message } }, { status: 400 });
    }
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}
