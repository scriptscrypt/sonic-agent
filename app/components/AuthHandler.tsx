'use client';

import { useAuthCallback } from '@/lib/hooks/useAuthCallback';
import { useEffect } from 'react';

export function AuthHandler() {
  // This component doesn't render anything, it just handles auth state
  useAuthCallback();
  
  return null;
} 