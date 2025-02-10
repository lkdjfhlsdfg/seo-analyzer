'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useSubscription } from '@/lib/contexts/SubscriptionContext';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase/firebase';
import { useRouter } from 'next/navigation';

export default function WelcomePage() {
  const { user } = useAuth();
  const { isPro } = useSubscription();
  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push('/app');
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  const handleGuestAccess = () => {
    router.push('/app');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Background pattern with reduced opacity */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-30" />
      
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left column - Hero content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold text-slate-900">
                  Where SEO
                  <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    Meets Intelligence
                  </span>
                </h1>
                <p className="text-xl text-slate-600 max-w-2xl">
                  Analyze your website's SEO performance with AI-powered insights. Get detailed recommendations and improve your rankings.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleGoogleLogin}
                  className="inline-flex items-center justify-center px-6 py-4 rounded-xl text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-200 group"
                >
                  <svg className="w-5 h-5 mr-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/20 to-cyan-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                <button
                  onClick={handleGuestAccess}
                  className="inline-flex items-center justify-center px-6 py-4 rounded-xl text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Try as Guest
                </button>
              </div>

              <div className="grid grid-cols-3 gap-8 pt-8">
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-blue-600">98%</div>
                  <div className="text-sm text-slate-600">Accuracy Rate</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-blue-600">5K+</div>
                  <div className="text-sm text-slate-600">Websites Analyzed</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-blue-600">24/7</div>
                  <div className="text-sm text-slate-600">Real-time Monitoring</div>
                </div>
              </div>
            </div>

            {/* Right column - Features */}
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 p-8">
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-slate-900">Why choose our SEO Analyzer?</h2>
                
                <div className="space-y-4">
                  {[
                    {
                      title: 'AI-Powered Analysis',
                      description: 'Get intelligent insights powered by advanced algorithms',
                      icon: '🤖'
                    },
                    {
                      title: 'Real-time Results',
                      description: 'Instant analysis with actionable recommendations',
                      icon: '⚡'
                    },
                    {
                      title: 'Comprehensive Reports',
                      description: 'Detailed reports covering all SEO aspects',
                      icon: '📊'
                    },
                    {
                      title: 'Performance Metrics',
                      description: 'Track and improve your website speed',
                      icon: '🚀'
                    }
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 rounded-xl bg-white/50 hover:bg-white/80 transition-colors">
                      <div className="text-2xl">{feature.icon}</div>
                      <div>
                        <h3 className="font-medium text-slate-900">{feature.title}</h3>
                        <p className="text-sm text-slate-600">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 