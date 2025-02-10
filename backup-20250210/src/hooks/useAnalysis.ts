import { useState, useCallback } from 'react';

interface Audit {
  title: string;
  description: string;
  score: number;
  displayValue?: string;
  scoreDisplayMode: string;
  recommendations: string[];
  impact: 'high' | 'medium' | 'low';
  warnings?: string[];
}

interface AnalysisResult {
  websiteUrl: string;
  timestamp: string;
  scores: {
    overall: number;
    performance: number;
    seo: number;
    accessibility: number;
    bestPractices: number;
  };
  audits: {
    performance: Audit[];
    seo: Audit[];
    accessibility: Audit[];
    bestPractices: Audit[];
  };
  categoryDescriptions: {
    performance: string;
    seo: string;
    accessibility: string;
    bestPractices: string;
  };
}

interface AnalysisError {
  error: string;
}

// Get the API URL from environment variables, fallback to relative path if not set
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export function useAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const analyzeUrl = useCallback(async (url: string) => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      console.log('Analyzing URL:', url);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ websiteUrl: url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze website');
      }

      if (!data.result) {
        throw new Error('Invalid response format');
      }

      setResult(data.result);
    } catch (error: any) {
      console.error('Analysis error:', error);
      setError(error.message || 'Failed to analyze website');
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
