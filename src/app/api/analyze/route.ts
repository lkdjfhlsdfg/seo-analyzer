import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Environment variables
const PAGESPEED_API_KEY = process.env.GOOGLE_PAGESPEED_API_KEY;
const SITE_URL = 'https://seo-analyzer-77gs9bgrr-hans-projects-8b2f2b1c.vercel.app';

// Cache duration constants
const CACHE_MAX_AGE = 60; // 1 minute
const STALE_WHILE_REVALIDATE = 30; // 30 seconds

function isValidUrl(urlString: string): boolean {
  try {
    new URL(urlString);
    return true;
  } catch {
    return false;
  }
}

interface AuditItem {
  url: string;
  [key: string]: any;
}

async function getPageSpeedData(url: string, signal?: AbortSignal) {
  try {
    // Simplified API request with correct fields parameter
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${PAGESPEED_API_KEY}&strategy=mobile&category=performance&category=seo`;
    
    console.log('Calling PageSpeed API for URL:', url);
    
    const response = await fetch(apiUrl, {
      headers: {
        'Referer': SITE_URL,
        'Origin': SITE_URL
      },
      signal
    });

    const data = await response.json();

    // Check for API error response
    if (!response.ok) {
      const errorMessage = data.error?.message || `PageSpeed API error (${response.status})`;
      console.error('PageSpeed API error details:', data.error);
      throw new Error(errorMessage);
    }

    if (!data.lighthouseResult) {
      console.error('Invalid API response:', data);
      throw new Error('Invalid response from PageSpeed API: Missing lighthouse result');
    }

    const {
      lighthouseResult: {
        categories,
        audits
      }
    } = data;

    // Calculate basic scores with fallbacks
    const performanceScore = categories?.performance?.score 
      ? Math.round(categories.performance.score * 10) 
      : 5;
    const seoScore = categories?.seo?.score 
      ? Math.round(categories.seo.score * 10) 
      : 5;

    const issues = [];
    
    // Quick performance check
    if (performanceScore < 9) {
      const lcp = audits?.['largest-contentful-paint']?.numericValue ?? 0;
      const fcp = audits?.['first-contentful-paint']?.numericValue ?? 0;
      
      issues.push({
        category: 'technical',
        title: 'Performance Optimization Required',
        simple_summary: 'Your website needs performance improvements.',
        description: 'Core performance metrics indicate areas for improvement.',
        severity: 10 - performanceScore,
        recommendations: [
          lcp > 2500 ? 'Optimize Largest Contentful Paint (LCP)' : null,
          fcp > 1800 ? 'Improve First Contentful Paint (FCP)' : null,
        ].filter(Boolean),
        current_value: `LCP: ${(lcp/1000).toFixed(1)}s, FCP: ${(fcp/1000).toFixed(1)}s`,
        suggested_value: 'LCP: < 2.5s, FCP: < 1.8s'
      });
    }

    // Quick SEO check
    const seoIssues = [];
    if (!audits?.['meta-description']?.score) seoIssues.push('Add meta descriptions');
    if (!audits?.['document-title']?.score) seoIssues.push('Add proper title tags');
    if (!audits?.['robots-txt']?.score) seoIssues.push('Check robots.txt');

    if (seoIssues.length > 0) {
      issues.push({
        category: 'content',
        title: 'Basic SEO Improvements Needed',
        simple_summary: 'Your website is missing some basic SEO elements.',
        description: 'Essential SEO elements need to be implemented.',
        severity: Math.min(8, seoIssues.length),
        recommendations: seoIssues,
        current_value: 'Missing basic SEO elements',
        suggested_value: 'Implement all basic SEO elements'
      });
    }

    return {
      performanceScore,
      seoScore,
      issues
    };
  } catch (error: any) {
    console.error('PageSpeed API Error:', error);
    throw error;
  }
}

async function getQuickPageSpeedData(url: string, signal?: AbortSignal) {
  try {
    // Request only performance metrics for quick analysis
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${PAGESPEED_API_KEY}&strategy=mobile&category=performance`;
    
    console.log('Quick PageSpeed analysis for URL:', url);
    
    const response = await fetch(apiUrl, {
      headers: {
        'Referer': SITE_URL,
        'Origin': SITE_URL
      },
      signal,
      // Add a longer timeout at the fetch level
      next: { revalidate: 0 }
    });

    let data;
    try {
      const text = await response.text();
      console.log('Raw API response:', text); // Debug log
      data = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse response:', e);
      throw new Error('Invalid response from PageSpeed API');
    }

    if (!response.ok) {
      const errorMessage = data.error?.message || `PageSpeed API error (${response.status})`;
      console.error('PageSpeed API error details:', data.error);
      throw new Error(errorMessage);
    }

    if (!data.lighthouseResult) {
      console.error('Missing lighthouse result:', data);
      throw new Error('Invalid response: Missing lighthouse result');
    }

    // Extract just the performance score for quick analysis
    const performanceScore = data.lighthouseResult?.categories?.performance?.score 
      ? Math.round(data.lighthouseResult.categories.performance.score * 10) 
      : 5;

    return {
      performanceScore,
      seoScore: 5, // Placeholder until detailed analysis
      issues: [{
        category: 'technical',
        title: 'Initial Performance Score',
        simple_summary: 'Initial performance analysis complete. Detailed analysis loading...',
        description: 'Basic performance score calculated. Full analysis of SEO and other metrics in progress.',
        severity: 10 - performanceScore,
        recommendations: [],
        current_value: `Performance Score: ${performanceScore}/10`,
        suggested_value: 'Performance Score: > 9/10'
      }]
    };
  } catch (error: any) {
    console.error('Quick PageSpeed API Error:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  console.log('Analyze API route called');
  
  const headers = new Headers({
    'Cache-Control': `s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
    'Content-Type': 'application/json',
  });

  try {
    const body = await request.json();
    const { prompt } = body;
    let url = prompt.replace('Analyze this URL: ', '').trim();
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    if (!isValidUrl(url)) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid URL provided' }),
        { status: 400, headers }
      );
    }

    if (!PAGESPEED_API_KEY) {
      console.error('PageSpeed API key is not configured');
      return new NextResponse(
        JSON.stringify({ 
          error: 'Service configuration error',
          quick_score: {
            overall: 5,
            technical: 5,
            content: 5
          }
        }),
        { status: 500, headers }
      );
    }

    // Quick analysis with a longer timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8-second timeout for initial analysis

    try {
      // Get quick performance score first
      const quickData = await getQuickPageSpeedData(url, controller.signal);
      clearTimeout(timeoutId);

      const quickAnalysisResult = {
        score: {
          overall: quickData.performanceScore, // Initial score based just on performance
          technical: quickData.performanceScore,
          content: 5, // Placeholder until detailed analysis
          backlinks: 5
        },
        issues: quickData.issues,
        analysisType: 'quick',
        note: 'Initial performance analysis complete. Refresh in 30 seconds for detailed results.',
        nextCheck: Date.now() + 30000 // Tell client when to check for full results
      };

      // Store the URL for background processing
      const cacheKey = `analysis-${url.replace(/[^a-zA-Z0-9]/g, '-')}`;
      const cacheData = {
        url,
        timestamp: Date.now(),
        status: 'pending',
        result: quickAnalysisResult
      };

      // Store initial results in cache
      await fetch(`https://api.vercel.com/v1/edge-config/${cacheKey}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${process.env.VERCEL_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cacheData)
      }).catch(console.error); // Don't fail if caching fails

      return new NextResponse(JSON.stringify(quickAnalysisResult), { headers });
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return new NextResponse(
          JSON.stringify({ 
            error: 'Analysis is taking longer than expected. Please try again.',
            analysisType: 'timeout',
            quick_score: {
              overall: 5,
              technical: 5,
              content: 5
            },
            issues: [{
              category: 'technical',
              title: 'Analysis Timeout',
              simple_summary: 'The analysis is taking longer than expected.',
              description: 'This could be due to the website being slow to respond or temporarily unavailable.',
              severity: 5,
              recommendations: [
                'Try analyzing the website again',
                'Check if the website is accessible in your browser',
                'Try analyzing at a different time'
              ],
              current_value: 'Timeout after 8 seconds',
              suggested_value: 'Analysis should complete within 8 seconds'
            }]
          }),
          { status: 408, headers }
        );
      }
      
      // Improved error handling
      let errorMessage = 'Failed to analyze website. Please try again.';
      if (error.message.includes('Invalid response')) {
        errorMessage = 'Unable to analyze this website. Please check the URL and try again.';
      } else if (error.message.includes('PageSpeed API error')) {
        errorMessage = 'Analysis service temporarily unavailable. Please try again in a few minutes.';
      }

      return new NextResponse(
        JSON.stringify({ 
          error: errorMessage,
          analysisType: 'error',
          quick_score: {
            overall: 5,
            technical: 5,
            content: 5
          },
          issues: [{
            category: 'technical',
            title: 'Analysis Error',
            simple_summary: errorMessage,
            description: 'There was a problem analyzing this website.',
            severity: 5,
            recommendations: [
              'Check if the URL is correct',
              'Try analyzing the website again',
              'If the problem persists, try a different website'
            ],
            current_value: 'Error during analysis',
            suggested_value: 'Successful analysis'
          }]
        }),
        { status: 500, headers }
      );
    }
  } catch (error: any) {
    console.error('Analysis error:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: error.message || 'Failed to analyze website',
        analysisType: 'error',
        quick_score: {
          overall: 5,
          technical: 5,
          content: 5
        }
      }),
      { status: 500, headers }
    );
  }
}
