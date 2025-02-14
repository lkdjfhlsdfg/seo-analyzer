import { useState, useCallback } from 'react';

type ImpactLevel = 'high' | 'medium' | 'low';

interface TopIssue {
  title: string;
  impact: ImpactLevel;
  simple_summary: string;
  recommendation: string;
  category: 'technical' | 'content' | 'performance';
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
  category: 'technical' | 'content' | 'performance';
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

export function useAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const analyzeUrl = useCallback(async (url: string) => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      // Validate URL format before making request
      try {
        new URL(url);
      } catch (e) {
        throw new Error('Please enter a valid URL (e.g., https://example.com)');
      }

      console.log('Analyzing URL:', url);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ website: url }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to analyze website' }));
        throw new Error(errorData.error || 'Failed to analyze website. Please try again later.');
      }

      const data = await response.json();

      if (!data.result) {
        throw new Error('Invalid response format. Please try again.');
      }

      // Validate the result structure
      if (!data.result.scores || !data.result.audits) {
        throw new Error('Incomplete analysis results. Please try again.');
      }

      setResult(data.result);
    } catch (error: any) {
      console.error('Analysis error:', error);
      setError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return {
    analyzeUrl,
    isAnalyzing,
    error,
    result,
  };
}
