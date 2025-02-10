'use client';

import Navigation from '@/components/Navigation';
import AnalysisForm from '@/components/AnalysisForm';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AppPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Optional: Redirect to welcome page if not logged in
    // if (!user) {
    //   router.push('/');
    // }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-white">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]" />
      
      <div className="relative">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="rounded-lg border border-black/10 bg-white p-8">
            <AnalysisForm />
          </div>
        </main>
      </div>
    </div>
  );
} 