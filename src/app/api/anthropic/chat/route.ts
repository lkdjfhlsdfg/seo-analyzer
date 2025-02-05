import { Anthropic } from '@anthropic-ai/sdk';
import { StreamingTextResponse, Message } from 'ai';

export const runtime = "edge";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 4096,
      messages: messages,
      stream: true,
    });

    return new StreamingTextResponse(response.toReadableStream());
  } catch (error) {
    console.error('Anthropic API Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
