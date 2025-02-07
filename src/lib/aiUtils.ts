export async function getAiSolution(context: string): Promise<string> {
  try {
    const response = await fetch('/api/openai/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ context }),
    });

    if (!response.ok) {
      throw new Error('Failed to get AI solution');
    }

    const data = await response.json();
    return data.solution;
  } catch (error) {
    console.error('Error getting AI solution:', error);
    throw error;
  }
} 