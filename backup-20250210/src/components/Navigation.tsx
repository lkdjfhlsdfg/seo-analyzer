'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useSubscription } from '@/lib/contexts/SubscriptionContext';
import { createDocument, updateDocument, getDocument } from '@/lib/firebase/firebaseUtils';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

export default function Navigation() {
  const { user, logout } = useAuth();
  const { isPro, upgradeToPro } = useSubscription();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to logout');
    }
  };

  const handleProToggle = async () => {
    if (!isPro) {
      try {
        await upgradeToPro();
      } catch (error) {
        console.error('Upgrade error:', error);
        setError('Failed to upgrade to Pro');
      }
    }
  };

  // Add development mode toggle
  const handleDevModeToggle = async () => {
    const userId = user?.uid;
    if (!userId) {
      console.error('No user ID found');
      setError('User not authenticated');
      return;
    }

    try {
      console.log('Starting dev mode toggle for user:', userId);
      console.log('Current mode:', isPro ? 'Pro' : 'Free');

      // Check if subscription document exists
      const existingSubscription = await getDocument('subscriptions', userId);
      console.log('Existing subscription:', existingSubscription);
      
      const subscriptionData = {
        type: isPro ? 'free' : 'pro',
        analysisCredits: isPro ? 3 : 100
      };
      console.log('New subscription data:', subscriptionData);

      if (existingSubscription) {
        console.log('Updating existing subscription');
        await updateDocument('subscriptions', userId, subscriptionData);
      } else {
        console.log('Creating new subscription');
        await createDocument('subscriptions', userId, subscriptionData);
      }

      console.log('Successfully toggled subscription');
      // Force reload to update subscription state
      window.location.reload();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error toggling dev mode:', {
        error,
        userId,
        currentMode: isPro ? 'Pro' : 'Free',
        errorMessage
      });
      setError(`Failed to toggle mode: ${errorMessage}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Link 
              href="/app" 
              className="flex items-center space-x-2 text-slate-900 hover:text-slate-700 transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span className="text-lg font-semibold">SEO Analyzer</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {/* Error Message */}
            {error && (
              <div className="text-red-600 text-sm bg-red-50 px-3 py-1 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            {/* Current Mode Badge */}
            <div className={`
              px-3 py-1 rounded-full text-sm font-medium 
              ${isPro 
                ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                : 'bg-slate-50 text-slate-600 border border-slate-200'
              }
            `}>
              Current: {isPro ? 'Pro' : 'Free'}
            </div>

            {/* Dev Mode Toggle Button */}
            {user && (
              <button
                onClick={handleDevModeToggle}
                className={`
                  px-3 py-1 rounded-lg text-sm font-medium transition-all
                  ${isPro 
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                    : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  }
                `}
              >
                Switch to {isPro ? 'Free' : 'Pro'}
              </button>
            )}

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/app"
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                Dashboard
              </Link>
              {isPro && (
                <Link
                  href="/reports"
                  className="text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Reports
                </Link>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 rounded-lg text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </button>
              ) : (
                <Link
                  href="/"
                  className="inline-flex items-center px-4 py-2 rounded-lg text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 