import { NextApiRequest } from 'next';
import { NextRequest } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPEN_API_KEY! });

async function openaiRequest(content: string) {
  const summarize = `"${content}" 앞의 내용을 논문 어투로 1000자 이하로 요약 정리해줘`;

  const completion = await openai.chat.completions.create({
    messages: [{ role: 'system', content: summarize }],
    model: 'gpt-3.5-turbo',
  });

  return completion.choices[0].message.content!;
}

export async function GET(req: NextRequest) {

  try {
    const content = req.nextUrl.searchParams.get('content')!;
    const summary = await openaiRequest(content)

    return new Response(JSON.stringify({result: summary}), {status: 200})
  } catch {
    return new Response(JSON.stringify({result: ''}), {status: 200})
  }
}