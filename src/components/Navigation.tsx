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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-black/10">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Link 
              href="/app" 
              className="text-lg font-light text-black hover:text-black/70 transition-colors"
            >
              SEO Analyzer
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            {error && (
              <div className="text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Current Mode Badge */}
            <div className="text-sm font-light text-black/70">
              {isPro ? 'Pro' : 'Free'} Plan
            </div>

            {/* Dev Mode Toggle Button */}
            {user && (
              <button
                onClick={handleDevModeToggle}
                className="text-sm font-light text-black/70 hover:text-black transition-colors"
              >
                Switch to {isPro ? 'Free' : 'Pro'}
              </button>
            )}

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/app"
                className="text-sm font-light text-black/70 hover:text-black transition-colors"
              >
                Dashboard
              </Link>
              {isPro && (
                <Link
                  href="/reports"
                  className="text-sm font-light text-black/70 hover:text-black transition-colors"
                >
                  Reports
                </Link>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="text-sm font-light text-black/70 hover:text-black transition-colors"
                >
                  Logout
                </button>
              ) : (
                <Link
                  href="/"
                  className="h-10 px-4 rounded-lg border border-black/10 bg-white text-black hover:bg-black/5 transition-all text-sm font-light"
                >
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