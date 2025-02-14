import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { issue, context } = await req.json();

    if (!issue) {
      return NextResponse.json(
        { error: 'Issue description is required' },
        { status: 400 }
      );
    }

    const prompt = `As an expert in ${context}, please provide a detailed solution for the following issue:

${issue}

Please provide:
1. A clear, step-by-step solution
2. Any relevant code examples if applicable
3. A brief explanation of why this solution works

Format the response as JSON with the following structure:
{
  "solution": "The step-by-step solution",
  "code": "Any relevant code examples (optional)",
  "explanation": "Brief explanation of why this works"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert web developer and SEO specialist. Provide practical, actionable solutions with code examples when relevant."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    const parsedResponse = JSON.parse(response);

    return NextResponse.json(parsedResponse, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
      },
    });

  } catch (error: any) {
    console.error('OpenAI Analysis Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate solution',
        details: error.message 
      },
      { status: 500 }
    );
  }
} 