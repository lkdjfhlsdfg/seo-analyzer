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
  const [expandedAudits, setExpandedAudits] = useState<Record<string, boolean>>({});
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, AiSolution>>({});
  const [loadingSolutions, setLoadingSolutions] = useState<Record<string, boolean>>({});
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

  const getAiSolution = async (issue: string): Promise<AiSolution> => {
    try {
      const response = await fetch('/api/openai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          issue,
          context: 'web development, SEO, accessibility, and performance optimization'
        })
      });
      
      if (!response.ok) throw new Error('Failed to get AI solution');
      return await response.json();
    } catch (error) {
      console.error('AI Solution Error:', error);
      return { solution: 'Unable to generate solution at this time. Please try again later.' };
    }
  };

  const handleGetAiSolution = async (auditId: string, issue: string) => {
    setLoadingSolutions(prev => ({ ...prev, [auditId]: true }));
    const solution = await getAiSolution(issue);
    setExpandedSolutions(prev => ({ ...prev, [auditId]: solution }));
    setLoadingSolutions(prev => ({ ...prev, [auditId]: false }));
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
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-6">
          <h3 className="text-2xl font-display font-bold text-[var(--coniferous-green)]">{title}</h3>
          <div className="flex-1 h-px bg-gradient-to-r from-[var(--coniferous-green)]/20 to-transparent"></div>
        </div>
        <p className="text-gray-600 mb-8">{description}</p>

        {/* Priority Issues Section */}
        <div className="bg-white/95 rounded-xl shadow-lg p-6 mb-8">
          <h4 className="font-display text-xl font-semibold mb-4 text-[var(--coniferous-green)]">Priority Issues</h4>
          {result?.summary?.[summaryKey] && result.summary[summaryKey].length > 0 ? (
            <div className="space-y-6">
              {result.summary[summaryKey].map((issue: TopIssue, idx: number) => {
                const auditId = `${title}-${idx}`;
                const solution = expandedSolutions[auditId];
                const isLoading = loadingSolutions[auditId];

                return (
                  <div key={idx} className="relative">
                    <div className="flex items-start gap-4">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        issue.impact === 'high' ? 'bg-red-500' :
                        issue.impact === 'medium' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`} />
                      <div className="flex-1">
                        <h5 className="text-lg font-semibold text-gray-900 mb-2">{issue.title}</h5>
                        <p className="text-gray-700 mb-3">{issue.simple_summary}</p>
                        
                        {!solution && !isLoading && (
                          <button
                            onClick={() => handleGetAiSolution(auditId, `${issue.title}: ${issue.simple_summary}`)}
                            className="inline-flex items-center gap-2 text-[var(--cohere-blue)] hover:text-[var(--cohere-dark)] transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Get AI Solution
                          </button>
                        )}

                        {isLoading && (
                          <div className="flex items-center gap-2 text-gray-500">
                            <LoadingSpinner className="w-5 h-5" />
                            Generating solution...
                          </div>
                        )}

                        {solution && (
                          <div className="mt-4 bg-gray-50 rounded-lg p-4">
                            <div className="prose prose-sm max-w-none">
                              <h6 className="text-sm font-semibold text-gray-900 mb-2">AI-Suggested Solution:</h6>
                              <p className="text-gray-700">{solution.solution}</p>
                              {solution.code && (
                                <pre className="mt-3 p-3 bg-gray-800 text-gray-200 rounded-md overflow-x-auto">
                                  <code>{solution.code}</code>
                                </pre>
                              )}
                              {solution.explanation && (
                                <p className="mt-2 text-sm text-gray-600">{solution.explanation}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6">
              <svg className="w-12 h-12 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-700">No priority issues found in this category.</p>
            </div>
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
                <div key={item.title} className="relative overflow-hidden bg-white/90 rounded-xl border border-[var(--synthetic-quartz)] shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-starlight-light/5"></div>
                  <div className="relative p-6">
                    <h4 className="font-display text-lg font-semibold mb-2 text-[var(--coniferous-green)]">{item.title}</h4>
                    <div className={`font-display text-4xl font-bold tabular-nums ${getScoreColor(item.score)}`}>
                      {item.score}/100
                    </div>
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
