import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';

const PAGESPEED_API_KEY = process.env.GOOGLE_PAGESPEED_API_KEY;

if (!PAGESPEED_API_KEY) {
  console.error('GOOGLE_PAGESPEED_API_KEY is not set in environment variables');
}

// Enhanced cache implementation with content hashing
interface AnalysisCache {
  result: any;
  contentHash: string;
  timestamp: number;
}

const analysisCache = new Map<string, AnalysisCache>();
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

// Helper function to get content hash
async function getContentHash(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SEO-Analyzer/1.0',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch content: ${response.status}`);
    }
    
    const content = await response.text();
    return crypto.createHash('md5').update(content).digest('hex');
  } catch (error) {
    console.error('Error getting content hash:', error);
    return Date.now().toString(); // Fallback to timestamp if can't get content
  }
}

// Helper function to validate URL
function isValidUrl(urlString: string) {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

// Helper function to sanitize URL
function sanitizeUrl(urlString: string) {
  if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
    return `https://${urlString}`;
  }
  return urlString;
}

// Helper function to get cached result with content validation
async function getCachedResult(url: string): Promise<any | null> {
  const cached = analysisCache.get(url);
  if (!cached) return null;

  // Check if cache is still valid time-wise
  if (Date.now() - cached.timestamp > CACHE_DURATION) {
    analysisCache.delete(url);
    return null;
  }

  try {
    // Get current content hash
    const currentHash = await getContentHash(url);
    
    // If content hasn't changed, return cached result
    if (currentHash === cached.contentHash) {
      return cached.result;
    }
    
    // Content changed, invalidate cache
    analysisCache.delete(url);
    return null;
  } catch (error) {
    console.error('Error validating cache:', error);
    return null;
  }
}

