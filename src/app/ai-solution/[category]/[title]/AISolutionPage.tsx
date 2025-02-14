'use client';

import { useEffect, useState, FormEvent } from 'react';
import Navigation from '@/components/Navigation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Problem {
  title: string;
  impact: 'high' | 'medium' | 'low';
  score: number;
  simple_summary: string;
  recommendations: string[];
  category?: string;
}

interface AnalysisData {
  content: Problem[];
  technical: Problem[];
  performance: Problem[];
}

export default function AISolutionPage({ params }: { params: { category: string; title: string } }) {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedData = localStorage.getItem('analysisData');
    console.log('Category:', params.category);
    console.log('Title:', decodeURIComponent(params.title));
    console.log('Raw stored data:', storedData);
    
    if (storedData) {
      try {
        const data = JSON.parse(storedData) as AnalysisData;
        console.log('Performance problems:', JSON.stringify(data.performance, null, 2));
        
        const categoryProblems = data[params.category as keyof AnalysisData] || [];
        console.log(`Found ${categoryProblems.length} problems in category ${params.category}`);
        
        const decodedTitle = decodeURIComponent(params.title);
        console.log('Looking for title:', decodedTitle);
        
        const normalizedSearchTitle = decodedTitle.toLowerCase().replace(/-/g, ' ');
        
        const foundProblem = categoryProblems.find(p => {
          const normalizedProblemTitle = p.title.toLowerCase().replace(/-/g, ' ');
          const matches = normalizedProblemTitle === normalizedSearchTitle;
          console.log(`Comparing normalized "${normalizedProblemTitle}" with "${normalizedSearchTitle}"`, matches);
          return matches;
        });
        
        if (foundProblem) {
          console.log('Found matching problem:', foundProblem.title);
          setProblem(foundProblem);
        } else {
          console.log('No matching problem found');
          setError('Problem not found in analysis data');
        }
      } catch (error) {
        console.error('Error parsing analysis data:', error);
        setError('Error loading problem data');
      }
    } else {
      setError('No analysis data found');
    }
  }, [params.category, params.title]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-solution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          problem,
        }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, there was an error processing your request.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-6xl pt-20">
          <div className="rounded-lg border border-black/10 bg-white p-8">
            <p className="text-black/70">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-6xl pt-20">
          <div className="rounded-lg border border-black/10 bg-white p-8">
            <p className="text-black/70">Loading problem details...</p>
          </div>
        </div>
      </div>
    );
  }

  const enhancedSummary = `The DOM (Document Object Model) structure of your webpage should match its visual presentation. This means that the order of elements in your HTML code should follow the same logical sequence as how they appear on the screen. This alignment is crucial for users who rely on assistive technologies like screen readers. When the visual order doesn't match the DOM order, screen reader users might experience a confusing navigation flow where the content they hear doesn't match the visual layout of the page. This can be particularly problematic in responsive layouts or when using CSS positioning that changes the visual order without updating the underlying HTML structure.`;

  const enhancedRecommendations = [
    `Ensure your HTML structure follows a logical reading order from top to bottom. Avoid using CSS positioning or flexbox/grid order properties to drastically change the visual presentation from the natural DOM flow.`,
    `When building responsive layouts, test with screen readers to verify that the content flow makes sense regardless of screen size.`,
    `If you need to visually reposition elements, consider restructuring your HTML to match the desired visual hierarchy rather than relying heavily on CSS positioning.`
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-6xl pt-20">
        {/* Problem Details Card */}
        <div className="rounded-lg border border-black/10 bg-white p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-light text-black">
              {problem.title}
            </h1>
            <span className="text-3xl font-light">
              {Math.round(problem.score * 100)}
            </span>
          </div>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-medium text-black/90 mb-2">Problem Summary</h2>
              <p className="text-black/70">{enhancedSummary}</p>
            </div>

            <div>
              <h2 className="text-xl font-medium text-black/90 mb-2">Recommendations</h2>
              <ul className="list-disc pl-5 space-y-2 text-black/70">
                {enhancedRecommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* AI Chat Interface */}
        <div className="rounded-lg border border-black/10 bg-white p-8">
          <h2 className="text-xl font-medium text-black/90 mb-4">Ask AI for Help</h2>
          
          <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${
                  message.role === 'assistant'
                    ? 'bg-black/5 text-black'
                    : 'bg-blue-50 text-black'
                }`}
              >
                {message.content}
              </div>
            ))}
            {isLoading && (
              <div className="p-4 rounded-lg bg-black/5 text-black animate-pulse">
                Thinking...
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-4">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about this issue..."
              className="flex-1 rounded-lg border border-black/10 p-4 text-black placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-black/5"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-black text-white hover:bg-black/90 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 