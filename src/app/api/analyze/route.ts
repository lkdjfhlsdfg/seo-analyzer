import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Environment variables
const PAGESPEED_API_KEY = process.env.GOOGLE_PAGESPEED_API_KEY;

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

async function getPageSpeedData(url: string) {
  if (!PAGESPEED_API_KEY) {
    throw new Error('PageSpeed API key is not configured');
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${PAGESPEED_API_KEY}&strategy=mobile`
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('PageSpeed API error response:', errorText);
      throw new Error(`Failed to analyze website: ${response.status} ${response.statusText}`);
    }

    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.error('Failed to parse PageSpeed API response:', e);
      throw new Error('Invalid response from PageSpeed API');
    }
    
    if (!data.lighthouseResult) {
      console.error('Missing lighthouse result:', data);
      throw new Error('Invalid response from PageSpeed API: Missing lighthouse result');
    }

    const {
      lighthouseResult: {
        categories,
        audits,
        configSettings: { formFactor }
      }
    } = data;

    const performanceScore = Math.round(categories.performance.score * 10);
    const seoScore = Math.round(categories.seo.score * 10);
    const accessibilityScore = Math.round(categories.accessibility.score * 10);
    
    const issues = [];
    
    // Core Web Vitals analysis
    const coreWebVitals = {
      LCP: audits['largest-contentful-paint'].numericValue,
      FID: audits['first-input-delay'] ? audits['first-input-delay'].numericValue : null,
      CLS: audits['cumulative-layout-shift'].numericValue,
      FCP: audits['first-contentful-paint'].numericValue,
      TTI: audits['interactive'].numericValue,
      TBT: audits['total-blocking-time'].numericValue
    };

    // Performance issues
    if (performanceScore < 9) {
      issues.push({
        category: 'technical',
        title: 'Core Web Vitals Optimization Required',
        simple_summary: `Your website's performance needs improvement. Pages are loading slower than Google's recommended speed, which could affect both user experience and search rankings.`,
        description: 'Core Web Vitals and performance metrics indicate several areas for improvement.',
        severity: 10 - performanceScore,
        recommendations: [
          coreWebVitals.LCP > 2500 ? 'Optimize Largest Contentful Paint (LCP) - Your main content takes too long to load' : null,
          coreWebVitals.FID > 100 ? 'Improve First Input Delay (FID) - Your page takes too long to become interactive' : null,
          coreWebVitals.CLS > 0.1 ? 'Fix Cumulative Layout Shift (CLS) - Your page elements move around while loading' : null,
          coreWebVitals.TTI > 3500 ? 'Reduce Time to Interactive (TTI) - Users have to wait too long before they can interact with your page' : null
        ].filter(Boolean),
        current_value: `LCP: ${(coreWebVitals.LCP/1000).toFixed(1)}s, CLS: ${coreWebVitals.CLS.toFixed(3)}, TTI: ${(coreWebVitals.TTI/1000).toFixed(1)}s`,
        suggested_value: 'LCP: < 2.5s, CLS: < 0.1, TTI: < 3.5s',
        implementation_details: [
          {
            title: 'Image Optimization',
            code: audits['uses-optimized-images'].details?.items?.map((item: AuditItem) => item.url).slice(0, 3).join('\n') || 'No unoptimized images found'
          },
          {
            title: 'Remove Render-Blocking Resources',
            code: audits['render-blocking-resources'].details?.items?.map((item: AuditItem) => item.url).slice(0, 3).join('\n') || 'No render-blocking resources found'
          }
        ]
      });
    }

    // SEO issues
    const seoIssues = [];
    
    if (!audits['meta-description'].score) {
      seoIssues.push('Add meta descriptions to your pages');
    }
    if (!audits['document-title'].score) {
      seoIssues.push('Add proper title tags to your pages');
    }
    if (!audits['html-has-lang'].score) {
      seoIssues.push('Add language attributes to your HTML');
    }
    if (!audits['robots-txt'].score) {
      seoIssues.push('Create or fix your robots.txt file');
    }
    if (!audits['canonical'].score) {
      seoIssues.push('Add canonical URLs to prevent duplicate content issues');
    }
    if (!audits['hreflang'].score) {
      seoIssues.push('Add hreflang tags if you have multiple language versions');
    }

    if (seoIssues.length > 0) {
      issues.push({
        category: 'content',
        title: 'SEO Optimization Required',
        simple_summary: "Your website is missing some basic SEO elements that help search engines understand your content. These are like road signs that help Google navigate and understand your website.",
        description: 'Several essential SEO elements are missing or improperly implemented.',
        severity: Math.min(8, seoIssues.length),
        recommendations: seoIssues,
        current_value: 'Missing essential SEO elements',
        suggested_value: 'All basic SEO elements properly implemented',
        implementation_details: [
          {
            title: 'Meta Tags Implementation',
            code: `<head>
  <title>Your Page Title (50-60 characters)</title>
  <meta name="description" content="A clear, compelling description of your page content (150-160 characters)">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://example.com/your-page" />
  <html lang="en">
</head>`
          }
        ]
      });
    }

    // Accessibility issues
    if (accessibilityScore < 9) {
      const accessibilityIssues = [];
      
      if (!audits['color-contrast'].score) {
        accessibilityIssues.push('Improve color contrast for better readability');
      }
      if (!audits['document-title'].score) {
        accessibilityIssues.push('Add proper page titles for screen readers');
      }
      if (!audits['html-has-lang'].score) {
        accessibilityIssues.push('Add language attributes for screen readers');
      }
      if (!audits['aria-required-attr'].score) {
        accessibilityIssues.push('Add required ARIA attributes to interactive elements');
      }

      if (accessibilityIssues.length > 0) {
        issues.push({
          category: 'accessibility',
          title: 'Accessibility Improvements Needed',
          simple_summary: "Your website might be difficult to use for people with disabilities. Making it accessible to everyone is not just good practice - it's often a legal requirement.",
          description: 'Several accessibility issues were found that could make your site difficult to use for people with disabilities.',
          severity: 10 - accessibilityScore,
          recommendations: accessibilityIssues,
          current_value: `Accessibility Score: ${accessibilityScore}/10`,
          suggested_value: 'Accessibility Score: 9+/10',
          implementation_details: [
            {
              title: 'Accessibility Improvements',
              code: `/* Ensure text meets WCAG 2.1 contrast requirements */
.text-content {
  color: #333333; /* Dark gray for better contrast */
  background-color: #FFFFFF;
}

/* For links and interactive elements */
.interactive-element {
  color: #0052CC; /* Accessible blue */
  background-color: #FFFFFF;
}

/* Add proper ARIA labels */
<button aria-label="Close menu" aria-expanded="true">
  <span class="sr-only">Close</span>
  <svg>...</svg>
</button>`
            }
          ]
        });
      }
    }

    return {
      performanceScore,
      seoScore,
      accessibilityScore,
      issues
    };
  } catch (error) {
    console.error('PageSpeed API Error:', error);
    throw new Error('Failed to analyze page speed');
  }
}

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    let url = prompt.replace('Analyze this URL: ', '').trim();

    // Add https:// if no protocol is specified
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // Validate URL
    if (!isValidUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid URL provided' },
        { status: 400 }
      );
    }

    // Get performance and SEO data
    const pageSpeedData = await getPageSpeedData(url);

    // Combine all analysis results
    const analysisResult = {
      score: {
        overall: Math.round((pageSpeedData.performanceScore + pageSpeedData.seoScore) / 2),
        technical: pageSpeedData.performanceScore,
        content: pageSpeedData.seoScore,
        backlinks: 5 // Placeholder
      },
      issues: pageSpeedData.issues
    };

    return NextResponse.json(analysisResult);
  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze website' },
      { status: 500 }
    );
  }
}
