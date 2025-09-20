import React from "react";
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./hooks/use-auth";
import ProtectedRoute from "./lib/protected-route";
import AuthPage from "./pages/auth-page";
import HomePage from "./pages/home-page";
import UsuariosPage from "./pages/usuarios-page";
import NotFound from "./pages/not-found";

function AuthenticatedRoute({ component: Component }: { component: React.ComponentType }) {
  const { authData } = useAuth();
  
  // If authenticated, redirect to login instead of staying on auth page
  if (authData) {
    return <Redirect to="/" replace />;
  }
  
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login">
        <AuthenticatedRoute component={AuthPage} />
      </Route>
      <Route path="/usuarios">
        <ProtectedRoute>
          <UsuariosPage />
        </ProtectedRoute>
      </Route>
      <Route path="/">
        <ProtectedRoute>
          <HomePage />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
