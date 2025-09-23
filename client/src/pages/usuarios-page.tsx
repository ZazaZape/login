import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "../components/layout/dashboard-layout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import CreateUserModal from "../components/usuarios/create-user-modal";

export default function UsuariosPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  // Query to fetch users
  const { data: response, isLoading, error } = useQuery({
    queryKey: ["/api/usuarios"],
    enabled: true, // Enabled - backend endpoint is ready
  });

  const users = response?.data || [];

  return (
    <DashboardLayout>
      <div className="p-6" data-testid="usuarios-page">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Usuarios</h1>
          <p className="text-muted-foreground">Gestión de usuarios del sistema</p>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <Input
            type="text"
            placeholder="Buscar usuarios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
            data-testid="input-search"
          />
          <Button 
            onClick={() => setShowCreateModal(true)}
            data-testid="button-create-user"
          >
            Crear Usuario
          </Button>
        </div>

        <div className="rounded-md border">
          <div className="p-4">
            {isLoading && <p>Cargando usuarios...</p>}
            {error && (
              <p className="text-center py-8 text-red-600">
                Error: {error.message || "Error al cargar usuarios"}
              </p>
            )}
            {!isLoading && !error && (!response || !response.ok) && (
              <p className="text-center py-8">No hay datos disponibles</p>
            )}
            {!isLoading && !error && response && response.ok && users.length === 0 && (
              <p className="text-center py-8">No hay usuarios registrados</p>
            )}
            {!isLoading && !error && response && response.ok && users.length > 0 && (
              <div className="space-y-4">
                {users.map((user: any) => (
                  <div key={user.usuario_id} className="border rounded p-4">
                    <div className="font-semibold">{user.usuario}</div>
                    <div className="text-sm text-gray-600">
                      ID: {user.usuario_id} | 
                      Estado: {user.usuario_habilitado ? "Activo" : "Inactivo"}
                    </div>
                    {user.roles && user.roles.length > 0 && (
                      <div className="text-sm mt-2">
                        Roles: {user.roles.map((r: any) => r.descripcion).join(", ")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <CreateUserModal 
          open={showCreateModal} 
          onOpenChange={(open) => {
            setShowCreateModal(open);
            if (!open) {
              // Invalidate users query to refresh list after creation
              queryClient.invalidateQueries({ queryKey: ["/api/usuarios"] });
            }
          }} 
        />
      </div>
    </DashboardLayout>
  );
}