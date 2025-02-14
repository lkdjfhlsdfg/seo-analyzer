'use client';

import { useRouter } from 'next/navigation';

export default function WelcomePage() {
  const router = useRouter();

  const handleGuestAccess = () => {
    router.push('/app');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto space-y-12">
          {/* Header */}
          <div className="space-y-6">
            <h1 className="text-5xl font-light text-black">
              SEO Analyzer
            </h1>
            <p className="text-xl text-black/70 font-light">
              Analyze your website's SEO performance across technical, content, and performance metrics.
              Get actionable insights and recommendations to improve your search engine visibility.
            </p>
          </div>

          {/* Access Button */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleGuestAccess}
              className="h-16 px-8 rounded-lg border border-black/10 bg-white text-black hover:bg-black/5 transition-colors text-lg font-light"
            >
              Start Analyzing
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Technical SEO */}
            <div className="space-y-4">
              <h2 className="text-2xl font-light text-black">Technical SEO</h2>
              <div className="border border-black/10 rounded-lg p-6 h-[200px] hover:bg-black/5 transition-colors">
                <p className="text-black/70 font-light">
                  Analyze your website's technical foundation including mobile-friendliness,
                  site speed, crawlability, and more.
                </p>
              </div>
            </div>

            {/* Content Analysis */}
            <div className="space-y-4">
              <h2 className="text-2xl font-light text-black">Content Analysis</h2>
              <div className="border border-black/10 rounded-lg p-6 h-[200px] hover:bg-black/5 transition-colors">
                <p className="text-black/70 font-light">
                  Evaluate your content quality, keyword optimization,
                  meta descriptions, and content structure.
                </p>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="space-y-4">
              <h2 className="text-2xl font-light text-black">Performance Metrics</h2>
              <div className="border border-black/10 rounded-lg p-6 h-[200px] hover:bg-black/5 transition-colors">
                <p className="text-black/70 font-light">
                  Track key performance indicators like page load times,
                  Core Web Vitals, and user experience metrics.
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-8">
            {[
              { value: '98%', label: 'Accuracy Rate' },
              { value: '5K+', label: 'Websites Analyzed' },
              { value: '24/7', label: 'Real-time Monitoring' }
            ].map((stat, index) => (
              <div key={index} className="border border-black/10 rounded-lg p-6 hover:bg-black/5 transition-colors">
                <div className="text-3xl font-light text-black">{stat.value}</div>
                <div className="text-sm text-black/70 font-light">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 