import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Environment variables
const PAGESPEED_API_KEY = process.env.GOOGLE_PAGESPEED_API_KEY;
const SITE_URL = 'https://seo-analyzer-77gs9bgrr-hans-projects-8b2f2b1c.vercel.app';

export async function POST(request: NextRequest) {
  const headers = new Headers({
    'Content-Type': 'application/json',
  });

  try {
    const { url } = await request.json();
    
    if (!url) {
      return new NextResponse(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers }
      );
    }

    // Get cached analysis result
    const cacheKey = `analysis-${url.replace(/[^a-zA-Z0-9]/g, '-')}`;
    const cacheResponse = await fetch(`https://api.vercel.com/v1/edge-config/${cacheKey}`, {
      headers: {
        'Authorization': `Bearer ${process.env.VERCEL_ACCESS_TOKEN}`,
      }
    }).catch(() => null);

    if (!cacheResponse?.ok) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Analysis not found',
          status: 'not_found'
        }),
        { status: 404, headers }
      );
    }

    const cacheData = await cacheResponse.json();
    
    // If analysis is too old, return not found
    if (Date.now() - cacheData.timestamp > 300000) { // 5 minutes
      return new NextResponse(
        JSON.stringify({ 
          error: 'Analysis expired',
          status: 'expired'
        }),
        { status: 404, headers }
      );
    }

    // If we have detailed results, return them
    if (cacheData.status === 'complete') {
      return new NextResponse(
        JSON.stringify({
          status: 'complete',
          result: cacheData.result
        }),
        { headers }
      );
    }

    // If analysis is still pending, try to update it
    if (cacheData.status === 'pending' && Date.now() - cacheData.timestamp >= 30000) {
      try {
        // Request full analysis
        const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${PAGESPEED_API_KEY}&strategy=mobile&category=performance&category=seo`;
        const response = await fetch(apiUrl, {
          headers: {
            'Referer': SITE_URL,
            'Origin': SITE_URL
          }
        });

        let data;
        try {
          const text = await response.text();
          data = JSON.parse(text);
        } catch (e) {
          console.error('Failed to parse response:', e);
          throw new Error('Invalid response from PageSpeed API');
        }

        if (!response.ok || !data.lighthouseResult) {
          console.error('API Error or missing data:', data);
          throw new Error('Failed to get detailed analysis');
        }

        const {
          lighthouseResult: {
            categories,
            audits
          }
        } = data;

        // Calculate scores
        const performanceScore = categories?.performance?.score 
          ? Math.round(categories.performance.score * 10) 
          : 5;
        const seoScore = categories?.seo?.score 
          ? Math.round(categories.seo.score * 10) 
          : 5;

        // Update cache with detailed results
        const detailedResult = {
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
          const performanceRecommendations: string[] = [];
          if (audits?.['largest-contentful-paint']?.numericValue > 2500) {
            performanceRecommendations.push('Optimize Largest Contentful Paint (LCP)');
          }
          if (audits?.['first-contentful-paint']?.numericValue > 1800) {
            performanceRecommendations.push('Improve First Contentful Paint (FCP)');
          }

          detailedResult.issues.push({
            category: 'technical',
            title: 'Performance Issues Found',
            simple_summary: 'Your website needs performance improvements.',
            description: 'Performance metrics indicate areas for improvement.',
            severity: 10 - performanceScore,
            recommendations: performanceRecommendations,
            current_value: `Performance Score: ${performanceScore}/10`,
            suggested_value: 'Performance Score: > 9/10'
          });
        }

        // Add SEO issues
        if (seoScore < 9) {
          const seoRecommendations: string[] = [];
          if (!audits?.['meta-description']?.score) {
            seoRecommendations.push('Add meta descriptions');
          }
          if (!audits?.['document-title']?.score) {
            seoRecommendations.push('Add proper title tags');
          }
          if (!audits?.['robots-txt']?.score) {
            seoRecommendations.push('Check robots.txt');
          }

          detailedResult.issues.push({
            category: 'content',
            title: 'SEO Improvements Needed',
            simple_summary: 'Your website needs SEO optimization.',
            description: 'Several SEO elements need attention.',
            severity: 10 - seoScore,
            recommendations: seoRecommendations,
            current_value: `SEO Score: ${seoScore}/10`,
            suggested_value: 'SEO Score: > 9/10'
          });
        }

        // Update cache with detailed results
        await fetch(`https://api.vercel.com/v1/edge-config/${cacheKey}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${process.env.VERCEL_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url,
            timestamp: Date.now(),
            status: 'complete',
            result: detailedResult
          })
        });

        return new NextResponse(
          JSON.stringify({
            status: 'complete',
            result: detailedResult
          }),
          { headers }
        );
      } catch (error) {
        console.error('Detailed analysis error:', error);
      }
    }

    // Return pending status with next check time
    return new NextResponse(
      JSON.stringify({
        status: 'pending',
        nextCheck: cacheData.timestamp + 30000
      }),
      { headers }
    );
  } catch (error: any) {
    console.error('Status check error:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: error.message || 'Failed to check analysis status',
        status: 'error'
      }),
      { status: 500, headers }
    );
  }
} 