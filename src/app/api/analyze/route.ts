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

async function getQuickPageSpeedData(url: string, signal?: AbortSignal) {
  try {
    // Request only performance metrics for quick analysis
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${PAGESPEED_API_KEY}&strategy=mobile&category=performance`;
    
    console.log('Quick PageSpeed analysis for URL:', url);
    
    const response = await fetch(apiUrl, {
      headers: {
        'Referer': process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'
      },
      signal
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.error?.message || `PageSpeed API error (${response.status})`;
      console.error('PageSpeed API error details:', data.error);
      throw new Error(errorMessage);
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

export const runtime = 'edge';

function streamToJson(data: any) {
  return JSON.stringify(data) + '\n';
}

export async function POST(request: Request) {
  const encoder = new TextEncoder();

  try {
    const body = await request.json();
    const { prompt } = body;
    let url = prompt.replace('Analyze this URL: ', '').trim();
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    if (!isValidUrl(url)) {
      return new Response(
        streamToJson({ error: 'Invalid URL provided' }),
        { status: 400 }
      );
    }

    if (!PAGESPEED_API_KEY) {
      return new Response(
        streamToJson({ 
          error: 'Service configuration error',
          quick_score: { overall: 5, technical: 5, content: 5 }
        }),
        { status: 500 }
      );
    }

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial message
          controller.enqueue(encoder.encode(streamToJson({
            status: 'started',
            message: 'Starting analysis...'
          })));

          // Quick performance analysis
          const performanceUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${PAGESPEED_API_KEY}&strategy=mobile&category=performance`;
          const perfResponse = await fetch(performanceUrl);
          const perfData = await perfResponse.json();

          if (!perfResponse.ok) {
            throw new Error(perfData.error?.message || 'Performance analysis failed');
          }

          const performanceScore = perfData.lighthouseResult?.categories?.performance?.score 
            ? Math.round(perfData.lighthouseResult.categories.performance.score * 10) 
            : 5;

          // Send performance results
          controller.enqueue(encoder.encode(streamToJson({
            status: 'performance_complete',
            score: {
              overall: performanceScore,
              technical: performanceScore,
              content: 5
            },
            message: 'Performance analysis complete. Starting SEO analysis...'
          })));

          // SEO analysis
          const seoUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${PAGESPEED_API_KEY}&strategy=mobile&category=seo`;
          const seoResponse = await fetch(seoUrl);
          const seoData = await seoResponse.json();

          if (!seoResponse.ok) {
            throw new Error(seoData.error?.message || 'SEO analysis failed');
          }

          const seoScore = seoData.lighthouseResult?.categories?.seo?.score 
            ? Math.round(seoData.lighthouseResult.categories.seo.score * 10) 
            : 5;

          // Prepare final results
          const finalResult = {
            status: 'complete',
            score: {
              overall: Math.round((performanceScore + seoScore) / 2),
              technical: performanceScore,
              content: seoScore,
              backlinks: 5
            },
            issues: [] as Array<{
              category: string;
              title: string;
              simple_summary: string;
              description: string;
              severity: number;
              recommendations: string[];
              current_value: string;
              suggested_value: string;
            }>,
            analysisType: 'detailed',
            completedAt: Date.now()
          };

          // Add performance issues
          if (performanceScore < 9) {
            const lcp = perfData.lighthouseResult?.audits?.['largest-contentful-paint']?.numericValue;
            const fcp = perfData.lighthouseResult?.audits?.['first-contentful-paint']?.numericValue;
            
            if (lcp || fcp) {
              const recommendations: string[] = [];
              if (lcp > 2500) recommendations.push('Optimize Largest Contentful Paint (LCP)');
              if (fcp > 1800) recommendations.push('Improve First Contentful Paint (FCP)');

              finalResult.issues.push({
                category: 'technical',
                title: 'Performance Issues Found',
                simple_summary: 'Your website needs performance improvements.',
                description: 'Performance metrics indicate areas for improvement.',
                severity: 10 - performanceScore,
                recommendations,
                current_value: `LCP: ${lcp ? (lcp/1000).toFixed(1) : 'N/A'}s, FCP: ${fcp ? (fcp/1000).toFixed(1) : 'N/A'}s`,
                suggested_value: 'LCP: < 2.5s, FCP: < 1.8s'
              });
            }
          }

          // Add SEO issues
          if (seoScore < 9) {
            const seoAudits = seoData.lighthouseResult?.audits;
            const seoIssues = [];
            
            if (!seoAudits?.['meta-description']?.score) seoIssues.push('Add meta descriptions');
            if (!seoAudits?.['document-title']?.score) seoIssues.push('Add proper title tags');
            if (!seoAudits?.['robots-txt']?.score) seoIssues.push('Check robots.txt');

            if (seoIssues.length > 0) {
              finalResult.issues.push({
                category: 'content',
                title: 'SEO Improvements Needed',
                simple_summary: 'Your website needs SEO optimization.',
                description: 'Several SEO elements need attention.',
                severity: 10 - seoScore,
                recommendations: seoIssues,
                current_value: `SEO Score: ${seoScore}/10`,
                suggested_value: 'SEO Score: > 9/10'
              });
            }
          }

          // Send final results
          controller.enqueue(encoder.encode(streamToJson(finalResult)));
          controller.close();
        } catch (error: any) {
          controller.enqueue(encoder.encode(streamToJson({
            status: 'error',
            error: error.message || 'Analysis failed',
            quick_score: { overall: 5, technical: 5, content: 5 }
          })));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Cache-Control': `s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
      }
    });
  } catch (error: any) {
    return new Response(
      streamToJson({ 
        error: error.message || 'Failed to analyze website',
        quick_score: { overall: 5, technical: 5, content: 5 }
      }),
      { status: 500 }
    );
  }
}
