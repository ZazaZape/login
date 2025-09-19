import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Shield, User, ChevronDown } from "lucide-react";

export default function Topbar() {
  const { authData } = useAuth();
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);

  const getCurrentPageTitle = () => {
    const path = location.pathname;
    if (path === "/") return "Dashboard";
    if (path === "/usuarios") return "Gestión de Usuarios";
    
    // Find matching menu item
    const menuItem = authData?.menu?.find(item => item.path === path);
    return menuItem?.label || "Página";
  };

  const getBreadcrumbs = () => {
    const path = location.pathname;
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
        {/* Session Info */}
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <Shield className="w-4 h-4" />
          <span>Sesión activa</span>
        </div>
        
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="text-muted-foreground hover:text-foreground"
          title="Cambiar tema"
          data-testid="button-theme-toggle"
        >
          {isDark ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </Button>
        
        {/* User Menu */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
            data-testid="button-user-menu"
          >
            <User className="w-4 h-4" />
            <ChevronDown className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </header>
  );
}
