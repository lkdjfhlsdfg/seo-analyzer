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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      <div className="relative">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="backdrop-blur-xl bg-white/70 rounded-3xl shadow-xl border border-white/20">
            <AnalysisForm />
          </div>
        </main>
      </div>
    </div>
  );
} 