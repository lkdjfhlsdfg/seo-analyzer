import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, ClipboardIcon } from '@heroicons/react/24/outline';
import { getAiSolution } from '../lib/aiUtils';

interface Issue {
  title: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  impact: 'high' | 'medium' | 'low';
  score?: number;
  aiContext?: string;
}

interface Category {
  name: string;
  score: number;
  description: string;
  issues: Issue[];
}

interface AnalysisDisplayProps {
  analysisData: any;
}

export default function AnalysisDisplay({ analysisData }: AnalysisDisplayProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState<{[key: string]: boolean}>({});
  const [aiSolutions, setAiSolutions] = useState<{[key: string]: string}>({});
  const [expandedSolutions, setExpandedSolutions] = useState<{[key: string]: boolean}>({});

  // Sort issues by impact/severity
  const sortIssues = (issues: Issue[]) => {
    return [...issues].sort((a, b) => {
      const impactOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
      const impactDiff = impactOrder[b.impact] - impactOrder[a.impact];
      if (impactDiff !== 0) return impactDiff;
      
      return (a.score || 0) - (b.score || 0);
    });
  };

  const categories: Category[] = [
    {
      name: 'Technical SEO',
      score: analysisData.scores.technical || 0,
      description: analysisData.categoryDescriptions.technical || 'Core technical aspects including mobile-friendliness and crawlability',
      issues: sortIssues(analysisData.audits.technical || [])
    },
    {
      name: 'Performance',
      score: analysisData.scores.performance || 0,
      description: analysisData.categoryDescriptions.performance || 'Page speed and loading performance metrics',
      issues: sortIssues(analysisData.audits.performance || [])
    },
    {
      name: 'Content',
      score: analysisData.scores.content || 0,
      description: analysisData.categoryDescriptions.content || 'Content quality and optimization analysis',
      issues: sortIssues(analysisData.audits.content || [])
    },
    {
      name: 'Accessibility',
      score: Math.round(((analysisData.scores.accessibility || 0) + (analysisData.scores['best-practices'] || 0)) * 50) || 0,
      description: 'Web accessibility compliance and best practices',
      issues: sortIssues([...(analysisData.audits.accessibility || []), ...(analysisData.audits['best-practices'] || [])])
    }
  ];

  const handleGetAiSolution = async (issueId: string, context: string) => {
    if (!context) return;
    
    setLoadingAi(prev => ({ ...prev, [issueId]: true }));
    try {
      const solution = await getAiSolution(context);
      setAiSolutions(prev => ({ ...prev, [issueId]: solution }));
      setExpandedSolutions(prev => ({ ...prev, [issueId]: true }));
    } catch (error) {
      console.error('Failed to get AI solution:', error);
    }
    setLoadingAi(prev => ({ ...prev, [issueId]: false }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {categories.map((category) => (
          <div key={category.name} className="rounded-xl bg-white/10 backdrop-blur-md shadow-lg overflow-hidden border border-white/20">
            <button
              onClick={() => setExpandedCategory(expandedCategory === category.name ? null : category.name)}
              className="w-full p-6 flex items-center justify-between bg-gradient-to-r from-surface-dark/50 to-surface-dark/30"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                    category.score >= 90 ? 'bg-success/20 text-success' :
                    category.score >= 70 ? 'bg-warning/20 text-warning' :
                    'bg-error/20 text-error'
                  }`}>
                    <span className="text-2xl font-bold">{category.score}</span>
                  </div>
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-display font-semibold text-surface-white">{category.name}</h3>
                  <p className="text-sm text-surface-white/60">{category.description}</p>
                </div>
              </div>
              {expandedCategory === category.name ? (
                <ChevronUpIcon className="h-6 w-6 text-surface-white/60" />
              ) : (
                <ChevronDownIcon className="h-6 w-6 text-surface-white/60" />
              )}
            </button>

            {expandedCategory === category.name && (
              <div className="p-6 bg-surface-dark/40 border-t border-white/10">
                <div className="space-y-4">
                  {category.issues.map((issue, index) => (
                    <div key={index} className="rounded-lg bg-surface-dark/30 p-6 backdrop-blur-sm border border-white/10">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2 flex-grow">
                          <div className="flex items-center gap-3">
                            <h4 className="font-display text-lg text-surface-white">{issue.title}</h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              issue.severity === 'error' ? 'bg-error/20 text-error' :
                              issue.severity === 'warning' ? 'bg-warning/20 text-warning' :
                              'bg-info/20 text-info'
                            }`}>
                              {issue.severity}
                            </span>
                          </div>
                          <p className="text-surface-white/80">{issue.description}</p>

                          {issue.aiContext && !aiSolutions[`${category.name}-${index}`] && (
                            <button
                              onClick={() => handleGetAiSolution(`${category.name}-${index}`, issue.aiContext!)}
                              className="mt-4 px-4 py-2 bg-primary/20 text-primary border border-primary/30 rounded-lg hover:bg-primary/30 transition-colors"
                              disabled={loadingAi[`${category.name}-${index}`]}
                            >
                              {loadingAi[`${category.name}-${index}`] ? (
                                <span className="flex items-center gap-2">
                                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                  Getting Solution...
                                </span>
                              ) : (
                                'Resolve with AI'
                              )}
                            </button>
                          )}

                          {aiSolutions[`${category.name}-${index}`] && (
                            <div className="mt-4">
                              <button
                                onClick={() => setExpandedSolutions(prev => ({ ...prev, [`${category.name}-${index}`]: !prev[`${category.name}-${index}`] }))}
                                className="text-primary hover:text-primary/80 transition-colors"
                              >
                                {expandedSolutions[`${category.name}-${index}`] ? 'Hide Solution' : 'Show Solution'}
                              </button>
                              
                              {expandedSolutions[`${category.name}-${index}`] && (
                                <div className="mt-3 relative">
                                  <pre className="bg-surface-darker/50 text-surface-white/90 p-4 rounded-lg text-sm overflow-x-auto border border-white/10">
                                    <code>{aiSolutions[`${category.name}-${index}`]}</code>
                                  </pre>
                                  <button
                                    onClick={() => copyToClipboard(aiSolutions[`${category.name}-${index}`])}
                                    className="absolute top-2 right-2 p-2 text-surface-white/60 hover:text-surface-white transition-colors"
                                    title="Copy to clipboard"
                                  >
                                    <ClipboardIcon className="h-5 w-5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 