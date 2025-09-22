import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, Database, Clock } from "lucide-react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";

export default function HomePage() {
  const { authData } = useAuth();
  
  return (
    <DashboardLayout>
      <div className="p-6" data-testid="home-page">
        {/* Welcome Message */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            ¡Bienvenido, {authData?.user?.usuario}!
          </h1>
          <p className="text-muted-foreground">
            Sistema Connectiva Hermes - {authData?.user?.rol_activo?.descripcion}
          </p>
        </div>
        {/* Success Message */}
        <div className="mb-6 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4" data-testid="success-message">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
            <p className="text-green-800 dark:text-green-200">
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
      </div>
    </DashboardLayout>
  );
}