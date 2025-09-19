# Connectiva Hermes - Enterprise Authentication System

## Overview

Connectiva Hermes is a comprehensive enterprise authentication system built as a full-stack TypeScript application. The system provides secure JWT/JWE authentication with role-based access control (RBAC), session management, and user administration capabilities. It features encrypted access tokens, secure refresh token rotation, and granular permission controls for enterprise-level security requirements.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Monorepo Structure
The project uses pnpm workspaces to organize code into distinct applications and shared packages:
- **apps/web**: React 18 frontend with TypeScript, Vite, React Router v6, react-hook-form, and zod validation
- **apps/api**: Express 5 backend with TypeScript ESM, featuring comprehensive security middlewares
- **packages/**: Shared libraries including types, configuration utilities, and authentication helpers

### Frontend Architecture
The React application uses modern patterns with:
- **React Query** for server state management and caching
- **React Hook Form** with zod validation for form handling
- **shadcn/ui** components built on Radix UI primitives
- **Tailwind CSS** for styling with CSS variables for theming
- **Protected routing** with authentication guards
- **Context-based auth state** management

### Backend Architecture  
The Express server implements enterprise-grade security:
- **JWT/JWE hybrid tokens**: Short-lived encrypted access tokens (15 min) and secure refresh tokens
- **Role-based permissions**: Granular module and action-based authorization
- **Session management**: Database-tracked sessions with configurable policies for expiration and inactivity
- **Security middlewares**: Helmet, CORS with credentials, rate limiting, and request logging
- **Modular structure**: Separated routes, controllers, services, and repositories following clean architecture

### Authentication & Authorization
The system implements a sophisticated auth model:
- **Access tokens**: JWE-encrypted JWT tokens with user permissions stored in memory
- **Refresh tokens**: HttpOnly secure cookies with rotation and revocation via JTI tracking
- **Session policies**: Configurable absolute and inactivity timeouts per user
- **RBAC implementation**: Role-to-module-to-permission mapping with runtime validation

### Data Architecture
Uses PostgreSQL with Drizzle ORM for type-safe database operations:
- **Schema introspection**: Existing database tables are introspected for type generation
- **Connection pooling**: pg-pool for efficient database connections  
- **Repository pattern**: Data access abstraction for users, sessions, and RBAC entities

### Security Design
Enterprise-level security features:
- **Token encryption**: Access tokens encrypted with JWE using symmetric keys
- **Secure cookie handling**: HttpOnly, secure, SameSite strict cookies for refresh tokens
- **Password security**: Argon2 hashing with configurable parameters
- **Rate limiting**: Configurable limits on authentication endpoints
- **Session tracking**: Full audit trail of user sessions and activities

## External Dependencies

### Database
- **PostgreSQL**: Primary database for user data, sessions, roles, and permissions
- **Drizzle ORM**: Type-safe ORM with schema introspection capabilities
- **pg/pg-pool**: PostgreSQL driver with connection pooling

### Authentication & Security
- **jose**: JWT/JWE token creation and verification
- **argon2**: Secure password hashing
- **helmet**: Security headers middleware
- **cors**: Cross-origin resource sharing with credentials support
- **rate-limiter-flexible**: Configurable rate limiting
- **cookie-parser**: Secure cookie handling

### Frontend Libraries
- **@tanstack/react-query**: Server state management and caching
- **react-hook-form**: Form handling and validation
- **@hookform/resolvers**: Zod integration for form validation  
- **@radix-ui/**: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **zod**: Schema validation for type safety

### Development Tools
- **Vite**: Fast build tool and dev server for frontend
- **TypeScript**: Type safety across the entire stack
- **tsx**: TypeScript execution for development
- **drizzle-kit**: Database schema management and migrations