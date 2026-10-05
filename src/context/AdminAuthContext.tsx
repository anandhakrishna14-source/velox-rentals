import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdminAuthContextType {
  isAdmin: boolean;
  showLoginModal: boolean;
  pendingActionName: string | null;
  openLoginModal: (actionName?: string, onSuccess?: () => void) => void;
  closeLoginModal: () => void;
  login: (passcode: string) => boolean;
  logout: () => void;
  requireAdmin: (onSuccess: () => void, actionName?: string) => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const ADMIN_STORAGE_KEY = 'velox_admin_session_auth';
const VALID_PASSWORDS = ['admin123', 'admin', 'velox2025', '1234'];

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem(ADMIN_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [pendingActionName, setPendingActionName] = useState<string | null>(null);
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);

  const openLoginModal = (actionName?: string, onSuccess?: () => void) => {
    setPendingActionName(actionName || null);
    if (onSuccess) {
      setPendingCallback(() => onSuccess);
    }
    setShowLoginModal(true);
  };

  const closeLoginModal = () => {
    setShowLoginModal(false);
    setPendingActionName(null);
    setPendingCallback(null);
  };

  const login = (passcode: string): boolean => {
    const trimmed = passcode.trim().toLowerCase();
    const isMatch = VALID_PASSWORDS.includes(trimmed);
    if (isMatch) {
      setIsAdmin(true);
      try {
        localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
      } catch {}

      setShowLoginModal(false);
      
      // Execute any pending action that requested admin auth
      if (pendingCallback) {
        setTimeout(() => {
          pendingCallback();
          setPendingCallback(null);
          setPendingActionName(null);
        }, 100);
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    try {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    } catch {}
    setPendingCallback(null);
    setPendingActionName(null);
  };

  const requireAdmin = (onSuccess: () => void, actionName?: string) => {
    if (isAdmin) {
      onSuccess();
    } else {
      openLoginModal(actionName, onSuccess);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAdmin,
        showLoginModal,
        pendingActionName,
        openLoginModal,
        closeLoginModal,
        login,
        logout,
        requireAdmin
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): AdminAuthContextType => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
