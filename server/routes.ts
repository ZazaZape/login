import type { Express } from "express";
import { createServer, type Server } from "http";
import argon2 from "argon2";
import { execute_sql_tool } from "../apps/api/src/db/client.js";

export async function registerRoutes(app: Express): Promise<Server> {
  // Temporary API routes for testing authentication
  
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { usuario, password } = req.body;
      
      if (!usuario || !password) {
        return res.status(400).json({
          ok: false,
          code: "VALIDATION_ERROR",
          message: "Usuario y contraseña requeridos"
        });
      }

      // For testing, we'll accept admin/admin123 and wposada407/test123
      let isValid = false;
      if ((usuario === "admin" && password === "admin123") ||
          (usuario === "wposada407" && password === "test123")) {
        isValid = true;
      }

      if (!isValid) {
        return res.status(401).json({
          ok: false,
          code: "INVALID_CREDENTIALS",
          message: "Credenciales incorrectas"
        });
      }

      // Mock successful login response
      res.json({
        ok: true,
        data: {
          user: {
            usuario_id: usuario === "admin" ? 5 : 1,
            usuario: usuario,
            usuario_habilitado: true,
            rol_activo: {
              rol_id: usuario === "admin" ? 1 : 51,
              descripcion: usuario === "admin" ? "Administrador General" : "Administrador del sistema"
            }
          },
          roleId: usuario === "admin" ? 1 : 51,
          defaultModule: {
            modulo_id: 1,
            label: "Dashboard",
            path: "/dashboard",
            icon: "Dashboard"
          },
          menu: [{
            modulo_id: 1,
            label: "Dashboard", 
            path: "/dashboard",
            icon: "Dashboard",
            isDefault: true,
            permisos: []
          }]
        }
      });

    } catch (error) {
      res.status(500).json({
        ok: false,
        code: "SERVER_ERROR",
        message: "Error interno del servidor"
      });
    }
  });

  // Me endpoint for getting current user
  app.get("/api/auth/me", (req, res) => {
    // For testing, return null (unauthenticated)
    res.status(401).json({
      ok: false,
      code: "UNAUTHORIZED", 
      message: "No autenticado"
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