// Helper function to cache result with content hash
async function cacheResult(url: string, result: any) {
  try {
    const contentHash = await getContentHash(url);
    analysisCache.set(url, {
      result,
      contentHash,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error caching result:', error);
  }
}

// Deterministic scoring weights
const SCORE_WEIGHTS = {
  performance: 0.3,
  accessibility: 0.2,
  seo: 0.3,
  bestPractices: 0.2
};

// Helper function for deterministic scoring
function calculateScore(categoryScores: Record<string, number>): number {
  const normalizedScores = {
    performance: categoryScores.performance || 0,
    accessibility: categoryScores.accessibility || 0,
    seo: categoryScores.seo || 0,
    bestPractices: categoryScores['best-practices'] || 0
  };

  const weightedScore = Object.entries(SCORE_WEIGHTS).reduce((total, [category, weight]) => {
    return total + (normalizedScores[category as keyof typeof normalizedScores] * weight);
  }, 0);

  return Math.round(weightedScore * 100);
}

// Add debug logging
console.log('PageSpeed API Key available:', !!PAGESPEED_API_KEY);

type ImpactLevel = 'high' | 'medium' | 'low';

interface AuditItem {
  impact: ImpactLevel;
  score: number;
  title: string;
  description: string;
  displayValue?: string;
  scoreDisplayMode: string;
  details?: any;
  warnings?: string[];
  recommendations: string[];
  simple_summary: string;
  current_value: string;
  suggested_value: string;
  implementation_details?: Array<{
    title: string;
    code: string;
  }>;
}

interface ProcessedAudit extends AuditItem {
  impact: ImpactLevel;
  category: 'technical' | 'content' | 'performance';
}

interface TopIssue {
  title: string;
  impact: ImpactLevel;
  simple_summary: string;
  recommendation: string;
  category: 'technical' | 'content' | 'performance';
}

// Helper function to get top issues
const getTopIssues = (audits: ProcessedAudit[]): TopIssue[] => {
  return audits
    .filter(audit => audit.impact === 'high')
    .slice(0, 3)
    .map(audit => ({
      title: audit.title,
      impact: audit.impact,
      simple_summary: audit.simple_summary,
      recommendation: audit.recommendations[0] || '',
      category: audit.category
    }));
};

// Helper function to categorize audits
const categorizeAudit = (audit: any, categoryId: string): 'technical' | 'content' | 'performance' => {
  // Performance-related audits
  if (categoryId === 'performance' ||
      audit.id?.includes('speed') ||
      audit.id?.includes('timing') ||
      audit.id?.includes('load')) {
    return 'performance';
  }
  
  // Content-related audits
  if (audit.id?.includes('content') ||
      audit.id?.includes('seo') ||
      audit.id?.includes('meta') ||
      audit.id?.includes('description') ||
      audit.id?.includes('title')) {
    return 'content';
  }
  
  // Technical SEO audits (default category for other checks)
  return 'technical';
};

// Add OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { website } = body;

    console.log('Analyzing website:', website);

    if (!website) {
      return NextResponse.json({ error: 'Website URL is required' }, { status: 400 });
    }

    // Normalize URL
    let normalizedUrl = website.trim().toLowerCase();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    // Construct PageSpeed API URL
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(normalizedUrl)}&key=${PAGESPEED_API_KEY}&strategy=mobile&category=performance&category=seo&category=best-practices&category=accessibility`;

    console.log('Fetching from PageSpeed API...');
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      console.error('PageSpeed API Error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return NextResponse.json(
        { error: 'Failed to analyze website. Please try again.' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('DEBUG - PageSpeed API raw response:', {
      hasLighthouseResult: !!data.lighthouseResult,
      categories: data.lighthouseResult?.categories ? Object.keys(data.lighthouseResult.categories) : [],
      audits: data.lighthouseResult?.audits ? Object.keys(data.lighthouseResult.audits).length : 0
    });
    
    if (!data.lighthouseResult) {
      console.error('PageSpeed API did not return a lighthouseResult');
      return NextResponse.json(
        { error: 'Failed to analyze website. Please try again.' },
        { status: 500 }
      );
    }

    // Process the results
    const result = {
      websiteUrl: normalizedUrl,
      timestamp: new Date().toISOString(),
      scores: {
        overall: Math.round(((data.lighthouseResult?.categories?.performance?.score || 0) +
                           (data.lighthouseResult?.categories?.seo?.score || 0) +
                           (data.lighthouseResult?.categories?.accessibility?.score || 0) +
                           (data.lighthouseResult?.categories?.['best-practices']?.score || 0)) * 25),
        technical: Math.round((data.lighthouseResult?.categories?.['best-practices']?.score || 0) * 100),
        content: Math.round((data.lighthouseResult?.categories?.seo?.score || 0) * 100),
        performance: Math.round((data.lighthouseResult?.categories?.performance?.score || 0) * 100),
      },
      audits: {
        technical: processAudits(data.lighthouseResult?.audits, 'best-practices'),
        content: processAudits(data.lighthouseResult?.audits, 'seo'),
        performance: processAudits(data.lighthouseResult?.audits, 'performance'),
      },
      categoryDescriptions: {
        technical: data.lighthouseResult?.categories?.['best-practices']?.description || '',
        content: data.lighthouseResult?.categories?.seo?.description || '',
        performance: data.lighthouseResult?.categories?.performance?.description || '',
      }
    };

    return NextResponse.json({ result });

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during analysis.' },
      { status: 500 }
    );
  }
}

function processAudits(audits: any, category: string) {
  if (!audits) return [];

  return Object.values(audits)
    .filter((audit: any) => {
      if (category === 'performance') {
        return audit.id.includes('speed') || audit.id.includes('timing') || audit.id.includes('size');
      }
      if (category === 'seo') {
        return audit.id.includes('seo') || audit.id.includes('meta') || audit.id.includes('description');
      }
      if (category === 'best-practices') {
        return audit.id.includes('best-practices') || 
               audit.id.includes('security') ||
               audit.id.includes('accessibility') ||
               audit.id.includes('errors') ||
               !audit.id.includes('seo'); // Include other audits that aren't explicitly SEO
      }
      return false;
    })
    .map((audit: any) => ({
      title: audit.title,
      description: audit.description,
      score: audit.score || 0,
      displayValue: audit.displayValue,
      scoreDisplayMode: audit.scoreDisplayMode,
      impact: getImpactLevel(audit.score),
      warnings: audit.warnings || [],
      recommendations: [audit.description],
      simple_summary: audit.title,
      current_value: audit.displayValue || 'N/A',
      suggested_value: 'Improve based on recommendations',
    }));
}

function getImpactLevel(score: number | null): 'high' | 'medium' | 'low' {
  if (score === null || score === undefined) return 'medium';
  if (score < 0.5) return 'high';
  if (score < 0.9) return 'medium';
  return 'low';
}
