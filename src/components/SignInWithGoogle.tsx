"use client";

import { useAuth } from '@/lib/contexts/AuthContext';
import Image from 'next/image';

export default function SignInWithGoogle() {
  const { signInWithGoogle } = useAuth();

  return (
    <button
      onClick={signInWithGoogle}
      className="flex items-center space-x-2 bg-white text-gray-600 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
    >
      <Image
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        alt="Google logo"
        width={24}
        height={24}
        className="mr-2"
      />
      <span>Sign in with Google</span>
    </button>
  );
}
