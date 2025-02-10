'use client';

import { useSearchParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { useEffect, useState } from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

interface AnalysisDetailsProps {
  technical: any[];
  content: any[];
  performance: any[];
}

export default function AnalysisDetailsPage() {
  const searchParams = useSearchParams();
  const [analysisData, setAnalysisData] = useState<AnalysisDetailsProps | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('performance');

  useEffect(() => {
    const storedData = localStorage.getItem('analysisData');
    if (storedData) {
      setAnalysisData(JSON.parse(storedData));
    }
  }, []);

  const categoryDescriptions = {
    performance: "Analyze and optimize your website's loading speed, responsiveness, and overall performance metrics to enhance user experience and search engine rankings.",
    technical: "Evaluate technical aspects of your website including mobile-friendliness, indexability, and server configuration to ensure optimal search engine crawling and indexing.",
    content: "Review your website's content quality, relevance, and optimization to improve visibility and engagement in search results."
  };

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl shadow-lg p-8 text-center border border-slate-700">
            <p className="text-lg text-slate-300">No analysis data available. Please run an analysis first.</p>
          </div>
        </div>
      </div>
    );
  }

  const problems = analysisData[selectedCategory as keyof AnalysisDetailsProps] || [];

  const cleanSummary = (summary: string) => {
    // Remove any markdown links from the summary
    return summary.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Category Summary Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl shadow-lg border border-slate-700/50 overflow-hidden mb-8">
          <div className="p-8">
            <h1 className="text-4xl font-bold text-white capitalize mb-4">
              {selectedCategory}
            </h1>
            <p className="text-lg text-slate-300">
              {categoryDescriptions[selectedCategory as keyof typeof categoryDescriptions]}
            </p>
          </div>
        </div>

        {/* Problem Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {problems.map((problem, index) => (
            <div key={index} className="space-y-3">
              {/* Title and Score */}
              <div className="flex items-start justify-between">
                <h3 className="text-xl font-semibold text-white">
                  {problem.title}
                </h3>
                <span className="text-2xl font-bold text-slate-300">
                  {Math.round(problem.score * 100)}
                </span>
              </div>

              {/* Card */}
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden hover:border-slate-600/50 transition-all duration-300">
                <div className="p-6">
                  <p className="text-slate-400">
                    {cleanSummary(problem.simple_summary)}
                  </p>
                </div>
              </div>

              {/* Details Button */}
              <button 
                className="w-full px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg border border-blue-500/30 flex items-center justify-between transition-colors group"
              >
                <span>DETAILS</span>
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 