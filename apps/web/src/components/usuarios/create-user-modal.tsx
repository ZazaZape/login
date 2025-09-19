import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createUserSchema, CreateUserDto } from "@shared/index";
import { buildUsername } from "@/utils/username";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Eye, EyeOff, Shuffle, Loader2, CheckCircle, XCircle } from "lucide-react";

interface CreateUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UsernameCheckResponse {
  available: boolean;
}

export default function CreateUserModal({ open, onOpenChange }: CreateUserModalProps) {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [generatedUsername, setGeneratedUsername] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [activeRole, setActiveRole] = useState<number | undefined>();

  const form = useForm<CreateUserDto>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      document: "",
      secondLastName: "",
      password: "",
      roles: [],
      activeRole: 0,
      sessionPolicyId: 1,
      allowMultipleSessions: false,
      enabled: true,
    },
  });

  // Watch form fields for username generation
  const firstName = form.watch("firstName");
  const lastName = form.watch("lastName");
  const document = form.watch("document");

  // Generate username when fields change
  useEffect(() => {
    if (firstName && lastName && document) {
      const username = buildUsername(firstName, lastName, document);
      setGeneratedUsername(username);
      form.setValue("roles", selectedRoles);
      if (activeRole) {
        form.setValue("activeRole", activeRole);
      }
    } else {
      setGeneratedUsername("");
    }
  }, [firstName, lastName, document, selectedRoles, activeRole, form]);

  // Check username availability
  const { data: usernameCheck, isLoading: checkingUsername } = useQuery<UsernameCheckResponse>({
    queryKey: ["/usuarios/check-username", { u: generatedUsername }],
    enabled: !!generatedUsername && generatedUsername.length > 0,
    retry: false,
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: CreateUserDto) => {
      const res = await apiRequest("POST", "/usuarios", userData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Usuario creado exitosamente",
        description: "El usuario ha sido creado y está listo para usar.",
      });
      onOpenChange(false);
      form.reset();
      setSelectedRoles([]);
      setActiveRole(undefined);
      setGeneratedUsername("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error al crear usuario",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    form.setValue("password", password);
  };

  const handleRoleToggle = (roleId: number, checked: boolean) => {
    let newRoles: number[];
    
    if (checked) {
      if (selectedRoles.length >= 2) {
        toast({
          title: "Límite de roles alcanzado",
          description: "Solo se pueden asignar máximo 2 roles por usuario.",
          variant: "destructive",
        });
        return;
      }
      newRoles = [...selectedRoles, roleId];
    } else {
      newRoles = selectedRoles.filter(id => id !== roleId);
      // If we're removing the active role, clear it
      if (activeRole === roleId) {
        setActiveRole(undefined);
      }
    }
    
    setSelectedRoles(newRoles);
    form.setValue("roles", newRoles);
  };

  const handleActiveRoleChange = (roleId: number) => {
    if (!selectedRoles.includes(roleId)) {
      toast({
        title: "Error de validación",
        description: "El rol activo debe estar incluido en los roles asignados.",
        variant: "destructive",
      });
      return;
    }
    setActiveRole(roleId);
    form.setValue("activeRole", roleId);
  };

  const onSubmit = (data: CreateUserDto) => {
    if (!usernameCheck?.available) {
      toast({
        title: "Usuario no disponible",
        description: "El usuario generado ya existe. Modifica los datos para generar uno diferente.",
        variant: "destructive",
      });
      return;
    }

    if (selectedRoles.length === 0) {
      toast({
        title: "Error de validación",
        description: "Debe seleccionar al menos un rol.",
        variant: "destructive",
      });
      return;
    }

    if (!activeRole) {
      toast({
        title: "Error de validación",
        description: "Debe marcar un rol como activo.",
        variant: "destructive",
      });
      return;
    }

    createUserMutation.mutate({
      ...data,
      roles: selectedRoles,
      activeRole,
    });
  };

  const availableRoles = [
    { id: 1, name: "Administrador", description: "Control total del sistema" },
    { id: 2, name: "Supervisor", description: "Supervisión de operaciones" },
    { id: 3, name: "Usuario", description: "Acceso básico al sistema" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="create-user-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Crear Nuevo Usuario
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              data-testid="button-close-modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-2">
                Nombre(s) *
              </Label>
              <Input
                id="firstName"
                {...form.register("firstName")}
                placeholder="Juan Carlos"
                data-testid="input-firstName"
              />
              {form.formState.errors.firstName && (
                <p className="text-destructive text-sm mt-1" data-testid="error-firstName">
                  {form.formState.errors.firstName.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-2">
                Primer Apellido *
              </Label>
              <Input
                id="lastName"
                {...form.register("lastName")}
                placeholder="Sánchez"
                data-testid="input-lastName"
              />
              {form.formState.errors.lastName && (
                <p className="text-destructive text-sm mt-1" data-testid="error-lastName">
                  {form.formState.errors.lastName.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="document" className="block text-sm font-medium text-foreground mb-2">
                Documento de Identidad *
              </Label>
              <Input
                id="document"
                {...form.register("document")}
                placeholder="12345678"
                data-testid="input-document"
              />
              {form.formState.errors.document && (
                <p className="text-destructive text-sm mt-1" data-testid="error-document">
                  {form.formState.errors.document.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="secondLastName" className="block text-sm font-medium text-foreground mb-2">
                Segundo Apellido
              </Label>
              <Input
                id="secondLastName"
                {...form.register("secondLastName")}
                placeholder="López"
                data-testid="input-secondLastName"
              />
            </div>
          </div>

          {/* Generated Username */}
          <div>
            <Label className="block text-sm font-medium text-foreground mb-2">
              Usuario (Generado Automáticamente)
            </Label>
            <div className="relative">
              <Input
                value={generatedUsername}
                readOnly
                className="bg-muted cursor-not-allowed pr-10"
                placeholder="jsanchez4321 (se genera automáticamente)"
                data-testid="input-generated-username"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {checkingUsername && generatedUsername ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : usernameCheck?.available ? (
                  <CheckCircle className="h-4 w-4 text-chart-2" />
                ) : generatedUsername && usernameCheck?.available === false ? (
                  <XCircle className="h-4 w-4 text-destructive" />
                ) : null}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Formato: primera letra del nombre + primer apellido + últimos 4 dígitos del documento
            </p>
            {generatedUsername && usernameCheck?.available === false && (
              <p className="text-destructive text-sm mt-2" data-testid="error-username-unavailable">
                El usuario ya existe. Modifica los datos para generar uno diferente.
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
              Contraseña Temporal *
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                {...form.register("password")}
                placeholder="Contraseña temporal"
                className="pr-20"
                data-testid="input-password"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={generatePassword}
                  className="text-muted-foreground hover:text-foreground text-xs h-6 w-6 p-0"
                  title="Generar contraseña"
                  data-testid="button-generate-password"
                >
                  <Shuffle className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-foreground h-6 w-6 p-0"
                  data-testid="button-toggle-password"
                >
                  {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
              </div>
            </div>
            {form.formState.errors.password && (
              <p className="text-destructive text-sm mt-1" data-testid="error-password">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          {/* Role Assignment */}
          <div>
            <Label className="block text-sm font-medium text-foreground mb-2">
              Asignación de Roles (Máximo 2, 1 debe estar activo) *
            </Label>
            <div className="space-y-3">
              {availableRoles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-center justify-between p-3 border border-border rounded-md"
                >
                  <div className="flex items-center">
                    <Checkbox
                      id={`role_${role.id}`}
                      checked={selectedRoles.includes(role.id)}
                      onCheckedChange={(checked) => handleRoleToggle(role.id, checked as boolean)}
                      data-testid={`checkbox-role-${role.id}`}
                    />
                    <Label htmlFor={`role_${role.id}`} className="ml-3 cursor-pointer">
                      <div className="text-sm font-medium text-foreground">{role.name}</div>
                      <div className="text-xs text-muted-foreground">{role.description}</div>
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="activeRole"
                      id={`active_role_${role.id}`}
                      checked={activeRole === role.id}
                      onChange={() => handleActiveRoleChange(role.id)}
                      disabled={!selectedRoles.includes(role.id)}
                      className="w-4 h-4 text-primary focus:ring-ring border-border"
                      data-testid={`radio-active-role-${role.id}`}
                    />
                    <Label htmlFor={`active_role_${role.id}`} className="ml-2 text-xs text-muted-foreground cursor-pointer">
                      Activo
                    </Label>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Selecciona hasta 2 roles y marca uno como activo
            </p>
          </div>

          {/* Session Policy */}
          <div>
            <Label htmlFor="sessionPolicy" className="block text-sm font-medium text-foreground mb-2">
              Política de Sesión
            </Label>
            <Select
              value={form.watch("sessionPolicyId").toString()}
              onValueChange={(value) => form.setValue("sessionPolicyId", parseInt(value))}
            >
              <SelectTrigger data-testid="select-session-policy">
                <SelectValue placeholder="Selecciona una política" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Estándar (15min inactividad, 8hrs absoluta)</SelectItem>
                <SelectItem value="2">Extendida (30min inactividad, 24hrs absoluta)</SelectItem>
                <SelectItem value="3">Restringida (5min inactividad, 2hrs absoluta)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Additional Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center">
              <Checkbox
                id="allowMultipleSessions"
                checked={form.watch("allowMultipleSessions")}
                onCheckedChange={(checked) => form.setValue("allowMultipleSessions", checked as boolean)}
                data-testid="checkbox-multiple-sessions"
              />
              <Label htmlFor="allowMultipleSessions" className="ml-2 text-sm text-foreground cursor-pointer">
                Permitir sesiones múltiples
              </Label>
            </div>

            <div className="flex items-center">
              <Checkbox
                id="enabled"
                checked={form.watch("enabled")}
                onCheckedChange={(checked) => form.setValue("enabled", checked as boolean)}
                data-testid="checkbox-enabled"
              />
              <Label htmlFor="enabled" className="ml-2 text-sm text-foreground cursor-pointer">
                Usuario habilitado
              </Label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createUserMutation.isPending || !usernameCheck?.available}
              data-testid="button-create-user"
            >
              {createUserMutation.isPending ? (
                <span className="flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creando...
                </span>
              ) : (
                "Crear Usuario"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
