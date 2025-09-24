import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../../hooks/use-auth";
import { 
  Network, 
  Gauge, 
  Users, 
  Tags, 
  Key, 
  Clock, 
  FileText, 
  LogOut,
  User
} from "lucide-react";

// Simple utility function for className concatenation
function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

const iconMap = {
  "tachometer-alt": Gauge,
  "users": Users,
  "user-tag": Tags,
  "key": Key,
  "clock": Clock,
  "file-alt": FileText,
  "network-wired": Network,
};

export default function Sidebar() {
  const { authData, logoutMutation } = useAuth();
  const [location] = useLocation();

  const menuItems = authData?.menu || [];
  const user = authData?.user;

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || Users;
    return IconComponent;
  };

  const isActiveRoute = (path: string) => {
    return location === path;
  };

  return (
    <div className="w-64 h-screen bg-card border-r border-border flex flex-col shadow-sm" data-testid="sidebar">
      {/* Logo Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <Network className="w-8 h-8 text-primary" />
          <div>
            <h1 className="font-bold text-lg text-foreground">Connectiva</h1>
            <p className="text-xs text-muted-foreground">Hermes v2.0</p>
          </div>
        </div>
      </div>


      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4" data-testid="navigation-menu">
        <div className="px-3 space-y-1">
          {/* Dashboard - Always show */}
          <Link
            to="/"
            className={cn(
              "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
              isActiveRoute("/")
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
            data-testid="nav-dashboard"
          >
            <Gauge className="mr-3 h-4 w-4" />
            Dashboard
          </Link>

          {/* Dynamic menu items */}
          {menuItems.map((item) => {
            const IconComponent = getIcon(item.icon);
            const isActive = isActiveRoute(item.path);
            
            return (
              <Link
                key={item.modulo_id}
                to={item.path}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                data-testid={`nav-${item.path.replace("/", "")}`}
              >
                <IconComponent className="mr-3 h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

    </div>
  );
}
