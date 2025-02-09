'use client';

import { AuthProvider } from '@/lib/contexts/AuthContext';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
} 