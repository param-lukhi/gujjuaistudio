'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { ToastProvider } from './ToastProvider';
import { AuthModalProvider } from './AuthModalContext';

export default function NextAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AuthModalProvider>
        <ToastProvider>{children}</ToastProvider>
      </AuthModalProvider>
    </SessionProvider>
  );
}

