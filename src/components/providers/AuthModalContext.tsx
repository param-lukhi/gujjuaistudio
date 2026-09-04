'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import LoginRequiredModal from '@/components/LoginRequiredModal';

interface AuthModalContextType {
  isOpen: boolean;
  openModal: (redirectUrl?: string) => void;
  closeModal: () => void;
  requireAuth: (callback: () => void, redirectUrl?: string) => void;
  redirectUrl: string;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState('/dashboard');

  const openModal = (targetUrl: string = '/dashboard') => {
    setRedirectUrl(targetUrl);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const requireAuth = (callback: () => void, targetUrl: string = '/dashboard') => {
    if (session?.user) {
      callback();
    } else {
      openModal(targetUrl);
    }
  };

  return (
    <AuthModalContext.Provider value={{ isOpen, openModal, closeModal, requireAuth, redirectUrl }}>
      {children}
      <LoginRequiredModal isOpen={isOpen} onClose={closeModal} redirectUrl={redirectUrl} />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
}
