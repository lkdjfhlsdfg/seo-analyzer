'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { ArrowLeftIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface Problem {
  title: string;
  impact: 'high' | 'medium' | 'low';
  score: number;
  simple_summary: string;
  recommendations: string[];
  description?: string;
  category?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AiSolutionPage() {
  const params = useParams();
  const router = useRouter();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedData = localStorage.getItem('analysisData');
    if (storedData && params.category && params.title) {
      try {
        const parsedData = JSON.parse(storedData);
        const category = params.category as string;
        const problems = parsedData[category] || [];
        
        // Normalize the URL title for comparison
        const normalizedParamTitle = decodeURIComponent(params.title as string)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, ' ')
          .trim();

        console.log('Looking for problem with title:', normalizedParamTitle);
        console.log('Available problems:', problems.map((p: Problem) => p.title));
        
        // Find problem by comparing normalized titles
        const foundProblem = problems.find((p: Problem) => {
          const normalizedProblemTitle = p.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, ' ')
            .trim();
          
          console.log('Comparing:', {
            url: normalizedParamTitle,
            problem: normalizedProblemTitle,
            matches: normalizedProblemTitle === normalizedParamTitle
          });
          
          return normalizedProblemTitle === normalizedParamTitle;
        });

        if (foundProblem) {
          console.log('Found matching problem:', foundProblem);
          setProblem(foundProblem);
          
          // Generate a comprehensive initial explanation
          const initialMessage = `Let me help you understand and solve the "${foundProblem.title}" issue.

${foundProblem.simple_summary}

This is a ${foundProblem.impact} impact issue with a current score of ${Math.round(foundProblem.score * 100)}/100.

Here's a comprehensive solution approach:
${foundProblem.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

What specific aspect would you like help with?`;

          setMessages([{ role: 'assistant', content: initialMessage }]);
        } else {
          console.error('No matching problem found for:', {
            category,
            title: normalizedParamTitle,
            availableTitles: problems.map((p: Problem) => p.title)
          });
        }
      } catch (error) {
        console.error('Error loading problem data:', error);
      }
    }
  }, [params]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !problem) return;

    const userMessage = newMessage.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setNewMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/openai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are an expert SEO consultant helping with the following issue:
Title: ${problem.title}
Description: ${problem.simple_summary}
Category: ${params.category}
Impact: ${problem.impact}
Score: ${problem.score}

Provide specific, actionable advice based on the user's questions.`
            },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage }
          ]
        })
      });

      if (!response.ok) throw new Error('Failed to get AI response');
      
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!problem) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="container mx-auto px-4 py-8 mt-16">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <div className="flex gap-2 justify-center">
                <div className="w-3 h-3 rounded-full bg-black/20 animate-bounce" />
                <div className="w-3 h-3 rounded-full bg-black/20 animate-bounce [animation-delay:0.2s]" />
                <div className="w-3 h-3 rounded-full bg-black/20 animate-bounce [animation-delay:0.4s]" />
              </div>
              <p className="text-black/50 font-light">Loading problem details...</p>
              <button
                onClick={() => router.back()}
                className="mt-4 text-sm text-black/70 hover:text-black transition-colors"
              >
                Go back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getImpactColor = (impact: 'high' | 'medium' | 'low') => {
    switch (impact) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="container mx-auto px-4 py-8 mt-16 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-black/70 hover:text-black mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-light text-black">{problem.title}</h1>
            <div className={`text-lg font-light ${getImpactColor(problem.impact)}`}>
              Score: {Math.round(problem.score * 100)}
            </div>
          </div>
        </div>

        {/* Problem Details */}
        <div className="mb-8 space-y-6">
          <div className="border border-black/10 rounded-lg p-6">
            <h2 className="text-xl font-medium text-black mb-4">Issue Description</h2>
            <p className="text-black/70">{problem.simple_summary}</p>
          </div>

          <div className="border border-black/10 rounded-lg p-6">
            <h2 className="text-xl font-medium text-black mb-4">Recommendations</h2>
            <ul className="space-y-2">
              {problem.recommendations.map((rec, index) => (
                <li key={index} className="text-black/70">• {rec}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="border border-black/10 rounded-lg">
          <div className="h-[400px] overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-black text-white'
                      : 'bg-black/5 text-black'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-black/5 rounded-lg p-4">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-black/50 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-black/50 animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-black/50 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-black/10 p-4">
            <div className="flex gap-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask for help implementing the recommendations..."
                className="flex-1 rounded-lg border border-black/10 px-4 py-2 focus:outline-none focus:border-black/20"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !newMessage.trim()}
                className="px-4 py-2 rounded-lg border border-black/10 hover:bg-black/5 transition-colors disabled:opacity-50"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 