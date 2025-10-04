# MultiTool Pro - Calculator & Converter Suite

## Overview

MultiTool Pro is a comprehensive utility application that provides five essential tools in one unified interface: a scientific calculator, currency converter, unit converter, gyroscope-based hand level, and BMI calculator. The application is built as a full-stack web application with a modern React frontend and Express.js backend, designed to work seamlessly across desktop and mobile devices.

## User Preferences

Preferred communication style: Simple, everyday language.

## Replit Environment Setup

This project has been configured to run in the Replit environment:

### Configuration
- **Workflow**: "Start application" runs `npm run dev` on port 5000
- **Frontend**: Vite dev server with HMR enabled, serving on 0.0.0.0:5000
- **Backend**: Express.js API server integrated with Vite middleware
- **Host Configuration**: Already configured with `allowedHosts: true` for Replit proxy compatibility
- **Build Command**: `npm run build` (builds both frontend and backend)
- **Production Command**: `npm run start` (serves production build)

### Development
- Run `npm run dev` to start the development server
- Frontend and backend run together on port 5000
- Hot module replacement (HMR) is enabled for instant updates
- Exchange rates are loaded from in-memory storage on startup

### Deployment
- Deployment target: autoscale (configured for Replit deployments)
- Build process compiles both Vite frontend and Express backend
- Production mode serves static files from Express

## System Architecture

### Frontend Architecture
The frontend is built using React 18 with TypeScript, leveraging a modern component-based architecture:

- **React + TypeScript**: Provides type safety and modern React features
- **Vite**: Used as the build tool for fast development and optimized production builds
- **Tailwind CSS + shadcn/ui**: For consistent, responsive styling with a complete component library
- **Wouter**: Lightweight client-side routing solution
- **TanStack Query**: Manages server state, caching, and API interactions
- **React Hook Form**: Handles form state and validation

The frontend follows a single-page application (SPA) pattern with tab-based navigation between different tools. The application is designed to be mobile-first and includes PWA capabilities with service worker support.

### Backend Architecture
The backend uses Express.js with TypeScript in a minimal, API-focused design:

- **Express.js**: Lightweight web server framework
- **TypeScript**: Provides type safety across the entire backend
- **Drizzle ORM**: Type-safe database operations with PostgreSQL support
- **Zod**: Runtime type validation for API requests
- **Memory Storage**: Currently uses in-memory storage with database schema ready for PostgreSQL migration

The backend serves both the API endpoints and static files, with middleware for request logging and error handling.

## Key Components

### Tools Implementation
1. **Scientific Calculator**: Full-featured calculator with trigonometric functions, logarithms, and expression evaluation
2. **Currency Converter**: Real-time currency conversion with support for 8 major currencies and rate caching
3. **Unit Converter**: Comprehensive unit conversion covering length, weight, temperature, and volume
4. **Hand Level**: Gyroscope-based level tool using device orientation APIs with calibration support
5. **BMI Calculator**: Body Mass Index calculator with health category indicators and recommendations

### UI Components
- **Theme System**: Light/dark mode toggle with persistent storage
- **Responsive Design**: Mobile-first approach with tablet and desktop optimizations
- **Component Library**: Complete shadcn/ui component suite for consistent UI patterns
- **Progressive Web App**: Manifest file and service worker for offline capabilities

### Data Management
- **Exchange Rates**: Cached exchange rate data with fallback calculations
- **User Preferences**: Theme and tool state persistence
- **Calculation History**: Local storage for calculator operations

## Data Flow

### Client-Server Communication
1. **API Requests**: REST endpoints for exchange rates and user preferences
2. **State Management**: TanStack Query handles caching, background updates, and error states
3. **Local Storage**: Theme preferences and calculation history stored locally
4. **Real-time Updates**: Exchange rates cached with automatic refresh capabilities

### Component State Flow
1. **Global State**: Theme provider manages dark/light mode across the application
2. **Tool State**: Each tool maintains its own local state with React hooks
3. **Form State**: React Hook Form manages input validation and submission
4. **URL State**: Active tool tab synchronized with URL for bookmarking

## External Dependencies

### Core Libraries
- **@radix-ui**: Unstyled, accessible UI primitives for complex components
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Drizzle ORM**: Database toolkit with PostgreSQL support
- **TanStack Query**: Server state management and caching
- **Zod**: Schema validation and type inference

### Device APIs
- **DeviceOrientationEvent**: For gyroscope-based level functionality
- **Local Storage**: For persistent user preferences
- **Service Worker**: For PWA offline capabilities

### Development Tools
- **Vite**: Build tool with hot module replacement
- **TypeScript**: Type checking and enhanced developer experience
- **tsx**: TypeScript execution for Node.js (development)
- **esbuild**: Fast JavaScript bundler for production builds

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite compiles React application to static assets in `dist/public`
2. **Backend Build**: esbuild bundles Express server to `dist/index.js`
3. **Database Migration**: Drizzle migrations in `migrations/` directory (when using PostgreSQL)
4. **Static Assets**: PWA manifest and service worker included in build

### Environment Configuration
- **Development**: Uses Vite dev server with Express API proxy, HMR enabled
- **Production**: Express serves both API and static files from `dist/public`
- **Database**: Configured for PostgreSQL with Neon serverless support (currently using memory storage)
- **Environment Variables**: `DATABASE_URL` required for database connection (optional in dev)

### Hosting Considerations
- **Single Server**: Both frontend and backend served from same Express instance on port 5000
- **Database**: PostgreSQL database optional (memory storage works as fallback)
- **Static Files**: Served directly by Express in production
- **PWA Support**: Service worker and manifest included for app-like experience
- **Replit Compatible**: Configured with proper host settings for Replit's proxy environment

The application is designed to be easily deployable to platforms like Replit, Vercel, Railway, or traditional VPS hosting with minimal configuration changes.

## Recent Changes

### October 4, 2025 - Replit Environment Setup
- Renamed `gitignore` to `.gitignore` and added standard patterns (dist, .env, logs)
- Configured workflow "Start application" to run on port 5000 with webview output
- Verified Vite configuration includes `allowedHosts: true` for Replit proxy compatibility
- Confirmed server binds to 0.0.0.0:5000 for proper Replit networking
- Removed old "Server" workflow that was failing
- Tested application successfully - all tools functional
- Configured deployment for autoscale target with proper build/start scripts
