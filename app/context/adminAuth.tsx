'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { verifyAdminPassword } from '@/app/actions/auth';

interface AdminAuthContextType {
  isAuthenticated: boolean;
  isHydrated: boolean;
  password: string;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

/**
 * Proveedor de contexto de autenticación para el panel de administración.
 * Persiste la sesión en localStorage y valida la contraseña contra el servidor.
 */
export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    const savedAuth = localStorage.getItem('adminAuth');
    const savedPw = localStorage.getItem('adminPw');
    if (savedAuth === 'true' && savedPw) {
      setIsAuthenticated(true);
      setPassword(savedPw);
    }
    setIsHydrated(true);
  }, []);

  const login = async (pw: string): Promise<boolean> => {
    const valid = await verifyAdminPassword(pw);

    if (valid) {
      setIsAuthenticated(true);
      setPassword(pw);
      localStorage.setItem('adminAuth', 'true');
      localStorage.setItem('adminPw', pw);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setPassword('');
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminPw');
  };

  if (!isHydrated) {
    return (
      <AdminAuthContext.Provider value={{ isAuthenticated: false, isHydrated: false, password: '', login, logout }}>
        {children}
      </AdminAuthContext.Provider>
    );
  }

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, isHydrated, password, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

/**
 * Hook para acceder al contexto de autenticación del admin.
 * Debe usarse dentro de un AdminAuthProvider.
 */
export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}
