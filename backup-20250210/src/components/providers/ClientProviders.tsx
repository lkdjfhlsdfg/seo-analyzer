'use client';

import { AuthProvider } from '@/lib/contexts/AuthContext';
import { SubscriptionProvider } from '@/lib/contexts/SubscriptionContext';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        {children}
      </SubscriptionProvider>
    </AuthProvider>
  );
} 