import { useState, useCallback, useEffect } from 'react';

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
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Cleanup function for intervals
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const analyzeUrl = useCallback(async (url: string) => {
    if (typeof window === 'undefined') {
      console.warn('Window is not defined, skipping analysis');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    // Clear any existing polling
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }

    try {
      // Initial quick analysis
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: url }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to analyze website');
      }

      const data = await response.json();
      setResult(data);

      // If it's a quick analysis, start polling for detailed results
      if (data.analysisType === 'quick' && data.nextCheck) {
        const interval = setInterval(async () => {
          try {
            const statusResponse = await fetch('/api/analyze/status', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ url }),
            });

            if (!statusResponse.ok) {
              throw new Error('Failed to check analysis status');
            }

            const statusData = await statusResponse.json();

            if (statusData.status === 'complete') {
              clearInterval(interval);
              setPollingInterval(null);
              setResult(statusData.result);
            } else if (statusData.status === 'error' || statusData.status === 'expired') {
              clearInterval(interval);
              setPollingInterval(null);
              setResult(prev => prev ? {
                ...prev,
                note: 'Detailed analysis unavailable. Using quick analysis results.'
              } : null);
            }
          } catch (error) {
            console.error('Status check error:', error);
            // Don't clear interval on network errors, just skip this check
          }
        }, 5000); // Check every 5 seconds

        setPollingInterval(interval);

        // Safety cleanup after 2 minutes
        setTimeout(() => {
          clearInterval(interval);
          setPollingInterval(null);
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
  }, [pollingInterval]);

  return {
    analyzeUrl,
    isAnalyzing,
    error,
    result,
  };
} 