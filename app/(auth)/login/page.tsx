'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  const { user, isAllowed, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && isAllowed) {
      router.push('/countries');
    }
  }, [user, isAllowed, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return <LoginForm />;
}
