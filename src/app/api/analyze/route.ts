import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Environment variables
const PAGESPEED_API_KEY = process.env.GOOGLE_PAGESPEED_API_KEY;

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
        'Referer': process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'
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

    // Single attempt with a strict timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-second timeout

    try {
      const pageSpeedData = await getPageSpeedData(url, controller.signal);
      clearTimeout(timeoutId);

      const analysisResult = {
        score: {
          overall: Math.round((pageSpeedData.performanceScore + pageSpeedData.seoScore) / 2),
          technical: pageSpeedData.performanceScore,
          content: pageSpeedData.seoScore,
          backlinks: 5
        },
        issues: pageSpeedData.issues,
        note: 'This is a quick analysis. For detailed insights, try our full analysis feature.'
      };

      return new NextResponse(JSON.stringify(analysisResult), { headers });
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return new NextResponse(
          JSON.stringify({ 
            error: 'Analysis timeout. Try our full analysis feature for detailed results.',
            quick_score: {
              overall: 5,
              technical: 5,
              content: 5
            }
          }),
          { status: 408, headers }
        );
      }
      
      // Handle specific API errors
      const errorMessage = error.message.includes('PageSpeed API error') 
        ? 'Failed to analyze website. Please check the URL and try again.'
        : error.message;

      return new NextResponse(
        JSON.stringify({ 
          error: errorMessage,
          quick_score: {
            overall: 5,
            technical: 5,
            content: 5
          }
        }),
        { status: 500, headers }
      );
    }
  } catch (error: any) {
    console.error('Analysis error:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: error.message || 'Failed to analyze website',
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
