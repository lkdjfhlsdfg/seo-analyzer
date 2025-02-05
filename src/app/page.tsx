'use client';

import { useState } from 'react';
import { useCompletion } from 'ai/react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/lib/contexts/AuthContext';
import Image from 'next/image';

type AnalysisSection = {
  id: string;
  title: string;
  isOpen: boolean;
};

type SEOScore = {
  overall: number;
  technical: number;
  content: number;
  backlinks: number;
};

type SEOIssue = {
  category: string;
  title: string;
  description: string;
  recommendations: string[];
  current_value: string;
  suggested_value: string;
  implementation_details?: { title: string; code: string }[];
  simple_summary: string;
};

type SEOResult = {
  score: SEOScore;
  issues: SEOIssue[];
};

export default function Home() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [analysisResult, setAnalysisResult] = useState<SEOResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sections, setSections] = useState<AnalysisSection[]>([
    { id: 'technical', title: 'Technical SEO', isOpen: false },
    { id: 'onpage', title: 'On-Page Optimization', isOpen: false },
    { id: 'content', title: 'Content Analysis', isOpen: false },
    { id: 'backlinks', title: 'Backlink Profile', isOpen: false },
    { id: 'local', title: 'Local SEO', isOpen: false },
  ]);

  const toggleSection = (sectionId: string) => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? { ...section, isOpen: !section.isOpen }
        : section
    ));
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newUrl = e.target.value.trim();
    if (newUrl.startsWith('@')) {
      newUrl = newUrl.substring(1);
    }
    setUrl(newUrl);
    setError('');
  };

  const handleAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAnalysisResult(null);
    setIsAnalyzing(true);
    
    if (!url) {
      setError('Please enter a website URL');
      setIsAnalyzing(false);
      return;
    }

    try {
      let processedUrl = url.trim();
      if (!processedUrl.match(/^https?:\/\//i)) {
        processedUrl = 'https://' + processedUrl;
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Analyze this URL: ${processedUrl}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze website');
      }

      const data = await response.json();
      setAnalysisResult(data);
      
      // Open the first section by default
      setSections(sections.map((section, index) => ({
        ...section,
        isOpen: index === 0
      })));
      
      // Save analysis result to localStorage if user is logged in
      if (user) {
        try {
          const analysisEntry = {
            id: Date.now().toString(),
            userId: user.id,
            url: processedUrl,
            date: new Date().toISOString(),
            scores: data.score,
            issues: data.issues,
          };

          // Get existing history
          const existingHistory = JSON.parse(localStorage.getItem(`analysis_history_${user.id}`) || '[]');
          
          // Add new analysis to the beginning of the array
          const updatedHistory = [analysisEntry, ...existingHistory];
          
          // Store updated history
          localStorage.setItem(`analysis_history_${user.id}`, JSON.stringify(updatedHistory));
        } catch (error) {
          console.error('Error saving analysis:', error);
        }
      }
    } catch (err: any) {
      console.error('Error during analysis:', err);
      setError(err.message || 'An error occurred during analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const { user, logout, signInWithGoogle } = useAuth();

  return (
    <main className="min-h-screen bg-[#F5F2EA] text-[#2D2D2D]">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold">SEO Analyzer</div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <a 
                  href="/profile" 
                  className="flex items-center space-x-2 text-gray-600 hover:text-[#F26B3A]"
                >
                  {user.picture && (
                    <Image
                      src={user.picture}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <span>Profile</span>
                </a>
                <button
                  onClick={logout}
                  className="text-gray-600 hover:text-[#F26B3A]"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="flex items-center space-x-2 bg-white text-gray-600 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-6xl font-bold mb-6">
            The <span className="text-[#F26B3A]">smart</span> SEO
            <br />analyzer for your website
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Get actionable insights and improvements for your website&apos;s SEO performance
          </p>
          <button 
            onClick={() => document.getElementById('analysis-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-[#F26B3A] text-white px-8 py-3 rounded-md hover:bg-[#E25A29] transition-colors"
          >
            Let&apos;s work together
          </button>
        </div>

        {/* Analysis Form */}
        <div id="analysis-form" className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <form onSubmit={handleAnalysis} className="space-y-6">
              <div>
                <label htmlFor="url" className="block text-lg font-medium text-gray-700 mb-2">
                  Enter Website URL
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="url"
                    value={url}
                    onChange={handleUrlChange}
                    placeholder="example.com"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#F26B3A] focus:border-[#F26B3A] text-gray-900 text-lg px-4 py-3"
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isAnalyzing}
                className="w-full bg-[#F26B3A] text-white py-3 px-6 rounded-md text-lg font-medium hover:bg-[#E25A29] focus:outline-none focus:ring-2 focus:ring-[#F26B3A] focus:ring-offset-2 disabled:opacity-50 transition-colors"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Now'}
              </button>
            </form>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
              <div className="text-center">
                <LoadingSpinner />
                <p className="mt-4 text-gray-600">Analyzing your website. This may take a minute...</p>
                <div className="mt-2 text-sm text-gray-500">
                  We're checking:
                  <ul className="mt-2 space-y-1">
                    <li>• Technical SEO elements</li>
                    <li>• On-page optimization</li>
                    <li>• Content quality and structure</li>
                    <li>• Backlink profile</li>
                    <li>• Local SEO factors</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {analysisResult && !isAnalyzing && (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-semibold mb-6">Analysis Results</h2>
              
              {/* Score Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-[#F5F2EA] p-6 rounded-lg">
                  <h4 className="font-semibold mb-2">Overall Score</h4>
                  <div className="text-3xl font-bold text-[#F26B3A]">{analysisResult.score.overall}/10</div>
                </div>
                <div className="bg-[#F5F2EA] p-6 rounded-lg">
                  <h4 className="font-semibold mb-2">Technical SEO</h4>
                  <div className="text-3xl font-bold text-[#F26B3A]">{analysisResult.score.technical}/10</div>
                </div>
                <div className="bg-[#F5F2EA] p-6 rounded-lg">
                  <h4 className="font-semibold mb-2">Content Score</h4>
                  <div className="text-3xl font-bold text-[#F26B3A]">{analysisResult.score.content}/10</div>
                </div>
                <div className="bg-[#F5F2EA] p-6 rounded-lg">
                  <h4 className="font-semibold mb-2">Backlink Score</h4>
                  <div className="text-3xl font-bold text-[#F26B3A]">{analysisResult.score.backlinks}/10</div>
                </div>
              </div>

              {/* Analysis Sections */}
              <div className="space-y-4">
                {sections.map((section) => {
                  const sectionIssues = analysisResult.issues.filter(issue => issue.category === section.id);
                  return (
                    <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="flex justify-between items-center w-full p-4 text-left bg-white hover:bg-[#F5F2EA] transition-colors"
                      >
                        <div>
                          <h3 className="text-xl font-semibold">{section.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {sectionIssues.length} {sectionIssues.length === 1 ? 'issue' : 'issues'} found
                          </p>
                        </div>
                        <svg
                          className={`w-6 h-6 transform transition-transform ${section.isOpen ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {section.isOpen && (
                        <div className="p-4 border-t border-gray-200">
                          <div className="space-y-4">
                            {sectionIssues.length > 0 ? (
                              sectionIssues.map((issue, index) => (
                                <div key={index} className="bg-[#F5F2EA] p-4 rounded-lg">
                                  <div>
                                    <h4 className="font-semibold text-lg mb-2">{issue.title}</h4>
                                    
                                    {/* Simple Summary for non-technical users */}
                                    <div className="bg-white p-4 rounded-lg border border-[#F26B3A] mb-4">
                                      <h5 className="font-medium text-[#F26B3A] mb-2">Simple Explanation:</h5>
                                      <p className="text-gray-700">{issue.simple_summary}</p>
                                    </div>

                                    <p className="text-gray-600 mb-4">{issue.description}</p>
                                    
                                    {/* Current Implementation */}
                                    {issue.current_value && (
                                      <div className="mb-4">
                                        <h5 className="font-medium text-gray-700 mb-2">Current Status:</h5>
                                        <div className="bg-white p-3 rounded border border-gray-200 font-mono text-sm">
                                          {issue.current_value}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Suggested Improvement */}
                                    {issue.suggested_value && (
                                      <div className="mb-4">
                                        <h5 className="font-medium text-gray-700 mb-2">Target Metrics:</h5>
                                        <div className="bg-white p-3 rounded border border-gray-200 font-mono text-sm text-[#F26B3A]">
                                          {issue.suggested_value}
                                        </div>
                                      </div>
                                    )}

                                    {/* Implementation Details */}
                                    {issue.implementation_details && (
                                      <div className="mt-6">
                                        <h5 className="font-medium text-gray-700 mb-4">Implementation Guide:</h5>
                                        <div className="space-y-6">
                                          {issue.implementation_details.map((detail, idx) => (
                                            <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200">
                                              <h6 className="font-medium text-[#F26B3A] mb-3">{detail.title}</h6>
                                              <pre className="bg-gray-50 p-4 rounded overflow-x-auto">
                                                <code className="text-sm">{detail.code}</code>
                                              </pre>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Recommendations */}
                                    <div className="space-y-2 text-sm text-gray-600 mt-6">
                                      <h5 className="font-medium text-gray-700 mb-2">Action Items:</h5>
                                      {issue.recommendations.map((rec, idx) => (
                                        <p key={idx} className="flex items-start">
                                          <span className="text-[#F26B3A] mr-2">•</span>
                                          <span>{rec}</span>
                                        </p>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-4 text-gray-500">
                                No issues found in this category
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex justify-end items-center">
                <button className="text-[#F26B3A] hover:text-[#E25A29] transition-colors">
                  Schedule Regular Scans →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Technical SEO</h3>
            <p className="text-gray-600">Comprehensive analysis of your site&apos;s technical health including speed, mobile-friendliness, and crawlability.</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Content Optimization</h3>
            <p className="text-gray-600">Get actionable insights to improve your content&apos;s relevance and keyword optimization.</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Backlink Analysis</h3>
            <p className="text-gray-600">Monitor your backlink profile and discover new link-building opportunities.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
