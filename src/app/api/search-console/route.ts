import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SEARCH_CONSOLE_API_KEY = process.env.GOOGLE_SEARCH_CONSOLE_API_KEY;

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

async function getSearchAnalytics(url: string): Promise<SearchAnalyticsData> {
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
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    const searchData = await getSearchAnalytics(url);

    return NextResponse.json(searchData);
  } catch (error: any) {
    console.error('Search Console analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze search data' },
      { status: 500 }
    );
  }
} 