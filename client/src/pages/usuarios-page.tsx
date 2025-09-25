import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import DashboardLayout from "../components/layout/dashboard-layout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Search, Plus, Edit, Lock, MoreHorizontal, Users } from "lucide-react";
import CreateUserModal from "../components/usuarios/create-user-modal";
import { apiRequest } from "../lib/queryClient";

interface Role {
  rol_id: number;
  descripcion: string;
}

interface User {
  usuario_id: number;
  usuario: string;
  individuo?: string;
  usuario_habilitado: boolean;
  politica_sesion_id?: number;
  roles: Role[];
}

interface ApiResponse {
  ok: boolean;
  data: User[];
  message?: string;
}

export default function UsuariosPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  // Query to fetch users
  const { data: response, isLoading, error } = useQuery<ApiResponse>({
    queryKey: ["/api/usuarios"],
    enabled: true, // Enabled - backend endpoint is ready
  });

  const users = response?.data || [];

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase().trim();
    return users.filter((user: User) => 
      user.usuario.toLowerCase().includes(query) ||
      user.roles.some(role => role.descripcion.toLowerCase().includes(query))
    );
  }, [users, searchQuery]);

  // Mutation to toggle user status
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ userId, enabled }: { userId: number; enabled: boolean }) => {
      return apiRequest(`/api/usuarios/${userId}/toggle-status`, {
        method: "PUT",
        body: JSON.stringify({ enabled }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: () => {
      // Invalidate and refetch users
      queryClient.invalidateQueries({ queryKey: ["/api/usuarios"] });
    },
    onError: (error) => {
      console.error("Error updating user status:", error);
    },
  });

  const handleStatusToggle = (userId: number, newStatus: boolean) => {
    toggleStatusMutation.mutate({ userId, enabled: newStatus });
  };

  return (
    <DashboardLayout>
      <div className="p-6" data-testid="usuarios-page">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Gestión de Usuarios</h1>
              <p className="text-muted-foreground">Administrar usuarios del sistema y sus permisos</p>
            </div>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
              data-testid="button-create-user"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Usuario
            </Button>
          </div>
        </div>

        {/* Users System Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <CardTitle>Usuarios del Sistema</CardTitle>
              </div>
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar por usuario, email o rol..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
            </div>
            <CardDescription>
              Lista de todos los usuarios registrados en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>

            {isLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Cargando usuarios...</p>
              </div>
            )}
            
            {error && (
              <div className="text-center py-8">
                <p className="text-red-600 mb-2">Error al cargar usuarios</p>
                <p className="text-sm text-muted-foreground">{error.message}</p>
              </div>
            )}
            
            {!isLoading && !error && (!response || !response.ok) && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay datos disponibles</p>
              </div>
            )}
            
            {!isLoading && !error && response && response.ok && filteredUsers.length === 0 && users.length > 0 && (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No se encontraron usuarios que coincidan con la búsqueda</p>
              </div>
            )}
            
            {!isLoading && !error && response && response.ok && users.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay usuarios registrados</p>
              </div>
            )}
            
            {!isLoading && !error && response && response.ok && filteredUsers.length > 0 && (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>OTP</TableHead>
                      <TableHead>Fecha Creación</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user: User) => (
                      <TableRow key={user.usuario_id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.usuario}</div>
                            {user.individuo && (
                              <div className="text-sm text-muted-foreground">ID: {user.individuo}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {user.roles && user.roles.length > 0 
                              ? user.roles.map(role => role.descripcion).join(", ")
                              : "Sin rol asignado"
                            }
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={user.usuario_habilitado}
                              onCheckedChange={(checked) => handleStatusToggle(user.usuario_id, checked)}
                              disabled={toggleStatusMutation.isPending}
                              data-testid={`switch-status-${user.usuario_id}`}
                            />
                            <span className="text-sm text-muted-foreground">
                              {user.usuario_habilitado ? "Activo" : "Inactivo"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className=""
                          >
                            Pendiente
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            No disponible
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="Editar usuario"
                              data-testid={`button-edit-${user.usuario_id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-8 w-8 p-0"
                              title={user.usuario_habilitado ? "Bloquear usuario" : "Desbloquear usuario"}
                              data-testid={`button-toggle-${user.usuario_id}`}
                            >
                              <Lock className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="Más opciones"
                              data-testid={`button-more-${user.usuario_id}`}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

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