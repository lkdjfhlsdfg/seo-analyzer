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
        <div className="h-12 bg-gray-200 rounded-xl w-3/4 mx-auto"></div>
        <div className="h-64 bg-gray-200 rounded-2xl"></div>
      </div>
    </div>
  )
});

export default function Page() {
  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-gradient-to-b from-[#0A0A0A] to-[#1A1A1A] text-white">
        {/* Animated Background Pattern */}
        <div className="fixed inset-0 z-0 opacity-20">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat opacity-30"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#34D399] via-transparent to-[#88C0D0] mix-blend-overlay"></div>
        </div>

        {/* Header */}
        <header className="relative z-10 border-b border-white/10 backdrop-blur-xl bg-black/20">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#34D399] to-[#88C0D0]"></div>
                <span className="text-xl font-semibold tracking-tight">SEO Analyzer</span>
              </div>
              <nav className="hidden md:flex items-center gap-8 text-sm">
                <a href="#features" className="text-white/70 hover:text-white transition-colors">Features</a>
                <a href="#how-it-works" className="text-white/70 hover:text-white transition-colors">How it Works</a>
                <a href="https://github.com/yourusername/seo-analyzer" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors">GitHub</a>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative z-10 container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-block mb-4 px-4 py-1 bg-white/10 backdrop-blur-lg rounded-full text-sm text-[#34D399]">
              Powered by Google PageSpeed Insights
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Analyze Your Website's
              <br />
              <span className="bg-gradient-to-r from-[#34D399] to-[#88C0D0] bg-clip-text text-transparent">
                SEO Performance
              </span>
            </h1>
            <p className="text-xl text-white/60 mb-8 max-w-2xl mx-auto">
              Get actionable insights and recommendations to improve your website's visibility,
              performance, and search engine rankings.
            </p>
          </div>

          {/* Analysis Form */}
          <AnalysisForm />

          {/* Features Grid */}
          <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="w-12 h-12 mb-6 rounded-xl bg-gradient-to-br from-[#34D399] to-transparent p-3">
                <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Technical SEO</h3>
              <p className="text-white/60">
                Comprehensive analysis of your site's technical health including speed,
                mobile-friendliness, and crawlability.
              </p>
            </div>
            <div className="group p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="w-12 h-12 mb-6 rounded-xl bg-gradient-to-br from-[#88C0D0] to-transparent p-3">
                <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Content Optimization</h3>
              <p className="text-white/60">
                Get actionable insights to improve your content's relevance and
                keyword optimization.
              </p>
            </div>
            <div className="group p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="w-12 h-12 mb-6 rounded-xl bg-gradient-to-br from-[#34D399] to-[#88C0D0] p-3">
                <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Performance Analysis</h3>
              <p className="text-white/60">
                Monitor your site's speed, Core Web Vitals, and get recommendations
                for improvement.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/10 py-8 mt-20">
          <div className="container mx-auto px-4 text-center text-white/40 text-sm">
            <p>© {new Date().getFullYear()} SEO Analyzer. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </ErrorBoundary>
  );
}

