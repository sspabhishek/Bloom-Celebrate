# Overview

This is a full-stack web application for a balloons and flowers decoration business. The application provides a visually stunning, fully responsive website that showcases event-themed galleries, enables easy image management through an admin panel, and provides streamlined contact functionality for customers to request specific designs.

The application features a hero slider showcasing high-quality event decoration images, a categorized gallery system with search functionality, and a contact form that can be pre-filled with specific design IDs when customers request particular decorations.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: React Query (TanStack Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod for validation
- **Image Handling**: Custom lightbox component with modal functionality

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Development Setup**: Uses tsx for development server with hot reloading
- **File Uploads**: Multer middleware for handling image uploads with file size and type validation
- **Static Files**: Serves uploaded images from local filesystem

## Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema**: Three main tables - users, galleryImages, and contactMessages
- **Migrations**: Drizzle Kit for schema migrations

## Key Features Implementation

### Gallery System
- **Image Management**: Automatic generation of unique design IDs (e.g., "FLORAL-001", "BALLOON-022")
- **Categorization**: Images organized by event types (birthdays, weddings, corporate)
- **Search Functionality**: Full-text search across design IDs, titles, and keywords
- **Lightbox Display**: Click-to-enlarge functionality with design request integration

### Admin Panel
- **Authentication**: Simple password-based admin access
- **Image Upload**: Multi-part form handling with automatic file processing
- **Content Management**: Create, view, and delete gallery images
- **Design ID Generation**: Automatic sequential ID generation per category

### Contact System
- **Form Integration**: Contact form with optional design ID pre-population
- **Validation**: Zod schema validation for all form inputs
- **Database Storage**: All contact messages stored with timestamps

## Development Setup
- **Build Process**: Vite for frontend, esbuild for backend bundling
- **Development**: Concurrent development server with HMR
- **Type Safety**: Shared TypeScript schemas between frontend and backend
- **Path Aliases**: Configured for clean imports (@/, @shared/)

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Hook Form
- **Build Tools**: Vite, esbuild, tsx for development
- **TypeScript**: Full TypeScript setup with strict configuration

## UI and Styling
- **Radix UI**: Complete set of unstyled, accessible UI components
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **Fonts**: Google Fonts integration (Inter, Playfair Display)
- **Icons**: Font Awesome for icons

## Backend Services
- **Database**: Neon serverless PostgreSQL
- **File Handling**: Multer for file uploads
- **Session Management**: Connect-pg-simple for PostgreSQL session storage

## State Management and Data Fetching
- **TanStack React Query**: Server state management and caching
- **Zod**: Runtime type validation and schema definition
- **Date-fns**: Date manipulation and formatting

## Development and Deployment
- **Replit Integration**: Configured for Replit development environment
- **Hot Module Replacement**: Vite plugin for development
- **Error Handling**: Runtime error overlay for development