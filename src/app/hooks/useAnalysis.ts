import { useState, useCallback } from 'react';

interface AnalysisScore {
  overall: number;
  technical: number;
  content: number;
  backlinks: number;
}

interface AnalysisIssue {
  category: string;
  title: string;
  simple_summary: string;
  description: string;
  severity: number;
  recommendations: string[];
  current_value: string;
  suggested_value: string;
}

interface AnalysisResult {
  score: AnalysisScore;
  issues: AnalysisIssue[];
  analysisType?: 'quick' | 'detailed' | 'timeout' | 'error';
  note?: string;
  nextCheck?: number;
  error?: string;
}

export function useAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const analyzeUrl = useCallback(async (url: string) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      // Initial analysis
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze website');
      }

      setResult(data);

      // If it's a quick analysis, poll for detailed results
      if (data.analysisType === 'quick' && data.nextCheck) {
        const checkInterval = setInterval(async () => {
          try {
            const statusResponse = await fetch('/api/analyze/status', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ url }),
            });

            const statusData = await statusResponse.json();

            if (statusData.status === 'complete') {
              clearInterval(checkInterval);
              setResult(statusData.result);
            } else if (statusData.status === 'error' || statusData.status === 'expired') {
              clearInterval(checkInterval);
              // Keep the quick analysis results but show a note
              setResult(prev => prev ? {
                ...prev,
                note: 'Detailed analysis unavailable. Using quick analysis results.'
              } : null);
            }
          } catch (error) {
            console.error('Status check error:', error);
            // Don't clear interval, just skip this check
          }
        }, 5000); // Check every 5 seconds

        // Clear interval after 2 minutes
        setTimeout(() => {
          clearInterval(checkInterval);
          setResult(prev => prev ? {
            ...prev,
            note: 'Detailed analysis timed out. Using quick analysis results.'
          } : null);
        }, 120000);
      }
    } catch (error: any) {
      console.error('Analysis error:', error);
      setError(error.message || 'Failed to analyze website');
      setResult(null);
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