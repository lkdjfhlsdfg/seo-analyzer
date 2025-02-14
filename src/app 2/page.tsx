import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the WelcomePage component
const WelcomePage = dynamic(() => import('@/components/WelcomePage'), {
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  ),
  ssr: true
});

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      }>
        <WelcomePage />
      </Suspense>
    </main>
  );
} 