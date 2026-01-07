'use client';

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 用 Hook 安全管理 token（僅在瀏覽器環境執行）
export function useAuthToken() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // 初始取得 session
    const initToken = async () => {
      if (typeof window !== 'undefined') {
        const { data } = await supabase.auth.getSession();
        if (data.session?.access_token) {
          setToken(data.session.access_token);
          localStorage.setItem('sb-access-token', data.session.access_token);
        }
      }
    };

    initToken();

    // 監聽 auth 狀態變化
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (typeof window !== 'undefined') {
          if (session?.access_token) {
            setToken(session.access_token);
            localStorage.setItem('sb-access-token', session.access_token);
          } else {
            setToken(null);
            localStorage.removeItem('sb-access-token');
          }
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return token;
}

// 安全取得 token 的函數（SSR 時返回 null）
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('sb-access-token');
}

// 登入函數
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (!error && data.session?.access_token && typeof window !== 'undefined') {
    localStorage.setItem('sb-access-token', data.session.access_token);
  }
  
  return { data, error };
}

// 登出函數
export async function signOut() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('sb-access-token');
  }
  const { error } = await supabase.auth.signOut();
  return { error };
}

// Axios instance
import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios interceptor: 自動加入 Authorization Header
api.interceptors.request.use(
  async (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper functions for API requests
export async function apiGet<T>(url: string): Promise<T> {
  const response = await api.get<T>(url);
  return response.data;
}

export async function apiPost<T>(url: string, data?: unknown): Promise<T> {
  const response = await api.post<T>(url, data);
  return response.data;
}

export async function apiPut<T>(url: string, data?: unknown): Promise<T> {
  const response = await api.put<T>(url, data);
  return response.data;
}

export async function apiDelete<T>(url: string): Promise<T> {
  const response = await api.delete<T>(url);
  return response.data;
}
