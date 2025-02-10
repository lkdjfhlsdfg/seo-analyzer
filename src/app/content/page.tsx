'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import CategoryNav from '@/components/CategoryNav';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

interface Problem {
  title: string;
  impact: 'high' | 'medium' | 'low';
  score: number;
  simple_summary: string;
  recommendations: string[];
}

export default function ContentPage() {
  const [problems, setProblems] = useState<Problem[]>([]);

  useEffect(() => {
    const storedData = localStorage.getItem('analysisData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        if (parsedData.content) {
          // Sort by impact and score
          const sortedProblems = [...parsedData.content].sort((a, b) => {
            const impactOrder = { high: 3, medium: 2, low: 1 };
            const impactDiff = impactOrder[b.impact] - impactOrder[a.impact];
            if (impactDiff !== 0) return impactDiff;
            return (a.score || 0) - (b.score || 0);
          });
          setProblems(sortedProblems);
        }
      } catch (error) {
        console.error('Error parsing analysis data:', error);
      }
    }
  }, []);

  const cleanSummary = (text: string) => {
    // Remove markdown links
    return text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove any URLs
      .replace(/https?:\/\/[^\s]+/g, '')
      // Remove any remaining parentheses
      .replace(/[()]/g, '')
      // Clean up any double spaces
      .replace(/\s+/g, ' ')
      .trim();
  };

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

          <div className="container mx-auto px-4">
            {/* Category Summary */}
            <div className="mb-12">
              <div className="border border-black/10 rounded-lg p-8">
                <h1 className="text-4xl font-light text-black mb-4">Content Analysis</h1>
                <p className="text-black/70">
                  Analysis of your website's content quality, relevance, and optimization for search engines.
                  Showing {problems.length} issues ordered by impact and priority.
                </p>
              </div>
            </div>

            {/* Problem Cards Grid */}
            <div className="pb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {problems.map((problem, index) => (
                  <div key={index} className="space-y-4">
                    {/* Title and Score */}
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-lg font-medium text-black/90 max-w-[70%] truncate">
                        <span className="block truncate" title={problem.title}>
                          {problem.title}
                        </span>
                      </h3>
                      <span className="text-3xl font-light text-black flex-shrink-0">
                        {Math.round(problem.score * 100)}
                      </span>
                    </div>

                    {/* Card */}
                    <div className="border border-black/10 rounded-lg p-6 h-[30vh] hover:border-black/20 transition-colors">
                      <p className="text-black/70 font-light">
                        {cleanSummary(problem.simple_summary)}
                      </p>
                    </div>

                    {/* Details Button */}
                    <div className="flex items-center justify-between text-sm text-black/70 hover:text-black transition-colors group cursor-pointer">
                      <span className="font-light tracking-wide">DETAILS</span>
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