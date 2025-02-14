import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages, problem } = await req.json();

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `You are an expert SEO and web development assistant. You are helping with the following issue:
Title: ${problem.title}
Category: ${problem.category}
Impact: ${problem.impact}
Score: ${problem.score}

When providing solutions:
1. Structure your responses clearly with headings using markdown (e.g., ## Solution Overview)
2. When explaining technical concepts, always include practical examples
3. Format all code examples in proper markdown code blocks with language tags, e.g.:
\`\`\`html
<div class="example">
  <!-- Code here -->
</div>
\`\`\`
4. Break down complex solutions into clear steps
5. Use bullet points for lists
6. Bold important concepts using **text**
7. Keep paragraphs focused and concise
8. Include specific "Why it matters" sections for important concepts

Example format:
## Understanding the Issue
[Clear explanation of the problem]

## Technical Details
[Detailed technical explanation with examples]

## Code Example
\`\`\`language
// Code with comments
\`\`\`

## Best Practices
• Practice 1
• Practice 2

## Why It Matters
[Explanation of impact]

Provide detailed, technical, and actionable advice based on the user's questions.`
      },
      ...messages,
    ],
  });

  return Response.json({ content: response.choices[0].message.content });
} 