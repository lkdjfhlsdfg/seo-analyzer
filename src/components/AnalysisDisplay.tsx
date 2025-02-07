import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, ClipboardIcon } from '@heroicons/react/24/outline';
import { getAiSolution } from '../lib/aiUtils';

interface Category {
  name: string;
  score: number;
  description: string;
  issues: Array<{
    title: string;
    description: string;
    severity: 'error' | 'warning' | 'info';
    aiContext?: string;
  }>;
}

interface AnalysisDisplayProps {
  analysisData: any; // Replace with your actual analysis data type
}

export default function AnalysisDisplay({ analysisData }: AnalysisDisplayProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState<{[key: string]: boolean}>({});
  const [aiSolutions, setAiSolutions] = useState<{[key: string]: string}>({});

  const categories: Category[] = [
    {
      name: 'Technical SEO',
      score: analysisData.technicalScore || 0,
      description: 'Core technical aspects including mobile-friendliness and crawlability',
      issues: analysisData.technicalIssues || []
    },
    {
      name: 'Performance',
      score: analysisData.performanceScore || 0,
      description: 'Page speed and loading performance metrics',
      issues: analysisData.performanceIssues || []
    },
    {
      name: 'Content',
      score: analysisData.contentScore || 0,
      description: 'Content quality and optimization analysis',
      issues: analysisData.contentIssues || []
    },
    {
      name: 'Accessibility',
      score: analysisData.accessibilityScore || 0,
      description: 'Web accessibility compliance and best practices',
      issues: analysisData.accessibilityIssues || []
    }
  ];

  const handleGetAiSolution = async (issueId: string, context: string) => {
    if (!context) return;
    
    setLoadingAi(prev => ({ ...prev, [issueId]: true }));
    try {
      const solution = await getAiSolution(context);
      setAiSolutions(prev => ({ ...prev, [issueId]: solution }));
    } catch (error) {
      console.error('Failed to get AI solution:', error);
    }
    setLoadingAi(prev => ({ ...prev, [issueId]: false }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {categories.map((category) => (
        <div key={category.name} className="rounded-lg bg-white shadow-sm overflow-hidden">
          <button
            onClick={() => setExpandedCategory(expandedCategory === category.name ? null : category.name)}
            className="w-full p-4 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  category.score >= 90 ? 'bg-green-100 text-green-700' :
                  category.score >= 70 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  <span className="text-lg font-semibold">{category.score}</span>
                </div>
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                <p className="text-sm text-gray-600">{category.description}</p>
              </div>
            </div>
            {expandedCategory === category.name ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            )}
          </button>

          {expandedCategory === category.name && (
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="space-y-4">
                {category.issues.map((issue, index) => (
                  <div key={index} className="rounded-lg bg-gray-50 p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium text-gray-900">{issue.title}</h4>
                        <p className="text-sm text-gray-700">{issue.description}</p>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        issue.severity === 'error' ? 'bg-red-100 text-red-700' :
                        issue.severity === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {issue.severity}
                      </div>
                    </div>

                    {issue.aiContext && (
                      <div className="mt-4">
                        <button
                          onClick={() => issue.aiContext && handleGetAiSolution(`${category.name}-${index}`, issue.aiContext)}
                          className="text-sm px-3 py-1 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                          disabled={loadingAi[`${category.name}-${index}`]}
                        >
                          {loadingAi[`${category.name}-${index}`] ? 'Getting Solution...' : 'Get AI Solution'}
                        </button>

                        {aiSolutions[`${category.name}-${index}`] && (
                          <div className="mt-3 relative">
                            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                              <code>{aiSolutions[`${category.name}-${index}`]}</code>
                            </pre>
                            <button
                              onClick={() => copyToClipboard(aiSolutions[`${category.name}-${index}`])}
                              className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white transition-colors"
                              title="Copy to clipboard"
                            >
                              <ClipboardIcon className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 