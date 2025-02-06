'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useClient } from './hooks/useClient';
import Image from 'next/image';
import ErrorBoundary from '@/components/ErrorBoundary';

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
  searchVisibility?: number;
};

type SearchConsoleData = {
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
  searchConsole?: SearchConsoleData;
};

// Dynamically import client-side components
const AnalysisForm = dynamic(() => import('@/components/AnalysisForm'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#F5F2EA] flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#F26B3A]"></div>
    </div>
  )
});

export default function Page() {
  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-[#F5F2EA] text-[#2D2D2D]">
        {/* Header */}
        <header className="border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <div className="text-2xl font-bold">SEO Analyzer</div>
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
          </div>

          {/* Analysis Form */}
          <AnalysisForm />

          {/* Features Section */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
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
    </ErrorBoundary>
  );
}

