'use client';

import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { loginUser, registerUser, logoutUser } from '../firebase/firebaseUtils';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return {
    user: context.user,
    loading: context.loading,
    login: loginUser,
    register: registerUser,
    logout: logoutUser,
  };
}; 