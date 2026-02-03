import { NextResponse } from 'next/server';

import { DeepSeekUpstreamError, deepseekChatCompletions } from '@/lib/deepseek/server';
import type { DeepSeekChatMessage } from '@/lib/deepseek/types';
import { rateLimit } from '@/lib/ai/rateLimit';
import { extractFirstJsonObject, safeJsonParse, truncateUtf8 } from '@/lib/ai/text';

type Scenario = {
  name: string;
  category: 'normal' | 'boundary' | 'exception' | 'auth' | 'idempotency' | 'other';
  requestExample?: string;
  assertions?: string[];
  notes?: string;
};

type Result = {
  summary: string;
  scenarios: Scenario[];
  importHints?: string[];
};

type RequestBody = {
  goal?: string;
  method?: string;
  path?: string;
  interfaceName?: string;
  params?: unknown;
  context?: string;
};

const isObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object';
const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === 'string');

const normalizeScenario = (v: unknown): Scenario | null => {
  if (!isObject(v)) return null;
  if (typeof v.name !== 'string' || !v.name.trim()) return null;
  const categoryRaw = v.category;
  const category: Scenario['category'] =
    categoryRaw === 'normal' ||
    categoryRaw === 'boundary' ||
    categoryRaw === 'exception' ||
    categoryRaw === 'auth' ||
    categoryRaw === 'idempotency' ||
    categoryRaw === 'other'
      ? categoryRaw
      : 'other';
  const requestExample = typeof v.requestExample === 'string' ? v.requestExample : undefined;
  const assertions = isStringArray(v.assertions) ? v.assertions : undefined;
  const notes = typeof v.notes === 'string' ? v.notes : undefined;
  return { name: v.name.trim(), category, requestExample, assertions, notes };
};

const normalizeResult = (v: unknown, fallbackSummary: string): Result => {
  if (!isObject(v)) return { summary: fallbackSummary, scenarios: [] };
  const summary = typeof v.summary === 'string' && v.summary.trim() ? v.summary.trim() : fallbackSummary;
  const scenarios = Array.isArray(v.scenarios) ? v.scenarios.map(normalizeScenario).filter((x): x is Scenario => !!x) : [];
  const importHints = isStringArray(v.importHints) ? v.importHints : undefined;
  return { summary, scenarios, importHints };
};

const getIp = (req: Request) => req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

export async function POST(req: Request) {
  const limit = rateLimit(`ai:scene-gen:${getIp(req)}`, 8, 60_000);
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

  const goal = typeof body.goal === 'string' ? truncateUtf8(body.goal, 2000) : '';
  const method = typeof body.method === 'string' ? truncateUtf8(body.method, 20) : '';
  const path = typeof body.path === 'string' ? truncateUtf8(body.path, 2000) : '';
  const interfaceName = typeof body.interfaceName === 'string' ? truncateUtf8(body.interfaceName, 200) : '';
  const context = typeof body.context === 'string' ? truncateUtf8(body.context, 8000) : '';
  const paramsJson = truncateUtf8(JSON.stringify(body.params ?? {}), 12_000);

  const system = [
    '你是智能测试平台的接口测试场景生成助手。',
    '请严格以 JSON 输出，不要输出任何额外文本。',
    '输出 schema：{ summary: string, scenarios: Array<{ name: string, category: \"normal\"|\"boundary\"|\"exception\"|\"auth\"|\"idempotency\"|\"other\", requestExample?: string, assertions?: string[], notes?: string }>, importHints?: string[] }',
    'scenarios 需要覆盖正常/边界/异常/鉴权/幂等等典型维度，assertions 给出建议验证点，requestExample 给出简洁示例（JSON 或 key=value）。',
  ].join('\n');

  const user = [
    goal ? `业务目标：${goal}` : '',
    interfaceName ? `接口名：${interfaceName}` : '',
    method ? `方法：${method}` : '',
    path ? `路径：${path}` : '',
    context ? `上下文：${context}` : '',
    `参数：${paramsJson}`,
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
      temperature: 0.3,
      max_tokens: 1400,
    });

    const content = result.choices?.[0]?.message?.content ?? '';
    const jsonText = extractFirstJsonObject(content) ?? content;
    const parsed = safeJsonParse(jsonText);
    const normalized = normalizeResult(parsed, '已生成场景建议。');
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

