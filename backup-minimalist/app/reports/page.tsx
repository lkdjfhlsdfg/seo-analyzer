'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useSubscription } from '@/lib/contexts/SubscriptionContext';
import Navigation from '@/components/Navigation';

export default function ReportsPage() {
  const { user } = useAuth();
  const { isPro } = useSubscription();
  const router = useRouter();

  useEffect(() => {
    // Redirect to welcome page if not logged in or not pro
    if (!user || !isPro) {
      router.push('/');
    }
  }, [user, isPro, router]);

  if (!user || !isPro) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--starlight-light)] to-[var(--cell-green)]">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-[var(--coniferous-green)] mb-6">
            Your Analysis Reports
          </h1>
          <p className="text-gray-600">
            View and manage your saved analysis reports here.
          </p>
          {/* Add report list component here */}
        </div>
      </main>
    </div>
  );
} 