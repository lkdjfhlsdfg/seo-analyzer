'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import Image from 'next/image';
import LoadingSpinner from '@/components/LoadingSpinner';

type AnalysisHistory = {
  id: string;
  url: string;
  date: string;
  scores: {
    overall: number;
    technical: number;
    content: number;
    backlinks: number;
  };
};

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const fetchAnalysisHistory = async () => {
      if (!user) return;

      try {
        // Get analysis history from localStorage
        const history = JSON.parse(localStorage.getItem(`analysis_history_${user.id}`) || '[]');
        setAnalysisHistory(history);
      } catch (error) {
        console.error('Error fetching analysis history:', error);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchAnalysisHistory();
  }, [user]);

  if (loading || loadingHistory) {
    return (
      <div className="min-h-screen bg-[#F5F2EA] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F5F2EA] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p className="text-gray-600">You need to be signed in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F2EA] py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <div className="flex items-center space-x-4 mb-6">
              {user?.picture && (
                <Image
                  src={user.picture}
                  alt="Profile"
                  width={64}
                  height={64}
                  className="rounded-full"
                />
              )}
              <div>
                <h2 className="text-2xl font-bold">{user?.name}</h2>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Analysis History */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-xl font-semibold mb-6">Analysis History</h2>
            
            {analysisHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No analysis history found. Start analyzing websites to see your history here.
              </div>
            ) : (
              <div className="space-y-6">
                {analysisHistory.map((analysis) => (
                  <div key={analysis.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">{analysis.url}</h3>
                        <p className="text-sm text-gray-500">
                          Analyzed on {new Date(analysis.date).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => window.location.href = `/analyze?url=${encodeURIComponent(analysis.url)}`}
                        className="bg-[#F26B3A] text-white px-4 py-2 rounded-md hover:bg-[#E25A29] transition-colors"
                      >
                        Re-analyze
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-[#F5F2EA] p-4 rounded-lg">
                        <div className="text-sm font-medium text-gray-500">Overall Score</div>
                        <div className="text-2xl font-bold text-[#F26B3A]">{analysis.scores.overall}</div>
                      </div>
                      <div className="bg-[#F5F2EA] p-4 rounded-lg">
                        <div className="text-sm font-medium text-gray-500">Technical</div>
                        <div className="text-2xl font-bold text-[#F26B3A]">{analysis.scores.technical}</div>
                      </div>
                      <div className="bg-[#F5F2EA] p-4 rounded-lg">
                        <div className="text-sm font-medium text-gray-500">Content</div>
                        <div className="text-2xl font-bold text-[#F26B3A]">{analysis.scores.content}</div>
                      </div>
                      <div className="bg-[#F5F2EA] p-4 rounded-lg">
                        <div className="text-sm font-medium text-gray-500">Backlinks</div>
                        <div className="text-2xl font-bold text-[#F26B3A]">{analysis.scores.backlinks}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 