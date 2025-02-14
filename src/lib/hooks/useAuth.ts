'use client';

export function useAuth() {
  // Return a simple guest user state
  return {
    user: { isGuest: true },
  };
} 