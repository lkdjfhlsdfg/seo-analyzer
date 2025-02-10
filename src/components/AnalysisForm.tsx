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
      <div className="space-y-8">
        <div className="mb-6">
          <input
            type="url"
            value={url}
            onChange={handleUrlChange}
            placeholder="https://example.com"
            className="w-full h-16 rounded-lg border border-black/10 bg-white px-6 text-lg font-light hover:bg-black/5 transition-all"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(result.scores).map(([category, score]) => (
            <div key={category} className="p-6 rounded-lg border border-black/10 hover:bg-black/5 transition-all">
              <div className="text-sm font-light text-black/70 capitalize mb-2">
                {category === 'overall' ? 'Overall Score' : category}
              </div>
              <div className="text-3xl font-light text-black">
                {score}
              </div>
              <button 
                onClick={() => {
                  localStorage.setItem('analysisData', JSON.stringify(result.audits));
                  window.location.href = `/${category.toLowerCase()}`;
                }}
                className="mt-4 text-sm text-black/70 hover:text-black transition-colors flex items-center gap-2"
              >
                View Issues
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-4 p-4 rounded-lg border border-black/10 bg-red-50/50">
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="url" className="block text-xl font-light text-black mb-2">
            Enter Website URL
          </label>
          <div className="flex gap-4">
            <input
              type="url"
              id="url"
              value={url}
              onChange={handleUrlChange}
              placeholder="https://example.com"
              className="flex-1 h-16 rounded-lg border border-black/10 bg-white px-6 text-lg font-light hover:bg-black/5 transition-all"
              required
            />
            <button
              type="submit"
              disabled={isAnalyzing}
              className="h-16 px-8 rounded-lg border border-black/10 bg-white text-black hover:bg-black/5 transition-all text-lg font-light disabled:opacity-50"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
          {steps.map((step, index) => (
            <div 
              key={index}
              className={`p-6 rounded-lg border border-black/10 ${
                isAnalyzing ? 'bg-black/5' : 'bg-white hover:bg-black/5'
              } transition-all`}
            >
              <div className="text-lg font-light text-black mb-1">
                Step {index + 1}
              </div>
              <p className="text-sm text-black/70">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </form>

      {isAnalyzing && (
        <div className="mt-8 text-center">
          <LoadingSpinner />
          <p className="mt-4 text-black/70 font-light">Analyzing your website...</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 rounded-lg border border-black/10 bg-red-50/50">
          <p className="text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}

export { AnalysisForm as default };
