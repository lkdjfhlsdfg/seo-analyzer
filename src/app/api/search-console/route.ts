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
  const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Last 7 days instead of 30

  try {
    // Get overall metrics and top queries in a single request
    const response = await fetch(
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
          dimensions: ['query'], // Include query dimension by default
          rowLimit: 5, // Limit to top 5 queries
          aggregationType: 'auto'
        }),
        signal
      }
    );

    if (!response.ok) {
      throw new Error(`Search Console API error: ${response.status}`);
    }

    const data = await response.json();
    const rows = data.rows || [];

    // Calculate overall metrics from the rows
    const overall = rows.reduce((acc: any, row: any) => ({
      clicks: acc.clicks + (row.clicks || 0),
      impressions: acc.impressions + (row.impressions || 0),
      position: acc.position + (row.position || 0) * (row.impressions || 1),
    }), { clicks: 0, impressions: 0, position: 0 });

    // Calculate average position and CTR
    if (overall.impressions > 0) {
      overall.position = overall.position / overall.impressions;
      overall.ctr = overall.clicks / overall.impressions;
    } else {
      overall.position = 0;
      overall.ctr = 0;
    }

    return {
      ...overall,
      queries: rows.map((row: any) => ({
        query: row.keys[0],
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position
      })),
      pages: [] // Skip pages data for quick analysis
    };
  } catch (error) {
    console.error('Search Console API Error:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  const headers = new Headers({
    'Cache-Control': `s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
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

    // Single attempt with a strict timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-second timeout

    try {
      const searchData = await getSearchAnalytics(url, controller.signal);
      clearTimeout(timeoutId);

      return new NextResponse(JSON.stringify({
        ...searchData,
        note: 'This is a quick analysis showing data from the last 7 days. For full details, use our detailed analysis feature.'
      }), { headers });
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return new NextResponse(
          JSON.stringify({ 
            error: 'Analysis timeout. Try our detailed analysis feature for full results.',
            quick_stats: {
              clicks: 0,
              impressions: 0,
              position: 0,
              ctr: 0
            }
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
        quick_stats: {
          clicks: 0,
          impressions: 0,
          position: 0,
          ctr: 0
        }
      }),
      { status: 500, headers }
    );
  }
} 