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
  const [expandedAudits, setExpandedAudits] = useState<Record<string, boolean>>({});
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

  const toggleAuditExpansion = (auditId: string) => {
    setExpandedAudits(prev => ({
      ...prev,
      [auditId]: !prev[auditId]
    }));
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
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-green-700">✓ All optimizations in place for this category.</p>
          </div>
        </div>
      );
    }

    // Sort audits by impact and score
    const sortedAudits = [...audits].sort((a, b) => {
      const impactOrder = { high: 3, medium: 2, low: 1 };
      const impactDiff = impactOrder[b.impact] - impactOrder[a.impact];
      return impactDiff !== 0 ? impactDiff : (b.score - a.score);
    });

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
            <p className="text-green-700">✓ No high-priority issues found.</p>
          )}
        </div>

        {/* Detailed Audits */}
        <div className="space-y-4">
          {sortedAudits.map((audit, index) => {
            const auditId = `${title}-${index}`;
            const isExpanded = expandedAudits[auditId];
            const isOptimized = audit.score >= 0.9;

            return (
              <div key={index} className={`bg-[#F5F2EA] p-4 rounded-lg ${isOptimized ? 'border border-green-200' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-lg">{audit.title}</h4>
                      <span className={`text-sm px-2 py-0.5 rounded ${
                        isOptimized ? 'bg-green-100 text-green-800' :
                        audit.impact === 'high' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {isOptimized ? 'Optimized' : `${audit.impact.charAt(0).toUpperCase() + audit.impact.slice(1)} Impact`}
                      </span>
                    </div>
                    
                    {isOptimized ? (
                      <p className="text-green-700 mt-2">✓ This aspect is well optimized.</p>
                    ) : (
                      <p className="text-gray-600 mt-2">{audit.description}</p>
                    )}
                  </div>

                  <div className="ml-4 flex flex-col items-end">
                    {audit.scoreDisplayMode === 'numeric' && (
                      <div className={`text-lg font-medium px-3 py-1 rounded ${getScoreColor(audit.score * 100)}`}>
                        {Math.round(audit.score * 100)}/100
                      </div>
                    )}
                    {!isOptimized && (
                      <button
                        onClick={() => toggleAuditExpansion(auditId)}
                        className="mt-2 text-sm text-gray-500 hover:text-gray-700"
                      >
                        {isExpanded ? 'Hide Details' : 'Show Details'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Expandable Details Section */}
                {!isOptimized && isExpanded && (
                  <div className="mt-4 border-t border-gray-200 pt-4">
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

                    {/* Implementation Details with Toggle */}
                    {audit.implementation_details && audit.implementation_details.length > 0 && (
                      <div className="mt-4">
                        {audit.implementation_details.map((detail, idx) => (
                          <div key={idx} className="mb-2">
                            <div className="flex items-center justify-between">
                              <h6 className="text-sm font-medium text-gray-600">{detail.title}</h6>
                              <button
                                onClick={() => toggleAuditExpansion(`${auditId}-code-${idx}`)}
                                className="text-sm text-[#F26B3A] hover:text-[#E25A29]"
                              >
                                {expandedAudits[`${auditId}-code-${idx}`] ? 'Hide Code' : 'Show Code'}
                              </button>
                            </div>
                            {expandedAudits[`${auditId}-code-${idx}`] && (
                              <pre className="text-xs bg-gray-800 text-gray-200 p-3 rounded mt-1 overflow-x-auto">
                                {detail.code}
                                {/* TODO: Add line numbers and highlight specific lines that need attention */}
                              </pre>
                            )}
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
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
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
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-8 animate-cell-expand">
          {/* Score Overview */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-8 text-[var(--coniferous-green)]">Analysis Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Overall', score: result.scores.overall },
                { title: 'Technical SEO', score: result.scores.technical },
                { title: 'Content', score: result.scores.content },
                { title: 'Performance', score: result.scores.performance }
              ].map((item) => (
                <div key={item.title} className="card-hover bg-white/50 p-6 rounded-xl border border-[var(--synthetic-quartz)]">
                  <h4 className="font-semibold text-lg mb-3 text-[var(--coniferous-green)]">{item.title}</h4>
                  <div className={`text-4xl font-bold ${getScoreColor(item.score)}`}>
                    {item.score}/100
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Analysis */}
          <div className="border-t border-[var(--synthetic-quartz)] pt-12">
            <h2 className="text-3xl font-bold mb-8 text-[var(--coniferous-green)]">Detailed Analysis</h2>
            
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
