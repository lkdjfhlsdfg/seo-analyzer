'use client';

import React, { useState } from 'react';
import { useAnalysis } from '@/app/hooks/useAnalysis';
import LoadingSpinner from './LoadingSpinner';

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

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImpactColor = (impact: ImpactLevel) => {
    switch (impact) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      default:
        return 'text-green-600';
    }
  };

  const renderAuditSection = (
    title: 'Technical SEO' | 'Content Optimization' | 'Performance',
    audits: Audit[],
    description: string
  ) => {
    const summaryKey = title === 'Technical SEO' ? 'technical' :
                      title === 'Content Optimization' ? 'content' :
                      'performance';

    if (!audits || audits.length === 0) {
      return (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-gray-600 mb-4">{description}</p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-500">No issues found in this category.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>

        {/* Quick Summary of High-Impact Issues */}
        <div className="bg-amber-50 p-4 rounded-lg mb-6">
          <h4 className="font-medium text-amber-900 mb-2">Priority Issues</h4>
          {result?.summary?.[summaryKey] && result.summary[summaryKey].length > 0 ? (
            <ul className="space-y-2">
              {result.summary[summaryKey].map((issue: TopIssue, idx: number) => (
                <li key={idx} className="text-amber-800">
                  <span className="font-medium">• {issue.title}</span>
                  <br />
                  <span className="text-sm">{issue.simple_summary}</span>
                  {issue.recommendation && (
                    <div className="mt-1 text-sm text-amber-700">
                      Solution: {issue.recommendation}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-amber-800">No high-priority issues found.</p>
          )}
        </div>

        {/* Detailed Audits */}
        <div className="space-y-6">
          {audits.map((audit, index) => (
            <div key={index} className="bg-[#F5F2EA] p-6 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-lg">{audit.title}</h4>
                    <span className={`text-sm px-2 py-0.5 rounded ${
                      audit.impact === 'high' ? 'bg-red-100 text-red-800' :
                      audit.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {audit.impact.charAt(0).toUpperCase() + audit.impact.slice(1)} Impact
                    </span>
                  </div>
                  <p className="text-gray-600 mt-2 mb-3">{audit.description}</p>

                  {/* Current vs Suggested Values */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="bg-white p-3 rounded border border-gray-100">
                      <span className="font-medium text-gray-700">Current Value:</span>
                      <p className="text-gray-600 mt-1">{audit.current_value}</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-gray-100">
                      <span className="font-medium text-gray-700">Target:</span>
                      <p className="text-gray-600 mt-1">{audit.suggested_value}</p>
                    </div>
                  </div>
                </div>
                {audit.scoreDisplayMode === 'numeric' && (
                  <div className="ml-4 flex flex-col items-end">
                    <div className={`text-lg font-medium px-3 py-1 rounded ${getScoreColor(audit.score * 100)}`}>
                      {Math.round(audit.score * 100)}/100
                    </div>
                    {audit.displayValue && (
                      <span className="text-sm text-gray-500 mt-1">{audit.displayValue}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Recommendations */}
              {audit.recommendations.length > 0 && (
                <div className="mt-4 bg-white p-4 rounded border border-gray-100">
                  <h5 className="font-medium text-gray-700 mb-2">How to Fix:</h5>
                  <ul className="list-disc pl-5 space-y-2">
                    {audit.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-gray-600">{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Implementation Details */}
              {audit.implementation_details && audit.implementation_details.length > 0 && (
                <div className="mt-4">
                  <h5 className="font-medium text-sm text-gray-700 mb-2">Technical Details:</h5>
                  {audit.implementation_details.map((detail, idx) => (
                    <div key={idx} className="mb-2">
                      <h6 className="text-sm font-medium text-gray-600">{detail.title}</h6>
                      <pre className="text-xs bg-gray-800 text-gray-200 p-3 rounded mt-1 overflow-x-auto">
                        {detail.code}
                      </pre>
                    </div>
                  ))}
                </div>
              )}

              {/* Warnings */}
              {audit.warnings && audit.warnings.length > 0 && (
                <div className="mt-4 bg-yellow-50 p-4 rounded">
                  <h5 className="font-medium text-yellow-800 mb-2">Warnings:</h5>
                  <ul className="list-disc pl-5 space-y-1">
                    {audit.warnings.map((warning, idx) => (
                      <li key={idx} className="text-yellow-700">{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="url" className="block text-lg font-medium text-gray-700 mb-2">
              Enter Website URL
            </label>
            <div className="mt-1">
              <input
                type="url"
                id="url"
                value={url}
                onChange={handleUrlChange}
                placeholder="https://example.com"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#F26B3A] focus:border-[#F26B3A] text-gray-900 text-lg px-4 py-3"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isAnalyzing}
            className="w-full bg-[#F26B3A] text-white py-3 px-6 rounded-md text-lg font-medium hover:bg-[#E25A29] focus:outline-none focus:ring-2 focus:ring-[#F26B3A] focus:ring-offset-2 disabled:opacity-50 transition-colors"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Now'}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      {isAnalyzing && (
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600">Analyzing your website. This may take a minute...</p>
            <div className="mt-2 text-sm text-gray-500">
              We&apos;re checking:
              <ul className="mt-2 space-y-1">
                <li>• Performance metrics</li>
                <li>• SEO optimization</li>
                <li>• Accessibility</li>
                <li>• Best practices</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {result && !isAnalyzing && (
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Score Overview */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Analysis Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#F5F2EA] p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Overall</h4>
                <div className={`text-3xl font-bold ${getScoreColor(result.scores.overall)}`}>
                  {result.scores.overall}/100
                </div>
              </div>
              <div className="bg-[#F5F2EA] p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Technical SEO</h4>
                <div className={`text-3xl font-bold ${getScoreColor(result.scores.technical)}`}>
                  {result.scores.technical}/100
                </div>
              </div>
              <div className="bg-[#F5F2EA] p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Content</h4>
                <div className={`text-3xl font-bold ${getScoreColor(result.scores.content)}`}>
                  {result.scores.content}/100
                </div>
              </div>
              <div className="bg-[#F5F2EA] p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Performance</h4>
                <div className={`text-3xl font-bold ${getScoreColor(result.scores.performance)}`}>
                  {result.scores.performance}/100
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Analysis */}
          <div className="border-t pt-8">
            <h2 className="text-2xl font-bold mb-6">Detailed Analysis</h2>

            {/* Technical SEO Section */}
            {renderAuditSection(
              'Technical SEO',
              result.audits.technical,
              result.categoryDescriptions.technical
            )}

            {/* Content Optimization Section */}
            {renderAuditSection(
              'Content Optimization',
              result.audits.content,
              result.categoryDescriptions.content
            )}

            {/* Performance Section */}
            {renderAuditSection(
              'Performance',
              result.audits.performance,
              result.categoryDescriptions.performance
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export { AnalysisForm as default };
