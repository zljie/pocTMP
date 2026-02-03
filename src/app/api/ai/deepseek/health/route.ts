import { NextResponse } from 'next/server';

export async function GET() {
  const missing: string[] = [];
  if (!process.env.DEEPSEEK_API_KEY) missing.push('DEEPSEEK_API_KEY');

  return NextResponse.json(
    {
      ok: missing.length === 0,
      missing,
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      baseUrl: process.env.DEEPSEEK_API_BASE_URL || 'https://api.deepseek.com',
      apiUrlConfigured: !!process.env.DEEPSEEK_API_URL,
    },
    { status: missing.length === 0 ? 200 : 503 }
  );
}

