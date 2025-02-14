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
      
      <div className="relative min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center">
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="rounded-lg border border-black bg-white p-8">
              <AnalysisForm />
            </div>
          </div>
        </main>
        <footer className="border-t border-black bg-white">
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="flex items-center justify-between">
              <div className="text-sm font-light text-black/70">
                © 2024 SEO Analyzer. All rights reserved.
              </div>
              <div className="flex items-center gap-6">
                <a href="#" className="text-sm font-light text-black/70 hover:text-black transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-sm font-light text-black/70 hover:text-black transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="text-sm font-light text-black/70 hover:text-black transition-colors">
                  Contact
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
} 