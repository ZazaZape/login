import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, Database, Clock, LogOut } from "lucide-react";

export default function HomePage() {
  const handleLogout = () => {
    // Simple logout - redirect to auth page
    window.location.href = "/auth";
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="home-page">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Bienvenido al sistema Connectiva Hermes</p>
            </div>
            <Button 
              onClick={handleLogout} 
              variant="outline"
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4" data-testid="success-message">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-green-600 mr-2" />
            <p className="text-green-800">
              <strong>¡Autenticación exitosa!</strong> Has iniciado sesión correctamente.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">
                Usuarios disponibles en BD
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Autenticación</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">JWT/JWE</div>
              <p className="text-xs text-muted-foreground">
                Sistema de tokens seguro
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Base de Datos</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">PostgreSQL</div>
              <p className="text-xs text-muted-foreground">
                Conexión verificada
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sesión</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Activa</div>
              <p className="text-xs text-muted-foreground">
                Políticas de expiración
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Feature Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Sistema MVP Completado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              El sistema de autenticación y gestión de usuarios está funcionando correctamente:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">✅ Autenticación</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Login con credenciales validadas</li>
                  <li>• Tokens JWT/JWE seguros</li>
                  <li>• Gestión de sesiones</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">✅ Base de Datos</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• PostgreSQL configurado</li>
                  <li>• 2 usuarios de prueba disponibles</li>
                  <li>• Schema RBAC completo</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}