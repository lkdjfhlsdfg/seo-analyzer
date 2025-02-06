import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';

const PAGESPEED_API_KEY = process.env.GOOGLE_PAGESPEED_API_KEY;

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
    const body = await req.json().catch(() => ({}));
    const { website } = body;

    console.log('Received request for website:', website);

    if (!website) {
      console.error('No website URL provided');
      return NextResponse.json(
        { error: 'Website URL is required' },
        { status: 400 }
      );
    }

    const sanitizedUrl = sanitizeUrl(website);
    if (!isValidUrl(sanitizedUrl)) {
      console.error('Invalid website URL:', website);
      return NextResponse.json(
        { error: 'Please enter a valid website URL (e.g., example.com or https://example.com)' },
        { status: 400 }
      );
    }

    // Check cache first with content validation
    const cachedResult = await getCachedResult(sanitizedUrl);
    if (cachedResult) {
      console.log('Returning cached result for:', sanitizedUrl);
      return NextResponse.json(
        { result: cachedResult },
        {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
            'Cache-Control': 'public, s-maxage=3600',
          },
        }
      );
    }

    // Check API key
    if (!PAGESPEED_API_KEY) {
      console.error('PageSpeed API key not configured');
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    // Construct API URL with strategy and category parameters
    const encodedUrl = encodeURIComponent(sanitizedUrl);
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodedUrl}&key=${PAGESPEED_API_KEY}&strategy=mobile&category=performance&category=seo&category=best-practices&category=accessibility`;
    
    console.log('Fetching PageSpeed data...');
    
    // Set timeout for fetch request
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(apiUrl, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('PageSpeed API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });

        // Handle specific error cases
        if (response.status === 429) {
          return NextResponse.json(
            { error: 'Too many requests. Please try again in a few minutes.' },
            { status: 429 }
          );
        }

        if (response.status === 404) {
          return NextResponse.json(
            { error: 'Website not found. Please check the URL and try again.' },
            { status: 404 }
          );
        }

        return NextResponse.json(
          { error: 'Unable to analyze website. Please try again later.' },
          { status: response.status }
        );
      }

      const data = await response.json();
      
      if (!data.lighthouseResult) {
        console.error('Invalid API response:', data);
        return NextResponse.json(
          { error: 'Unable to analyze website. The URL might be invalid or the site might be unavailable.' },
          { status: 400 }
        );
      }

      const { categories, audits } = data.lighthouseResult;
      
      if (!categories || !audits) {
        console.error('Missing data in lighthouse result:', data.lighthouseResult);
        return NextResponse.json(
          { error: 'Incomplete analysis results. Please try again.' },
          { status: 500 }
        );
      }

      console.log('Processing lighthouse data...');

      // Helper function to determine impact level
      const getAuditImpact = (score: number): ImpactLevel => {
        if (score >= 0.9) return 'low';
        if (score >= 0.5) return 'medium';
        return 'high';
      };

      // Helper function to get recommendations
      const getRecommendations = (audit: any): string[] => {
        if (!audit || audit.score === 1) return [];

        const recommendations: string[] = [];

        // Add the main description as a recommendation
        if (audit.description) {
          recommendations.push(audit.description);
        }

        // Add specific details from the audit
        if (audit.details?.items?.length > 0) {
          const items = audit.details.items.slice(0, 3);
          items.forEach((item: any) => {
            if (item.url) recommendations.push(`Optimize resource: ${item.url}`);
            if (item.source) recommendations.push(`Check source: ${item.source}`);
            if (item.snippet) recommendations.push(`Review code: ${item.snippet}`);
          });
        }

        return recommendations;
      };

      // Helper function to get a simple summary
      const getSimpleSummary = (audit: any): string => {
        if (!audit) return '';
        const score = Math.round((audit.score || 0) * 100);
        return audit.description || `${audit.title} - Score: ${score}/100`;
      };

      // Helper function to get current value
      const getCurrentValue = (audit: any): string => {
        if (!audit) return '';
        if (audit.displayValue) return audit.displayValue;
        if (audit.details?.items?.[0]?.value) return String(audit.details.items[0].value);
        if (audit.numericValue) return `${audit.numericValue.toFixed(2)}`;
        return `Score: ${Math.round((audit.score || 0) * 100)}/100`;
      };

      // Helper function to get suggested value
      const getSuggestedValue = (audit: any): string => {
        if (!audit) return '';
        if (audit.score === 1) return 'Already optimized';
        if (audit.details?.items?.[0]?.target) return `Target: ${audit.details.items[0].target}`;
        return 'Should be improved to reach a score of 90+';
      };

      // Helper function to get implementation details
      const getImplementationDetails = (audit: any) => {
        if (!audit?.details) return [];

        const details = [];

        if (audit.details.items?.length > 0) {
          details.push({
            title: 'Specific Items to Address',
            code: JSON.stringify(audit.details.items.slice(0, 3), null, 2)
          });
        }

        if (audit.details.debugData) {
          details.push({
            title: 'Technical Details',
            code: JSON.stringify(audit.details.debugData, null, 2)
          });
        }

        return details;
      };

      // Process audits with more detailed information
      const processAudits = (audits: Record<string, any>, categoryId: string): ProcessedAudit[] => {
        const impactOrder: Record<ImpactLevel, number> = { high: 3, medium: 2, low: 1 };

        // Get the audit refs for this category
        const categoryAuditRefs = categories[categoryId]?.auditRefs?.map((ref: any) => ref.id) || [];
        console.log(`Audit refs for category ${categoryId}:`, categoryAuditRefs);

        return Object.entries(audits)
          .filter(([id, _]: [string, any]) => {
            const isIncluded = categoryAuditRefs.includes(id);
            console.log(`Checking audit ${id} for category ${categoryId}:`, isIncluded);
            return isIncluded;
          })
          .map(([id, audit]: [string, any]): ProcessedAudit => {
            const impact: ImpactLevel = getAuditImpact(audit.score || 0);
            const category = categorizeAudit({ ...audit, id }, categoryId);

            console.log(`Processing audit ${id}:`, {
              title: audit.title,
              score: audit.score,
              impact,
              category
            });

            return {
              title: audit.title || '',
              description: audit.description || '',
              score: audit.score || 0,
              displayValue: audit.displayValue,
              scoreDisplayMode: audit.scoreDisplayMode || 'numeric',
              details: audit.details,
              warnings: audit.warnings || [],
              recommendations: getRecommendations(audit),
              impact,
              simple_summary: getSimpleSummary(audit),
              current_value: getCurrentValue(audit),
              suggested_value: getSuggestedValue(audit),
              implementation_details: getImplementationDetails(audit),
              category
            };
          })
          .sort((a, b) => {
            const impactDiff = impactOrder[b.impact] - impactOrder[a.impact];
            return impactDiff !== 0 ? impactDiff : (b.score - a.score);
          });
      };

      // Process all audits
      const allAudits = [
        ...processAudits(audits, 'performance'),
        ...processAudits(audits, 'seo'),
        ...processAudits(audits, 'accessibility'),
        ...processAudits(audits, 'best-practices')
      ];

      console.log('Processed audits count:', allAudits.length);
      console.log('Sample audit:', allAudits[0]);
      console.log('Available categories:', Object.keys(categories));
      console.log('Category scores:', {
        performance: categories.performance?.score,
        seo: categories.seo?.score,
        accessibility: categories.accessibility?.score,
        bestPractices: categories['best-practices']?.score
      });

      // Map Lighthouse categories to our categories
      const processedAudits = {
        technical: allAudits.filter(audit => {
          const auditCategory = audit.category as string;
          const isTechnical = audit.title.toLowerCase().includes('accessibility') ||
                 audit.title.toLowerCase().includes('best-practices') ||
                 audit.description?.toLowerCase().includes('accessibility') ||
                 audit.description?.toLowerCase().includes('best practices') ||
                 auditCategory === 'accessibility' ||
                 auditCategory === 'best-practices';
          if (isTechnical) {
            console.log('Technical audit found:', { title: audit.title, category: auditCategory });
          }
          return isTechnical;
        }),
        content: allAudits.filter(audit => {
          const auditCategory = audit.category as string;
          const isContent = audit.title.toLowerCase().includes('seo') ||
                 audit.title.toLowerCase().includes('content') ||
                 audit.description?.toLowerCase().includes('seo') ||
                 audit.description?.toLowerCase().includes('content') ||
                 auditCategory === 'seo';
          if (isContent) {
            console.log('Content audit found:', { title: audit.title, category: auditCategory });
          }
          return isContent;
        }),
        performance: allAudits.filter(audit => {
          const auditCategory = audit.category as string;
          const isPerformance = audit.title.toLowerCase().includes('performance') ||
                 audit.title.toLowerCase().includes('speed') ||
                 audit.title.toLowerCase().includes('load') ||
                 audit.description?.toLowerCase().includes('performance') ||
                 audit.description?.toLowerCase().includes('speed') ||
                 audit.description?.toLowerCase().includes('load') ||
                 auditCategory === 'performance';
          if (isPerformance) {
            console.log('Performance audit found:', { title: audit.title, category: auditCategory });
          }
          return isPerformance;
        })
      };

      console.log('Audit counts by category:', {
        technical: processedAudits.technical.length,
        content: processedAudits.content.length,
        performance: processedAudits.performance.length
      });

      // If an audit wasn't categorized, put it in technical by default
      const uncategorizedAudits = allAudits.filter(audit => 
        !processedAudits.technical.includes(audit) &&
        !processedAudits.content.includes(audit) &&
        !processedAudits.performance.includes(audit)
      );
      
      if (uncategorizedAudits.length > 0) {
        console.log('Uncategorized audits:', uncategorizedAudits.map(a => a.title));
        processedAudits.technical.push(...uncategorizedAudits);
      }

      // Calculate deterministic scores
      const scores = {
        performance: Math.round((categories.performance?.score || 0) * 100),
        technical: Math.round(((categories.accessibility?.score || 0) + (categories['best-practices']?.score || 0)) * 50),
        content: Math.round((categories.seo?.score || 0) * 100),
      };

      // Calculate overall score using weighted formula
      const overallScore = calculateScore({
        performance: categories.performance?.score || 0,
        accessibility: categories.accessibility?.score || 0,
        seo: categories.seo?.score || 0,
        'best-practices': categories['best-practices']?.score || 0
      });

      // Prepare the result object
      const result = {
        websiteUrl: website,
        timestamp: new Date().toISOString(),
        scores: {
          overall: overallScore,
          ...scores
        },
        audits: processedAudits,
        categoryDescriptions: {
          technical: 'Analysis of your site\'s technical health including mobile-friendliness, accessibility, and crawlability.',
          content: 'Evaluation of your content\'s SEO optimization and relevance.',
          performance: 'Assessment of your website\'s speed and performance metrics.'
        },
        summary: {
          technical: getTopIssues(processedAudits.technical),
          content: getTopIssues(processedAudits.content),
          performance: getTopIssues(processedAudits.performance)
        }
      };

      // Cache the result
      await cacheResult(sanitizedUrl, result);

      return NextResponse.json(
        { result },
        {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300',
          },
        }
      );

    } catch (error) {
      clearTimeout(timeout);
      
      if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Analysis timed out. The website might be too slow or unavailable.' },
          { status: 408 }
        );
      }

      throw error; // Re-throw other errors to be caught by the outer try-catch
    }

  } catch (error) {
    console.error('Error analyzing website:', error);
    
    // Provide user-friendly error messages based on error type
    const errorMessage = error && typeof error === 'object' && 'message' in error && error.message === 'Failed to fetch'
      ? 'Unable to reach the website. Please check the URL and try again.'
      : 'An unexpected error occurred. Please try again later.';

    return NextResponse.json(
      { error: errorMessage },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
