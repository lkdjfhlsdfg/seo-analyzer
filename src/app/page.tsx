'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useClient } from './hooks/useClient';
import Image from 'next/image';
import ErrorBoundary from '@/components/ErrorBoundary';

// Dynamically import client-side components
const AnalysisForm = dynamic(() => import('@/components/AnalysisForm'), {
  ssr: false,
  loading: () => (
    <div className="min-h-[600px] flex items-center justify-center">
      <div className="animate-pulse space-y-8 w-full max-w-2xl">
        <div className="h-12 bg-surface-dark/50 rounded-xl w-3/4 mx-auto"></div>
        <div className="h-64 bg-surface-dark/50 rounded-2xl"></div>
      </div>
    </div>
  )
});

export default function Page() {
  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-gradient-to-b from-surface-darker to-surface-dark text-surface-white">
        {/* Animated Background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-starlight-green/10 via-transparent to-cohere-blue/10 mix-blend-overlay"></div>
        </div>

        {/* Header */}
        <header className="relative z-10 border-b border-surface-white/10 backdrop-blur-xl bg-surface-dark/20">
          <div className="container mx-auto">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-starlight-light to-cohere-blue shadow-glow"></div>
                <span className="text-xl font-display font-semibold tracking-tight">SEO Analyzer</span>
              </div>
              <nav className="hidden md:flex items-center gap-8">
                <a href="#features" className="nav-link">Features</a>
                <a href="#how-it-works" className="nav-link">How it Works</a>
                <a href="https://github.com/yourusername/seo-analyzer" target="_blank" rel="noopener noreferrer" className="nav-link">
                  GitHub
                </a>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative z-10 py-24 sm:py-32">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-block mb-6 px-4 py-1.5 bg-surface-white/5 backdrop-blur-lg rounded-full">
                <span className="text-sm font-medium bg-gradient-to-r from-starlight-light to-cohere-blue bg-clip-text text-transparent">
                  Powered by Google PageSpeed Insights
                </span>
              </div>
              <h1 className="text-display-1 font-display font-bold mb-8">
                Analyze Your Website's{' '}
                <span className="gradient-text">SEO Performance</span>
              </h1>
              <p className="text-body-large text-surface-white/60 mb-12 max-w-2xl mx-auto">
                Get actionable insights and recommendations to improve your website's visibility,
                performance, and search engine rankings.
              </p>
            </div>

            {/* Analysis Form */}
            <div className="max-w-3xl mx-auto">
              <AnalysisForm />
            </div>

            {/* Features Grid */}
            <div id="features" className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Technical SEO Card */}
              <div className="card card-hover group">
                <div className="w-12 h-12 mb-6 rounded-xl bg-gradient-to-br from-starlight-light to-transparent p-3">
                  <svg className="w-full h-full text-surface-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-heading-3 font-display font-semibold mb-4">Technical SEO</h3>
                <p className="text-surface-white/60">
                  Comprehensive analysis of your site's technical health including speed,
                  mobile-friendliness, and crawlability.
                </p>
              </div>

              {/* Content Optimization Card */}
              <div className="card card-hover group">
                <div className="w-12 h-12 mb-6 rounded-xl bg-gradient-to-br from-cohere-blue to-transparent p-3">
                  <svg className="w-full h-full text-surface-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-heading-3 font-display font-semibold mb-4">Content Optimization</h3>
                <p className="text-surface-white/60">
                  Get actionable insights to improve your content's relevance and
                  keyword optimization.
                </p>
              </div>

              {/* Performance Analysis Card */}
              <div className="card card-hover group">
                <div className="w-12 h-12 mb-6 rounded-xl bg-gradient-to-br from-starlight-light to-cohere-blue p-3">
                  <svg className="w-full h-full text-surface-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-heading-3 font-display font-semibold mb-4">Performance Analysis</h3>
                <p className="text-surface-white/60">
                  Monitor your site's speed, Core Web Vitals, and get recommendations
                  for improvement.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works" className="relative z-10 py-24 sm:py-32 border-t border-surface-white/10">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h2 className="text-display-2 font-display font-bold mb-6">
                How It <span className="gradient-text">Works</span>
              </h2>
              <p className="text-body-large text-surface-white/60">
                Our advanced analysis engine provides comprehensive insights into your website's performance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Step 1 */}
              <div className="card card-hover">
                <div className="w-12 h-12 mb-6 rounded-full bg-starlight-light/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-starlight-light">1</span>
                </div>
                <h4 className="text-heading-3 font-display font-semibold mb-4">Enter URL</h4>
                <p className="text-surface-white/60">
                  Simply enter your website's URL to begin the analysis process.
                </p>
              </div>

              {/* Step 2 */}
              <div className="card card-hover">
                <div className="w-12 h-12 mb-6 rounded-full bg-cohere-blue/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-cohere-blue">2</span>
                </div>
                <h4 className="text-heading-3 font-display font-semibold mb-4">Analysis</h4>
                <p className="text-surface-white/60">
                  Our engine analyzes multiple aspects of your website's performance.
                </p>
              </div>

              {/* Step 3 */}
              <div className="card card-hover">
                <div className="w-12 h-12 mb-6 rounded-full bg-starlight-light/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-starlight-light">3</span>
                </div>
                <h4 className="text-heading-3 font-display font-semibold mb-4">Results</h4>
                <p className="text-surface-white/60">
                  Get detailed insights and scores for different aspects of your site.
                </p>
              </div>

              {/* Step 4 */}
              <div className="card card-hover">
                <div className="w-12 h-12 mb-6 rounded-full bg-cohere-blue/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-cohere-blue">4</span>
                </div>
                <h4 className="text-heading-3 font-display font-semibold mb-4">Optimize</h4>
                <p className="text-surface-white/60">
                  Follow our actionable recommendations to improve your site.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 border-t border-surface-white/10 py-12">
          <div className="container mx-auto">
            <div className="text-center">
              <p className="text-surface-white/40 text-sm">
                © {new Date().getFullYear()} SEO Analyzer. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </ErrorBoundary>
  );
}

