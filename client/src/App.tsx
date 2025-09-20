import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./hooks/use-auth";
import AuthPage from "./pages/auth-page";
import HomePage from "./pages/home-page";
import UsuariosPage from "./pages/usuarios-page";
import NotFound from "./pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={AuthPage} />
      <Route path="/usuarios" component={UsuariosPage} />
      <Route path="/" component={HomePage} />
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
