import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginDto } from "@shared/index";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, Network, Shield, Users, Database, Clock, Loader2 } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginDto>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      usuario: "",
      password: "",
    },
  });

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = (data: LoginDto) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-full flex" data-testid="auth-page">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary/80 relative overflow-hidden">
        {/* Abstract geometric background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-white/15 rounded-full blur-lg"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-16 py-12">
          <div className="max-w-md">
            <div className="mb-8">
              <Network className="w-16 h-16 text-primary-foreground mb-4" />
              <h1 className="text-4xl font-bold text-primary-foreground mb-4">
                Connectiva Hermes
              </h1>
              <p className="text-xl text-primary-foreground/80">
                Sistema Empresarial de Gestión
              </p>
            </div>
            
            <div className="space-y-6 text-primary-foreground/70">
              <div className="flex items-center space-x-3">
                <Shield className="w-8 h-8" />
                <span>Autenticación segura con JWT/JWE</span>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="w-8 h-8" />
                <span>Control de acceso basado en roles</span>
              </div>
              <div className="flex items-center space-x-3">
                <Database className="w-8 h-8" />
                <span>Gestión integral de usuarios</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-8 h-8" />
                <span>Sesiones con políticas de expiración</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-8">
            <div className="lg:hidden mb-6">
              <Network className="w-12 h-12 text-primary mb-3" />
              <h1 className="text-2xl font-bold text-foreground">Connectiva Hermes</h1>
            </div>
            <h2 className="text-3xl font-bold text-foreground">Iniciar Sesión</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Ingresa tus credenciales para acceder al sistema
            </p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="usuario" className="block text-sm font-medium text-foreground mb-2">
                Usuario
              </Label>
              <Input
                id="usuario"
                type="text"
                placeholder="Ingresa tu usuario"
                {...form.register("usuario")}
                className="w-full"
                data-testid="input-usuario"
              />
              {form.formState.errors.usuario && (
                <div className="text-destructive text-sm mt-1" data-testid="error-usuario">
                  {form.formState.errors.usuario.message}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingresa tu contraseña"
                  {...form.register("password")}
                  className="w-full pr-10"
                  data-testid="input-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  data-testid="button-toggle-password"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                  )}
                </button>
              </div>
              {form.formState.errors.password && (
                <div className="text-destructive text-sm mt-1" data-testid="error-password">
                  {form.formState.errors.password.message}
                </div>
              )}
            </div>

            {/* Error message display */}
            {loginMutation.error && (
              <Card className="bg-destructive/10 border-destructive/20 p-4" data-testid="login-error">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 text-destructive mr-2" />
                  <span className="text-destructive text-sm">
                    {loginMutation.error.message}
                  </span>
                </div>
              </Card>
            )}

            <div>
              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                {loginMutation.isPending ? (
                  <span className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Iniciando sesión...
                  </span>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              © 2024 Connectiva Hermes. Sistema seguro con autenticación JWT/JWE.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
