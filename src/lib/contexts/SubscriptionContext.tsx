'use client';

import { createContext, useContext, useEffect, useState } from 'react';

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
  const [isPro, setIsPro] = useState(false);
  const [analysisCredits, setAnalysisCredits] = useState(3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load subscription data from localStorage
    const loadSubscription = () => {
      try {
        const savedData = localStorage.getItem('subscription');
        if (savedData) {
          const { isPro: savedIsPro, analysisCredits: savedCredits } = JSON.parse(savedData);
          setIsPro(savedIsPro);
          setAnalysisCredits(savedCredits);
        }
      } catch (error) {
        console.error('Error loading subscription from localStorage:', error);
        setError('Failed to load subscription status');
      } finally {
        setLoading(false);
      }
    };

    loadSubscription();
  }, []);

  const upgradeToPro = async () => {
    try {
      const proSubscription = {
        isPro: true,
        analysisCredits: 100,
      };

      localStorage.setItem('subscription', JSON.stringify(proSubscription));
      setIsPro(true);
      setAnalysisCredits(100);
      setError(null);
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      setError('Failed to upgrade subscription');
      throw error;
    }
  };

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