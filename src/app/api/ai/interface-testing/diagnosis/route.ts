import { NextResponse } from 'next/server';

import { DeepSeekUpstreamError, deepseekChatCompletions } from '@/lib/deepseek/server';
import type { DeepSeekChatMessage } from '@/lib/deepseek/types';
import { rateLimit } from '@/lib/ai/rateLimit';
import { extractFirstJsonObject, safeJsonParse, truncateUtf8 } from '@/lib/ai/text';
import { normalizeAiResult } from '@/lib/ai/validate';

type RequestBody = {
  title?: string;
  errorText: string;
  context?: string;
};

const getIp = (req: Request) => req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

export async function POST(req: Request) {
  const limit = rateLimit(`ai:diagnosis:${getIp(req)}`, 12, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: { message: 'Too Many Requests', resetMs: limit.resetMs } },
      { status: 429 }
    );
  }

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: { message: 'Invalid JSON body' } }, { status: 400 });
  }

  if (!body?.errorText || typeof body.errorText !== 'string') {
    return NextResponse.json({ error: { message: 'errorText is required' } }, { status: 400 });
  }

  const title = typeof body.title === 'string' ? body.title : '接口异常诊断';
  const errorText = truncateUtf8(body.errorText, 20_000);
  const context = typeof body.context === 'string' ? truncateUtf8(body.context, 10_000) : '';

  const system = [
    '你是智能测试平台的接口异常诊断助手。',
    '请严格以 JSON 输出，不要输出任何额外文本。',
    '输出 schema：{ summary: string, findings: Array<{title:string,severity:\"low\"|\"medium\"|\"high\"|\"critical\",evidence?:string[],detail?:string}>, actions: Array<{title:string,priority:\"p0\"|\"p1\"|\"p2\"|\"p3\",steps?:string[]}>, artifacts?: { bugDraft?: string, checklist?: string[] } }',
    'findings 需要给出“最可能原因→次可能原因”的排序，evidence 引用原始文本片段；actions 给出排查步骤；bugDraft 生成可直接粘贴的缺陷描述草稿。',
  ].join('\n');

  const user = [
    `标题：${title}`,
    context ? `上下文：${context}` : '',
    `异常文本：${errorText}`,
  ]
    .filter(Boolean)
    .join('\n');

  const messages: DeepSeekChatMessage[] = [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];

  try {
    const result = await deepseekChatCompletions({
      messages,
      temperature: 0.1,
      max_tokens: 1200,
    });

    const content = result.choices?.[0]?.message?.content ?? '';
    const jsonText = extractFirstJsonObject(content) ?? content;
    const parsed = safeJsonParse(jsonText);
    const normalized = normalizeAiResult(parsed, '已完成异常诊断。');
    return NextResponse.json({ result: normalized, raw: result });
  } catch (err) {
    if (err instanceof DeepSeekUpstreamError) {
      return NextResponse.json(
        { error: { message: err.message, status: err.status, upstream: err.upstream ?? null } },
        { status: err.status }
      );
    }
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}

