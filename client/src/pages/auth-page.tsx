import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Network } from "lucide-react";

export default function AuthPage() {
  const [credentials, setCredentials] = useState({
    usuario: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok && data.ok) {
        // Store the access token
        if (data.data.accessToken) {
          localStorage.setItem("accessToken", data.data.accessToken);
        }

        // Store user data
        if (data.data.user) {
          localStorage.setItem("user", JSON.stringify(data.data.user));
        }

        // Redirect to homepage on success
        window.location.href = "/";
      } else {
        setError(data.message || "Error de autenticación");
      }
    } catch (error) {
      setError("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setCredentials((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100"
      data-testid="auth-page"
    >
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            <Network className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Connectiva Hermes
          </CardTitle>
          <p className="text-gray-600">Sistema de Autenticación</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="usuario">Usuario</Label>
              <Input
                id="usuario"
                type="text"
                value={credentials.usuario}
                onChange={(e) => handleChange("usuario", e.target.value)}
                placeholder="Ingrese su usuario"
                data-testid="input-username"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="Ingrese su contraseña"
                data-testid="input-password"
                required
              />
            </div>

            {error && (
              <div
                className="text-red-600 text-sm bg-red-50 p-2 rounded"
                data-testid="error-message"
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              data-testid="button-login"
            >
              {isLoading ? "Autenticando..." : "Iniciar Sesión"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
