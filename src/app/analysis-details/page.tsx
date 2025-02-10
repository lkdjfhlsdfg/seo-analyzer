'use client';

import { useSearchParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { useEffect, useState } from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

type ImpactLevel = 'high' | 'medium' | 'low';

interface Problem {
  title: string;
  impact: ImpactLevel;
  score: number;
  simple_summary: string;
  recommendations: string[];
  description: string;
  category?: string;
}

interface AnalysisDetailsProps {
  technical: Problem[];
  content: Problem[];
  performance: Problem[];
}

export default function AnalysisDetailsPage() {
  const [analysisData, setAnalysisData] = useState<AnalysisDetailsProps | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  useEffect(() => {
    const storedData = localStorage.getItem('analysisData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        // Ensure we have the expected data structure
        if (parsedData.technical || parsedData.content || parsedData.performance) {
          setAnalysisData(parsedData);
        } else {
          console.error('Invalid data structure:', parsedData);
        }
      } catch (error) {
        console.error('Error parsing analysis data:', error);
      }
    }
  }, []);

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="border border-black/10 rounded-lg p-8 text-center">
            <p className="text-black/70">No analysis data available. Please run an analysis first.</p>
          </div>
        </div>
      </div>
    );
  }

  // Get all problems across categories
  const allProblems = [
    ...(analysisData.technical || []).map(p => ({ ...p, category: 'Technical' })),
    ...(analysisData.performance || []).map(p => ({ ...p, category: 'Performance' })),
    ...(analysisData.content || []).map(p => ({ ...p, category: 'Content' }))
  ].sort((a, b) => {
    // Sort by impact (high → medium → low)
    const impactOrder = { high: 3, medium: 2, low: 1 };
    const impactDiff = (impactOrder[b.impact] || 0) - (impactOrder[a.impact] || 0);
    if (impactDiff !== 0) return impactDiff;
    
    // Then by score (lower scores first as they need more attention)
    return (a.score || 0) - (b.score || 0);
  });

  const getImpactColor = (impact: ImpactLevel) => {
    switch (impact) {
      case 'high': return 'text-black';
      case 'medium': return 'text-black/70';
      case 'low': return 'text-black/50';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-light text-black mb-4">SEO Issues</h1>
          <p className="text-black/70">
            Showing {allProblems.length} issues ordered by impact and priority
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex gap-4 mb-8">
          {['All', 'Technical', 'Performance', 'Content'].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category === 'All' ? null : category)}
              className={`px-4 py-2 text-sm transition-all ${
                (category === 'All' && !selectedCategory) || category === selectedCategory
                ? 'text-black border-b border-black'
                : 'text-black/50 hover:text-black'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Problem Cards */}
        <div className="grid grid-cols-1 gap-8">
          {allProblems
            .filter(problem => !selectedCategory || problem.category === selectedCategory)
            .map((problem, index) => {
              const isExpanded = expandedCard === `${problem.category}-${index}`;
              return (
                <div
                  key={`${problem.category}-${index}`}
                  className="border border-black/10 rounded-lg overflow-hidden hover:border-black/20 transition-all"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-1">
                        <div className="text-sm text-black/50">{problem.category}</div>
                        <h3 className="text-lg font-medium text-black">{problem.title}</h3>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-sm ${getImpactColor(problem.impact)}`}>
                          {problem.impact} impact
                        </span>
                        <span className="text-2xl font-light text-black">
                          {Math.round(problem.score * 100)}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                      <p className="text-black/70">
                        {problem.simple_summary}
                      </p>
                      
                      {/* Recommendations */}
                      {isExpanded && problem.recommendations && problem.recommendations.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-black/10">
                          <h4 className="text-sm font-medium text-black mb-2">Recommendations</h4>
                          <ul className="space-y-2">
                            {problem.recommendations.map((rec, idx) => (
                              <li key={idx} className="text-sm text-black/70">
                                • {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <button
                      onClick={() => setExpandedCard(isExpanded ? null : `${problem.category}-${index}`)}
                      className="mt-4 text-sm text-black/50 hover:text-black flex items-center gap-2 transition-colors"
                    >
                      {isExpanded ? 'Show less' : 'Show recommendations'}
                      <ArrowRightIcon 
                        className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      />
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
} 