'use client';

import { useEffect, useState, FormEvent } from 'react';
import Navigation from '@/components/Navigation';
import { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';

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

interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  inline?: boolean;
  className?: string;
  node?: any;
}

interface PreProps extends React.HTMLAttributes<HTMLPreElement> {
  node?: any;
}

export default function AISolutionPage({ params }: { params: { category: string; title: string } }): ReactNode {
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

  const cleanText = (text: string) => {
    return text.replace(/\[.*?\]\([^)]*\)/g, '').replace(/\(https?:\/\/[^)]*\)/g, '');
  };

  const getDetailedExplanation = () => {
    return `The visual order of elements on your webpage should match their order in the Document Object Model (DOM). This is a fundamental accessibility requirement because screen readers and other assistive technologies read content in DOM order, not visual order. When these don't match, it creates a confusing and potentially disorienting experience for users relying on assistive technologies.

For example, if you use CSS to visually reposition elements (like using position: absolute or flex-order), the visual layout might look correct to sighted users, but screen reader users will encounter the content in a different, potentially illogical order. This disconnect between visual and DOM order can make your site difficult or confusing to navigate for users who rely on keyboard navigation or screen readers.

Common issues include:
• Using CSS positioning to move elements without restructuring the HTML
• Relying on flex or grid order properties to change element sequence
• Creating responsive layouts that alter visual order without considering DOM structure
• Using z-index and absolute positioning to layer content in ways that don't match the HTML flow`;
  };

  const getDetailedRecommendations = () => {
    return [
      `Structure your HTML to naturally follow the desired reading order. Instead of using CSS to drastically change element positions, organize your markup to match the intended visual hierarchy.`,
      
      `When building responsive layouts, maintain a consistent content order across all screen sizes. If you need different arrangements for mobile and desktop, consider whether your HTML structure can accommodate both layouts without relying heavily on CSS repositioning.`,
      
      `Use CSS Grid and Flexbox responsibly. While these tools can reorder content visually, prefer using them for layout purposes while keeping the source order logical. If you need to change the visual order, consider if restructuring your HTML would be a better solution.`,
      
      `Test your page's accessibility by turning off CSS and ensuring the content still makes sense in its natural DOM order. This reflects how screen readers and other assistive technologies will interpret your page.`,
      
      `Implement proper heading structure (h1-h6) and use semantic HTML elements like <main>, <nav>, <aside>, and <article> to create a naturally flowing document outline that matches your visual hierarchy.`
    ];
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
              <h2 className="text-xl font-medium text-black/90 mb-2">Problem Details</h2>
              <p className="text-black/70 whitespace-pre-wrap">{getDetailedExplanation()}</p>
            </div>

            <div>
              <h2 className="text-xl font-medium text-black/90 mb-2">Detailed Recommendations</h2>
              <ul className="list-disc pl-5 space-y-2 text-black/70">
                {getDetailedRecommendations().map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* AI Chat Interface */}
        <div className="rounded-lg border border-black/10 bg-white p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium text-black/90">Ask AI for Help</h2>
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                className="text-sm text-black/50 hover:text-black transition-colors"
              >
                Clear Chat
              </button>
            )}
          </div>
          
          {messages.length === 0 ? (
            <div className="text-black/70 mb-6">
              <p className="mb-2 text-black/90">No messages yet</p>
              <p className="text-sm text-black/70">Ask any question about this issue and I'll help you solve it.</p>
            </div>
          ) : (
            <div className="space-y-6 mb-6">
              {messages.map((message, index) => (
                <div key={index}>
                  <div className={`rounded-lg ${
                    message.role === 'assistant'
                      ? 'bg-black/5 p-4'
                      : 'bg-black/5 p-4'
                  }`}>
                    {message.role === 'assistant' ? (
                      <div className="max-w-none text-black">
                        <ReactMarkdown
                          components={{
                            p: ({children}) => <p className="text-black mb-4">{children}</p>,
                            pre: ({ node, children, ...props }: PreProps) => (
                              <div className="relative group mt-4">
                                <pre {...props} className="bg-white p-4 rounded-lg overflow-x-auto text-black">
                                  {children}
                                </pre>
                                <button
                                  onClick={() => {
                                    const code = node?.children?.[0]?.children?.[0]?.value;
                                    if (code) navigator.clipboard.writeText(code);
                                  }}
                                  className="absolute top-2 right-2 p-2 rounded bg-white shadow-sm hover:bg-black/5 opacity-0 group-hover:opacity-100 transition-all duration-200"
                                  title="Copy code"
                                >
                                  Copy
                                </button>
                              </div>
                            ),
                            code: ({ node, inline, className, children, ...props }: CodeProps) => {
                              const match = /language-(\w+)/.exec(className || '');
                              return !inline ? (
                                <code className={`${className || ''} text-black`} {...props}>
                                  {children}
                                </code>
                              ) : (
                                <code className="bg-white px-1.5 py-0.5 rounded text-black font-mono text-sm" {...props}>
                                  {children}
                                </code>
                              );
                            },
                            h1: ({children}) => <h1 className="text-black text-2xl font-semibold mb-4">{children}</h1>,
                            h2: ({children}) => <h2 className="text-black text-xl font-semibold mb-3">{children}</h2>,
                            h3: ({children}) => <h3 className="text-black text-lg font-semibold mb-2">{children}</h3>,
                            ul: ({children}) => <ul className="text-black list-disc pl-4 mb-4">{children}</ul>,
                            ol: ({children}) => <ol className="text-black list-decimal pl-4 mb-4">{children}</ol>,
                            li: ({children}) => <li className="text-black mb-1">{children}</li>
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-black">{message.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div>
                  <div className="font-medium text-black mb-2">Answer:</div>
                  <div className="p-4 rounded-lg bg-black/5">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-black/40 animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-black/40 animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 rounded-full bg-black/40 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-4">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about this issue..."
              className="flex-1 rounded-lg border border-black/10 bg-white p-4 text-black placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-black/5"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-black text-white hover:bg-black/90 transition-colors disabled:opacity-50 disabled:hover:bg-black flex items-center gap-2"
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? 'Thinking...' : 'Send'}
              {!isLoading && (
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 