import React, { createContext, useContext } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';

interface User {
  usuario_id: number;
  usuario: string;
  individuo?: string;
  nombre_completo?: string;
  usuario_habilitado: boolean;
  rol_activo: {
    rol_id: number;
    descripcion: string;
  };
}

interface Module {
  modulo_id: number;
  label: string;
  path: string;
  icon: string;
  isDefault: boolean;
  permisos: Permission[];
  children?: Module[];
}

interface Permission {
  permiso_id: number;
  descripcion: string;
  habilitado: boolean;
}

interface AuthData {
  accessToken: string;
  user: User;
  roleId: number;
  defaultModule: Module;
  menu: Module[];
}

interface AuthContextType {
  authData: AuthData | null;
  isLoading: boolean;
  error: Error | null;
  logoutMutation: {
    mutate: () => void;
    isPending: boolean;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();

  // Get auth data from localStorage
  const { data: authData, isLoading, error } = useQuery({
    queryKey: ['auth'],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      const user = localStorage.getItem('user');
      
      if (!token || !user) {
        return null;
      }

      try {
        // Verify token with backend if needed
        const response = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          // Token is invalid, clear storage
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          return null;
        }

        const userData = await response.json();
        return {
          accessToken: token,
          user: userData.user,
          roleId: userData.roleId,
          defaultModule: userData.defaultModule,
          menu: userData.menu || [],
        } as AuthData;
      } catch (error) {
        console.warn('Auth verification failed:', error);
        return null;
      }
    },
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('accessToken');
      
      if (token) {
        try {
          // Call logout API to revoke server-side session
          await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
        } catch (error) {
          console.warn('Logout API call failed:', error);
        }
      }
    },
    onSuccess: () => {
      // Clear client-side storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      
      // Clear React Query cache
      queryClient.clear();
      
      // Redirect to login page
      setLocation('/login');
    },
    onError: () => {
      // Even if logout fails on server, clear client state
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      
      // Clear React Query cache
      queryClient.clear();
      
      // Redirect to login page
      setLocation('/login');
    },
  });

  const value: AuthContextType = {
    authData,
    isLoading,
    error,
    logoutMutation,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}