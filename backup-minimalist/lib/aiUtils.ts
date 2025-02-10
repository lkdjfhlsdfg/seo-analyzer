export async function getAiSolution(context: string): Promise<string> {
  try {
    const response = await fetch('/api/openai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are an expert SEO consultant. Provide clear, actionable solutions to SEO issues.',
          },
          {
            role: 'user',
            content: `Please provide a solution for this SEO issue: ${context}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get AI solution');
    }

    const data = await response.json();
    return data.solution || 'No solution available';
  } catch (error) {
    console.error('Error getting AI solution:', error);
    return 'Failed to generate solution. Please try again later.';
  }
} 