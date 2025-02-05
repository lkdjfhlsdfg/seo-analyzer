import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SEARCH_CONSOLE_API_KEY = process.env.GOOGLE_SEARCH_CONSOLE_API_KEY;

// Cache duration constants
const CACHE_MAX_AGE = 3600; // 1 hour
const STALE_WHILE_REVALIDATE = 600; // 10 minutes

interface SearchAnalyticsData {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  queries: Array<{
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  pages: Array<{
    page: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
}

async function getSearchAnalytics(url: string, signal?: AbortSignal): Promise<SearchAnalyticsData> {
  if (!SEARCH_CONSOLE_API_KEY) {
    throw new Error('Search Console API key is not configured');
  }

  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  try {
    // Get overall metrics
    const overallResponse = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(url)}/searchAnalytics/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SEARCH_CONSOLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate,
          endDate,
          dimensions: [],
        }),
        signal
      }
    );

    if (!overallResponse.ok) {
      throw new Error(`Search Console API error: ${overallResponse.status} ${overallResponse.statusText}`);
    }

    const overallData = await overallResponse.json();
    const overall = overallData.rows?.[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 };

    // Get top queries
    const queriesResponse = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(url)}/searchAnalytics/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SEARCH_CONSOLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate,
          endDate,
          dimensions: ['query'],
          rowLimit: 10,
        }),
        signal
      }
    );

    if (!queriesResponse.ok) {
      throw new Error(`Search Console API error: ${queriesResponse.status} ${queriesResponse.statusText}`);
    }

    const queriesData = await queriesResponse.json();
    const queries = queriesData.rows || [];

    // Get top pages
    const pagesResponse = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(url)}/searchAnalytics/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SEARCH_CONSOLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate,
          endDate,
          dimensions: ['page'],
          rowLimit: 10,
        }),
        signal
      }
    );

    if (!pagesResponse.ok) {
      throw new Error(`Search Console API error: ${pagesResponse.status} ${pagesResponse.statusText}`);
    }

    const pagesData = await pagesResponse.json();
    const pages = pagesData.rows || [];

    return {
      ...overall,
      queries,
      pages,
    };
  } catch (error) {
    console.error('Search Console API Error:', error);
    throw new Error('Failed to fetch Search Console data');
  }
}

export async function POST(request: NextRequest) {
  // Set caching headers for CDN/Edge caching
  const headers = new Headers({
    'Cache-Control': `s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
    'Content-Type': 'application/json',
  });

  try {
    const { url } = await request.json();
    console.log('Search Console API called for URL:', url);

    if (!url) {
      return new NextResponse(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers }
      );
    }

    // Set a timeout for the Search Console API call
    const timeoutMs = 8000; // 8 seconds to allow for processing time
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const searchData = await getSearchAnalytics(url, controller.signal);
      clearTimeout(timeoutId);

      return new NextResponse(JSON.stringify(searchData), { headers });
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return new NextResponse(
          JSON.stringify({ 
            error: 'Analysis is taking longer than expected. Please try again.',
            retry: true
          }),
          { status: 408, headers }
        );
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Search Console analysis error:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: error.message || 'Failed to analyze search data',
        retry: error.message?.includes('timeout') || error.message?.includes('abort')
      }),
      { status: 500, headers }
    );
  }
} 