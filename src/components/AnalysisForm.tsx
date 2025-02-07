'use client';

import React, { useState } from 'react';
import { useAnalysis } from '@/app/hooks/useAnalysis';
import LoadingSpinner from './LoadingSpinner';
import AnalysisDisplay from './AnalysisDisplay';

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

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-8 mb-8 animate-cell-expand">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="url" className="block text-xl font-medium text-[var(--coniferous-green)] mb-2">
              Enter Website URL
            </label>
            <div className="relative mt-1 group">
              <input
                type="url"
                id="url"
                value={url}
                onChange={handleUrlChange}
                placeholder="https://example.com"
                className="block w-full rounded-xl border-2 border-[var(--coniferous-green)] bg-white/50 shadow-sm focus:ring-[var(--cell-green)] focus:border-[var(--cell-green)] text-gray-900 text-lg px-4 py-4 transition-all duration-300"
                required
              />
              <div className="absolute inset-0 rounded-xl bg-[var(--cell-pattern)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isAnalyzing}
            className="w-full bg-[var(--coniferous-green)] text-white py-4 px-6 rounded-xl text-lg font-medium hover:bg-[var(--cell-green)] focus:outline-none focus:ring-2 focus:ring-[var(--cell-green)] focus:ring-offset-2 disabled:opacity-50 transition-all duration-300 relative overflow-hidden group"
          >
            <span className="relative z-10">
              {isAnalyzing ? 'Analyzing...' : 'Analyze Now'}
            </span>
            <div className="absolute inset-0 bg-[var(--cell-pattern)] opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50/80 backdrop-blur-sm border-l-4 border-red-400 p-6 mb-8 rounded-xl animate-cell-expand">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-base text-red-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      {isAnalyzing && (
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-8 mb-8 animate-cell-expand">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-lg text-[var(--coniferous-green)]">Analyzing your website. This may take a minute...</p>
            <div className="mt-4 text-base text-[var(--volcanic-black)]">
              We&apos;re checking:
              <ul className="mt-3 space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--cell-green)]" />
                  Performance metrics
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--acrylic-blue)]" />
                  SEO optimization
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--coniferous-green)]" />
                  Accessibility
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--cell-green)]" />
                  Best practices
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {result && !isAnalyzing && (
        <AnalysisDisplay analysisData={result} />
      )}
    </div>
  );
}

export { AnalysisForm as default };
