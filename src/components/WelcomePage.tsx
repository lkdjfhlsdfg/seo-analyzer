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
    <div className="min-h-screen bg-white">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]" />
      
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left column - Hero content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-light text-black">
                  Where SEO
                  <span className="block">
                    Meets Intelligence
                  </span>
                </h1>
                <p className="text-xl text-black/70 max-w-2xl font-light">
                  Analyze your website's SEO performance with AI-powered insights. Get detailed recommendations and improve your rankings.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleGoogleLogin}
                  className="px-6 py-4 border border-black/10 rounded-lg text-black hover:border-black/20 transition-all text-sm"
                >
                  Continue with Google
                </button>

                <button
                  onClick={handleGuestAccess}
                  className="px-6 py-4 text-black/70 hover:text-black transition-colors text-sm"
                >
                  Try as Guest
                </button>
              </div>

              <div className="grid grid-cols-3 gap-8 pt-8">
                <div className="space-y-2">
                  <div className="text-3xl font-light text-black">98%</div>
                  <div className="text-sm text-black/70">Accuracy Rate</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-light text-black">5K+</div>
                  <div className="text-sm text-black/70">Websites Analyzed</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-light text-black">24/7</div>
                  <div className="text-sm text-black/70">Real-time Monitoring</div>
                </div>
              </div>
            </div>

            {/* Right column - Features */}
            <div className="border border-black/10 rounded-lg p-8">
              <div className="space-y-6">
                <h2 className="text-2xl font-light text-black">Why choose our SEO Analyzer?</h2>
                
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
                    <div key={index} className="flex items-start space-x-4 p-4 border border-black/10 rounded-lg hover:border-black/20 transition-colors">
                      <div className="text-2xl">{feature.icon}</div>
                      <div>
                        <h3 className="font-medium text-black">{feature.title}</h3>
                        <p className="text-sm text-black/70">{feature.description}</p>
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