'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function SupabaseProvider({ children }) {
  useEffect(() => {
    // 監聽認證狀態變化
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed in provider:', event);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return children;
}