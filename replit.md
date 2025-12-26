# Idea Tracker Application

## Overview

This is a full-stack idea management application that allows users to create, organize, and publish their ideas. Users can register accounts, manage personal idea collections with maturity rankings (1-10 scale), and optionally publish ideas publicly or share them via Twitter. The application features both private dashboards accessible at `/{username}` and public viewing pages at `/public/{username}`.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript compiled with tsx (development) and esbuild (production)
- **API Design**: RESTful endpoints under `/api/*` prefix
- **Authentication**: Passport.js with local strategy, session-based auth using express-session
- **Password Security**: scrypt hashing with random salts

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (via Neon serverless driver)
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Schema Validation**: Zod schemas generated from Drizzle schemas via drizzle-zod

### Key Design Patterns
- **Monorepo Structure**: Client, server, and shared code in separate directories with path aliases
- **Shared Types**: Schema definitions in `/shared/schema.ts` used by both frontend and backend
- **Protected Routes**: Custom `ProtectedRoute` component for authenticated-only pages
- **Storage Abstraction**: `IStorage` interface in `server/storage.ts` for database operations

### Authentication Flow
- Session-based authentication with cookies
- PostgreSQL session store for persistence
- User-scoped data isolation (users only see their own ideas when logged in)

## External Dependencies

### Database
- **PostgreSQL**: Primary data store via Neon serverless (`@neondatabase/serverless`)
- **Connection**: Requires `DATABASE_URL` environment variable

### Session Management
- **connect-pg-simple**: PostgreSQL session store requiring `user_sessions` table

### Third-Party APIs
- **Twitter API**: Optional integration via `twitter-api-v2` for publishing ideas to Twitter

### UI Libraries
- **Radix UI**: Full suite of accessible UI primitives
- **Lucide React**: Icon library
- **react-icons**: Additional icons (used for Twitter/FaTwitter)
- **react-markdown**: Markdown rendering with `remark-gfm` and `rehype-sanitize`
- **embla-carousel-react**: Carousel functionality
- **vaul**: Drawer component
- **react-day-picker**: Calendar/date picker

### Development Tools
- **Vite**: Development server with HMR
- **Replit Plugins**: `@replit/vite-plugin-runtime-error-modal` and `@replit/vite-plugin-cartographer` for enhanced Replit development experience