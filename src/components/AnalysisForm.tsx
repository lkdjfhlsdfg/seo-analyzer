'use client';

import React, { useState } from 'react';
import { useAnalysis } from '@/app/hooks/useAnalysis';
import LoadingSpinner from './LoadingSpinner';
import AnalysisDisplay from './AnalysisDisplay';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

type ImpactLevel = 'high' | 'medium' | 'low';

interface TopIssue {
  title: string;
  impact: ImpactLevel;
  simple_summary: string;
  recommendation: string;
}

interface Audit {
  title: string;
  description: string;
  score: number;
  displayValue?: string;
  scoreDisplayMode: string;
  recommendations: string[];
  impact: ImpactLevel;
  warnings?: string[];
  simple_summary: string;
  current_value: string;
  suggested_value: string;
  implementation_details?: Array<{
    title: string;
    code: string;
  }>;
}

interface AiSolution {
  solution: string;
  code?: string;
  explanation?: string;
}

interface AnalysisResult {
  websiteUrl: string;
  timestamp: string;
  scores: {
    overall: number;
    technical: number;
    content: number;
    performance: number;
  };
  audits: {
    technical: Audit[];
    content: Audit[];
    performance: Audit[];
  };
  categoryDescriptions: {
    technical: string;
    content: string;
    performance: string;
  };
  summary: {
    technical: TopIssue[];
    content: TopIssue[];
    performance: TopIssue[];
  };
}

export function AnalysisForm() {
  const [url, setUrl] = useState('');
  const { analyzeUrl, isAnalyzing, error, result } = useAnalysis();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      await analyzeUrl(url);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const steps = [
    { title: 'Technical Analysis', description: 'Analyzing technical SEO aspects' },
    { title: 'Performance Check', description: 'Checking website performance' },
    { title: 'Content Audit', description: 'Evaluating content quality' },
    { title: 'Final Report', description: 'Generating recommendations' },
  ];

  if (result && !isAnalyzing) {
    return (
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-8">
          <div className="mb-6">
            <input
              type="url"
              value={url}
              onChange={handleUrlChange}
              placeholder="https://example.com"
              className="w-full rounded-xl border-2 border-slate-200 bg-white/50 px-4 py-3 text-lg"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(result.scores).map(([category, score]) => (
              <div key={category} className="bg-white rounded-xl shadow-md p-6 relative group">
                <div className="text-sm font-medium text-slate-600 capitalize mb-2">
                  {category === 'overall' ? 'Overall Score' : category}
                </div>
                <div className="text-3xl font-bold text-slate-900">
                  {score}
                </div>
                <button 
                  onClick={() => {
                    localStorage.setItem('analysisData', JSON.stringify(result.audits));
                    window.location.href = `/${category.toLowerCase()}`;
                  }}
                  className="absolute bottom-4 right-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span className="text-sm mr-1">View Issues</span>
                  <ArrowRightIcon className="w-4 h-4 inline" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="url" className="block text-xl font-medium text-slate-900 mb-2">
              Enter Website URL
            </label>
            <div className="flex gap-4">
              <input
                type="url"
                id="url"
                value={url}
                onChange={handleUrlChange}
                placeholder="https://example.com"
                className="flex-1 rounded-xl border-2 border-slate-200 bg-white/50 px-4 py-3 text-lg"
                required
              />
              <button
                type="submit"
                disabled={isAnalyzing}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
            {steps.map((step, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  isAnalyzing ? 'border-blue-200 bg-blue-50/50' : 'border-slate-200 bg-white/50'
                }`}
              >
                <div className="text-lg font-semibold text-slate-900 mb-1">
                  Step {index + 1}
                </div>
                <p className="text-sm text-slate-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </form>
      </div>

      {isAnalyzing && (
        <div className="mt-8 text-center">
          <LoadingSpinner />
          <p className="mt-4 text-slate-600">Analyzing your website...</p>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}

export { AnalysisForm as default };
