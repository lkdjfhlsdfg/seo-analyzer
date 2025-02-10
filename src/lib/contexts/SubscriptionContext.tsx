'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { getDocument, createDocument } from '@/lib/firebase/firebaseUtils';

interface SubscriptionContextType {
  isPro: boolean;
  analysisCredits: number;
  loading: boolean;
  error: string | null;
  upgradeToPro: () => Promise<void>;
}

const defaultContext: SubscriptionContextType = {
  isPro: false,
  analysisCredits: 3, // Free tier starts with 3 credits
  loading: true,
  error: null,
  upgradeToPro: async () => {},
};

export const SubscriptionContext = createContext<SubscriptionContextType>(defaultContext);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isPro, setIsPro] = useState(false);
  const [analysisCredits, setAnalysisCredits] = useState(3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSubscription() {
      if (!user) {
        if (isMounted) {
          setIsPro(false);
          setAnalysisCredits(3);
          setLoading(false);
        }
        return;
      }

      try {
        let subscriptionData = await getDocument('subscriptions', user.uid);
        
        if (!subscriptionData) {
          // Initialize free tier subscription for new users
          const initialSubscription = {
            type: 'free',
            analysisCredits: 3,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          await createDocument('subscriptions', user.uid, initialSubscription);
          subscriptionData = initialSubscription;
        }

        if (isMounted) {
          setIsPro(subscriptionData.type === 'pro');
          setAnalysisCredits(subscriptionData.analysisCredits || 3);
          setError(null);
        }
      } catch (error) {
        console.error('Error loading subscription:', error);
        if (isMounted) {
          setError('Failed to load subscription status');
          // Set default values on error
          setIsPro(false);
          setAnalysisCredits(3);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadSubscription();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const upgradeToPro = async () => {
    if (!user) {
      setError('Must be logged in to upgrade');
      return;
    }

    try {
      const proSubscription = {
        type: 'pro',
        analysisCredits: 100,
        updatedAt: new Date().toISOString(),
      };

      await createDocument('subscriptions', user.uid, proSubscription);
      setIsPro(true);
      setAnalysisCredits(100);
      setError(null);
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      setError('Failed to upgrade subscription');
      throw error; // Re-throw to be caught by error boundary
    }
  };

  // Don't render children until initial load is complete
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <SubscriptionContext.Provider 
      value={{ 
        isPro, 
        analysisCredits, 
        loading, 
        error,
        upgradeToPro 
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}; 