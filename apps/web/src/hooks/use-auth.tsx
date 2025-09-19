import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { LoginDto, AuthResponse } from "@shared/index";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "./use-toast";

type AuthContextType = {
  user: AuthResponse["user"] | null;
  isLoading: boolean;
  error: Error | null;
  authData: AuthResponse | null;
  loginMutation: UseMutationResult<AuthResponse, Error, LoginDto>;
  logoutMutation: UseMutationResult<void, Error, void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    data: authData,
    error,
    isLoading,
  } = useQuery<AuthResponse | null>({
    queryKey: ["/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: (failureCount, error: any) => {
      // Don't retry on 401
      if (error?.message?.includes("401")) return false;
      return failureCount < 2;
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginDto) => {
      const res = await apiRequest("POST", "/auth/login", credentials);
      const result = await res.json();
      return result.data;
    },
    onSuccess: (authResponse: AuthResponse) => {
      queryClient.setQueryData(["/auth/me"], authResponse);
      
      // Navigate to default module or dashboard
      const defaultPath = authResponse.defaultModule?.path || "/";
      navigate(defaultPath, { replace: true });
      
      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido, ${authResponse.user.usuario}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error de autenticación",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/auth/me"], null);
      queryClient.clear();
      navigate("/auth", { replace: true });
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente",
      });
    },
    onError: (error: Error) => {
      // Even if logout fails on server, clear client state
      queryClient.setQueryData(["/auth/me"], null);
      queryClient.clear();
      navigate("/auth", { replace: true });
      
      toast({
        title: "Sesión cerrada",
        description: "Tu sesión ha sido cerrada",
      });
    },
  });

  // Set up automatic token refresh
  const refreshMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/auth/refresh");
      const result = await res.json();
      return result.data;
    },
    onSuccess: (authResponse: AuthResponse) => {
      queryClient.setQueryData(["/auth/me"], authResponse);
    },
    onError: () => {
      // If refresh fails, user needs to login again
      queryClient.setQueryData(["/auth/me"], null);
      navigate("/auth", { replace: true });
    },
  });

  // Handle 401 responses globally
  queryClient.getMutationCache().config.onError = (error: any) => {
    if (error?.message?.includes("401") && !error?.message?.includes("Token de refresco")) {
      // Try to refresh token
      refreshMutation.mutate();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: authData?.user || null,
        authData: authData || null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
