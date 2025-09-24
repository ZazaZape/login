import React, { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../../hooks/use-auth";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Moon, Sun, Shield, User, ChevronDown, LogOut } from "lucide-react";

export default function Topbar() {
  const { authData, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [isDark, setIsDark] = useState(false);

  const getCurrentPageTitle = () => {
    const path = location;
    if (path === "/") return "Dashboard";
    if (path === "/usuarios") return "Gestión de Usuarios";
    
    // Find matching menu item
    const menuItem = authData?.menu?.find(item => item.path === path);
    return menuItem?.label || "Página";
  };

  const getBreadcrumbs = () => {
    const path = location;
    if (path === "/") return null;
    
    return (
      <nav className="flex space-x-2 text-sm">
        <span className="text-muted-foreground hover:text-foreground cursor-pointer">
          Dashboard
        </span>
        <span className="text-muted-foreground">/</span>
        <span className="text-foreground font-medium">
          {getCurrentPageTitle()}
        </span>
      </nav>
    );
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between shadow-sm" data-testid="topbar">
      <div className="flex items-center space-x-4">
        <h2 className="text-xl font-semibold text-foreground" data-testid="page-title">
          {getCurrentPageTitle()}
        </h2>
        {getBreadcrumbs()}
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <div className="flex items-center space-x-2">
          <Switch
            checked={isDark}
            onCheckedChange={toggleTheme}
            className="data-[state=checked]:bg-primary"
            data-testid="switch-theme-toggle"
          />
          {isDark ? (
            <Moon className="w-4 h-4 text-muted-foreground" />
          ) : (
            <Sun className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
        
        {/* User Info */}
        <div className="flex items-center space-x-3 bg-muted/50 px-3 py-2 rounded-lg">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-sm font-medium text-foreground truncate" data-testid="user-name">
              {authData?.user?.usuario || "Usuario"}
            </p>
            <p className="text-xs text-muted-foreground truncate" data-testid="user-role">
              {authData?.user?.rol_activo?.descripcion || "Sin rol"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors"
            title="Cerrar Sesión"
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
