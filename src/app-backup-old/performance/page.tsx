'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import CategoryNav from '@/components/CategoryNav';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

type ImpactLevel = 'high' | 'medium' | 'low';

interface Problem {
  title: string;
  impact: ImpactLevel;
  score: number;
  simple_summary: string;
  recommendations: string[];
  tags?: string[];
  category?: string;
}

interface AnalysisData {
  content: Problem[];
  technical: Problem[];
  performance: Problem[];
}

export default function PerformancePage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedData = localStorage.getItem('analysisData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData) as AnalysisData;
        if (parsedData.performance) {
          // Sort by impact and score, and add tags
          const sortedProblems = [...parsedData.performance].sort((a, b) => {
            const impactOrder: Record<ImpactLevel, number> = { high: 3, medium: 2, low: 1 };
            const impactDiff = impactOrder[b.impact] - impactOrder[a.impact];
            if (impactDiff !== 0) return impactDiff;
            return (a.score || 0) - (b.score || 0);
          }).map(problem => ({
            ...problem,
            category: 'performance',
            originalTitle: problem.title, // Keep the original title
            // Process title to be more concise but maintain searchability
            title: problem.title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, ' ')
              .trim()
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' '),
            tags: [
              // Add 'highest-impact' tag for high impact issues with low scores
              problem.impact === 'high' && (problem.score || 0) < 0.5 ? 'highest-impact' : null,
              // Add 'easy-solve' tag for issues with high scores (closer to passing)
              (problem.score || 0) > 0.7 ? 'easy-solve' : null
            ].filter(Boolean) as string[]
          }));
          setProblems(sortedProblems);
        }
      } catch (error) {
        console.error('Error parsing analysis data:', error);
      }
    }
  }, []);

  const cleanSummary = (text: string) => {
    return text
      // Keep link text but remove the URL
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove any standalone URLs
      .replace(/https?:\/\/[^\s]+/g, '')
      // Remove "Learn how to..." and similar phrases but keep the content after the period
      .replace(/Learn\s+(?:how\s+)?to\s+([^.]+)\.\s*/g, '')
      .replace(/Learn\s+more\s+about\s+([^.]+)\.\s*/g, '')
      .replace(/Click\s+(?:here\s+)?to\s+learn\s+([^.]+)\.\s*/g, '')
      .replace(/Find\s+out\s+(?:how|more)\s+([^.]+)\.\s*/g, '')
      .replace(/Discover\s+(?:how|more)\s+([^.]+)\.\s*/g, '')
      // Remove any remaining parentheses but keep their content
      .replace(/\(([^)]+)\)/g, '$1')
      // Clean up any double spaces and trim
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Filter problems based on active filter
  const filteredProblems = activeFilter
    ? problems.filter(problem => problem.tags?.includes(activeFilter))
    : problems;

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="h-screen pt-16">
        {/* Scrollable Container */}
        <div className="h-full overflow-y-auto">
          {/* Category Navigation */}
          <div className="sticky top-0 bg-white py-4 z-10">
            <CategoryNav />
          </div>

          {/* Filter Buttons */}
          <div className="container mx-auto px-4 py-4 flex gap-4">
            <button
              onClick={() => setActiveFilter(activeFilter === 'highest-impact' ? null : 'highest-impact')}
              className={`px-4 py-2 rounded-lg border border-black text-sm transition-colors ${
                activeFilter === 'highest-impact' 
                  ? 'bg-black text-white' 
                  : 'bg-white text-black hover:bg-black/5'
              }`}
            >
              Highest Impact
            </button>
            <button
              onClick={() => setActiveFilter(activeFilter === 'easy-solve' ? null : 'easy-solve')}
              className={`px-4 py-2 rounded-lg border border-black text-sm transition-colors ${
                activeFilter === 'easy-solve' 
                  ? 'bg-black text-white' 
                  : 'bg-white text-black hover:bg-black/5'
              }`}
            >
              Easy to Solve
            </button>
          </div>

          <div className="container mx-auto px-4">
            {/* Problem Cards Grid */}
            <div className="pb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProblems.map((problem, index) => (
                  <div key={index} className="space-y-4">
                    {/* Title and Score */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <h3 className="text-lg font-medium text-black/90 truncate" title={problem.title}>
                          {problem.title}
                        </h3>
                        {/* Tags */}
                        {problem.tags && problem.tags.length > 0 && (
                          <div className="flex gap-2">
                            {problem.tags.map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className={`text-xs px-2 py-1 rounded-full border border-black/10 ${
                                  tag === 'highest-impact' 
                                    ? 'bg-red-50 text-red-700'
                                    : 'bg-green-50 text-green-700'
                                }`}
                              >
                                {tag === 'highest-impact' ? 'Highest Impact' : 'Easy to Solve'}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-3xl font-light text-black flex-shrink-0">
                        {Math.round(problem.score * 100)}
                      </span>
                    </div>

                    {/* Card */}
                    <div className="border border-black/10 rounded-lg p-6 h-[30vh] hover:bg-black/5 transition-colors">
                      <p className="text-black/70 font-light">
                        {cleanSummary(problem.simple_summary)}
                      </p>
                    </div>

                    {/* Details Button */}
                    <div 
                      onClick={() => router.push(`/ai-solution/${problem.category?.toLowerCase()}/${encodeURIComponent(problem.title)}`)}
                      className="flex items-center justify-between text-sm text-black/70 hover:text-black transition-colors group cursor-pointer"
                    >
                      <span className="font-light tracking-wide">SOLVE WITH AI</span>
                      <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 