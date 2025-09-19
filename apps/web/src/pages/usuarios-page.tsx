import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import CreateUserModal from "@/components/usuarios/create-user-modal";
import { Plus, Search, Edit, Clock, SearchSlash, UserCheck, ChevronLeft, ChevronRight } from "lucide-react";

export default function UsuariosPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // This would be connected to actual API in production
  const { data: users, isLoading } = useQuery({
    queryKey: ["/usuarios", { search: searchQuery, role: roleFilter, status: statusFilter }],
    queryFn: () => {
      // Return empty array for now - would call actual API
      return [];
    },
    enabled: false, // Disabled for now since we don't have users API endpoint
  });

  return (
    <DashboardLayout>
      <div className="p-6" data-testid="usuarios-page">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestión de Usuarios</h1>
            <p className="text-muted-foreground">Administra usuarios, roles y permisos del sistema</p>
          </div>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center"
            data-testid="button-create-user"
          >
            <Plus className="mr-2 h-4 w-4" />
            Crear Usuario
          </Button>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                type="text"
                placeholder="Buscar por usuario, nombre o documento..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48" data-testid="select-role-filter">
                <SelectValue placeholder="Todos los roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los roles</SelectItem>
                <SelectItem value="1">Administrador</SelectItem>
                <SelectItem value="2">Supervisor</SelectItem>
                <SelectItem value="3">Usuario</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48" data-testid="select-status-filter">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los estados</SelectItem>
                <SelectItem value="true">Habilitado</SelectItem>
                <SelectItem value="false">Deshabilitado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6 py-3">Usuario</TableHead>
                    <TableHead className="px-6 py-3">Datos Personales</TableHead>
                    <TableHead className="px-6 py-3">Rol Activo</TableHead>
                    <TableHead className="px-6 py-3">Estado</TableHead>
                    <TableHead className="px-6 py-3">Última Sesión</TableHead>
                    <TableHead className="px-6 py-3 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    // Loading skeletons
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center">
                            <Skeleton className="w-8 h-8 rounded-full mr-3" />
                            <div>
                              <Skeleton className="h-4 w-24 mb-1" />
                              <Skeleton className="h-3 w-16" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-4 w-32 mb-1" />
                          <Skeleton className="h-3 w-20" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-6 w-20 rounded-full" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-6 w-16 rounded-full" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex justify-end space-x-2">
                            <Skeleton className="h-8 w-8 rounded" />
                            <Skeleton className="h-8 w-8 rounded" />
                            <Skeleton className="h-8 w-8 rounded" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : !users || users.length === 0 ? (
                    // Empty state
                    <TableRow>
                      <TableCell colSpan={6} className="px-6 py-12 text-center">
                        <div className="text-muted-foreground">
                          <p className="text-lg font-medium mb-2">No hay usuarios disponibles</p>
                          <p className="text-sm">
                            {searchQuery || roleFilter || statusFilter 
                              ? "No se encontraron usuarios que coincidan con los filtros aplicados."
                              : "Comienza creando el primer usuario del sistema."
                            }
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    // Actual user rows would go here
                    users.map((user: any) => (
                      <TableRow key={user.usuario_id} className="hover:bg-accent/50 transition-colors">
                        <TableCell className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                              <span className="text-primary-foreground text-sm font-medium">
                                {user.usuario.substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-foreground">{user.usuario}</div>
                              <div className="text-sm text-muted-foreground">ID: {user.usuario_id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-foreground">{user.nombre_completo || "Sin datos"}</div>
                          <div className="text-sm text-muted-foreground">Doc: {user.documento || "N/A"}</div>
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                            {user.rol_activo?.descripcion || "Sin rol"}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            user.usuario_habilitado 
                              ? "bg-chart-2/10 text-chart-2" 
                              : "bg-destructive/10 text-destructive"
                          }`}>
                            {user.usuario_habilitado ? (
                              <>
                                <UserCheck className="mr-1 h-3 w-3" />
                                Activo
                              </>
                            ) : (
                              <>
                                <SearchSlash className="mr-1 h-3 w-3" />
                                Inactivo
                              </>
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {user.ultima_sesion || "Nunca"}
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary hover:text-primary/80"
                              data-testid={`button-edit-${user.usuario_id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-foreground"
                              data-testid={`button-sessions-${user.usuario_id}`}
                            >
                              <Clock className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={user.usuario_habilitado 
                                ? "text-destructive hover:text-destructive/80" 
                                : "text-chart-2 hover:text-chart-2/80"
                              }
                              data-testid={`button-toggle-status-${user.usuario_id}`}
                            >
                              {user.usuario_habilitado ? (
                                <SearchSlash className="h-4 w-4" />
                              ) : (
                                <UserCheck className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            {users && users.length > 0 && (
              <div className="px-6 py-3 border-t border-border flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Mostrando <span className="font-medium text-foreground">1</span> a{" "}
                  <span className="font-medium text-foreground">{users.length}</span> de{" "}
                  <span className="font-medium text-foreground">{users.length}</span> resultados
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" disabled data-testid="button-prev-page">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
                    1
                  </Button>
                  <Button variant="outline" size="sm" disabled data-testid="button-next-page">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create User Modal */}
      <CreateUserModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal}
      />
    </DashboardLayout>
  );
}
