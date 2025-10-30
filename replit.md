# Frontier Tower WiFi Portal

## Overview

Frontier Tower WiFi Portal is a captive portal application that manages WiFi access for a building with three distinct user types: members, guests, and event attendees. The system integrates with UniFi network controllers to authorize users and track network usage. Built with a modern TypeScript stack, it provides both a user-facing registration portal and an administrative dashboard for managing access, vouchers, and events.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### Location Tab with 2D Building Visualization (October 30, 2025)
- Added Location tab showing 2D visualization of Frontier Tower's 16-story building
- Building displays floors 2-16 (excluding floor 13 per building convention)
- User distribution logic: Event users→Floor 2, Guest users→Floor 16, Members→their selected floor
- Color-coded floors by user density (gray→blue→green→yellow→orange for 0→1-2→3-5→6-10→10+ users)
- Clean 2D stacked layout with gradient backgrounds (converted from 3D perspective design)
- Special badges on Floor 16 (Guests) and Floor 2 (Events)
- Responsive legend showing density color coding
- Backend endpoint `/api/admin/floor-stats` aggregates user counts per floor
- Floor stats filtered to show only users registered after 4am (consistent with "Users Today" metric)

### Analytics Tab with Total Counts (October 29, 2025)
- Added comprehensive analytics dashboard showing lifetime totals
- Displays 5 stat cards: Total Users, Total Members, Total Guests, Total Event Guests, Total Events
- Gradient card backgrounds with dark mode support (blue, purple, green, pink, orange)
- Responsive grid layout (3 columns on large screens, 2 on medium, 1 on mobile)
- Backend queries count users by role and total events from database

### Users Today & Guests Today Counters with 4am Reset (October 30, 2025)
- Changed "Active Users" to "Users Today" - counts all users registered after 4am (member/guest/event)
- Changed "Daily Guest Count" to "Guests Today" - counts only guest registrations after 4am
- Both counters reset at 4am daily (not midnight) to align with business hours
- Backend SQL uses CASE logic: if current time >= 4am, count from today at 4am; else count from yesterday at 4am
- Displays real-time registration counts for current day in admin dashboard stat cards
- Note: Counters use database timezone (typically UTC) for 4am boundary determination

### Colored Role Type Badges (October 29, 2025)
- Added colored backgrounds to user role badges in admin dashboard
- Member badges: Blue (bg-blue-100/900 with text-blue-700/300)
- Guest badges: Green (bg-green-100/900 with text-green-700/300)
- Event badges: Purple (bg-purple-100/900 with text-purple-700/300)
- Includes light/dark mode variants for accessibility
- Applied consistently across Guests and Users tabs

### Events Today Feature (October 29, 2025)
- Updated admin dashboard stats to show "Events Today" instead of "Active Events"
- Backend filters events where current date falls within the event's date range (inclusive)
- SQL query: `CURRENT_DATE >= DATE(start_date) AND CURRENT_DATE <= DATE(end_date)`
- Displays count of events happening today in orange-colored stat card

### Daily Guest Counter (October 29, 2025)
- Tracks daily guest registration count with automatic 4am reset
- Uses atomic SQL upsert to prevent race conditions during concurrent registrations
- New `daily_stats` table with date-based unique constraint
- Thread-safe implementation using PostgreSQL's `INSERT ... ON CONFLICT` with embedded reset logic

### AI-Powered Bulk Event Import (October 29, 2025)
- Integrated OpenAI GPT-4o via Replit AI Integrations for event parsing
- Bulk import endpoint accepts unstructured text and extracts multiple events
- Graceful error handling for partial imports with schema validation
- Enhanced event validation with descriptive error messages
- Production database populated with 27 real events from Luma.com

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript using Vite as the build tool and development server.

**UI Component System**: shadcn/ui design system built on Radix UI primitives with Tailwind CSS for styling. This provides a comprehensive set of accessible, customizable components following the "new-york" style variant.

**Design Philosophy**: Mobile-first approach with progressive disclosure, focusing on clarity and trust. The application uses Inter or DM Sans fonts with a neutral color scheme optimized for utility-focused interactions.

**State Management**: TanStack Query (React Query) for server state management with custom query client configuration. Forms use React Hook Form with Zod validation schemas.

**Routing**: Wouter for lightweight client-side routing with two main routes - the public portal (`/`) and admin dashboard (`/admin`).

**Component Organization**: 
- Separation between page components (`/pages`), reusable UI components (`/components`), and shadcn/ui primitives (`/components/ui`)
- Form components split by user type (member-form, guest-form, event-form)
- Shared components for common UI patterns (success modal, role selection cards)

### Backend Architecture

**Runtime**: Node.js with Express.js framework handling API routes and serving the static frontend in production.

**API Design**: RESTful endpoints under `/api` namespace with role-specific registration endpoints:
- `/api/register/member` - Member registration with floor assignment
- `/api/register/guest` - Guest registration with host and purpose tracking
- `/api/register/event` - Event attendee registration with event code validation
- `/api/admin/*` - Administrative endpoints for stats, vouchers, sessions, and events

**Session Management**: Express session middleware with PostgreSQL-backed session store using connect-pg-simple.

**Development Setup**: Custom Vite middleware integration for HMR (Hot Module Replacement) in development with automatic production build serving.

**Network Integration**: Mock UniFi controller service that simulates guest authorization with configurable duration, bandwidth limits, and session tracking. Captures UniFi parameters (AP MAC, SSID, client MAC, session ID) from query strings for real controller integration.

### Data Storage

**Database**: PostgreSQL accessed via Neon's serverless driver with WebSocket support for connection pooling.

**ORM**: Drizzle ORM with TypeScript schema definitions providing type-safe database queries and migrations.

**Schema Design**:
- `users` - Admin authentication (username, password hash)
- `captive_users` - WiFi user registrations with role-based fields (member/guest/event)
- `vouchers` - Access codes with usage tracking and expiration
- `events` - Event metadata with attendee counts and active status
- `sessions` - User session tracking with duration and data usage

**Validation**: Drizzle-Zod integration generates Zod schemas from database schema for consistent validation across client and server.

### External Dependencies

**UI Component Libraries**:
- Radix UI - Headless accessible component primitives (@radix-ui/react-*)
- shadcn/ui - Pre-built component system
- Lucide React - Icon library
- embla-carousel-react - Carousel functionality
- cmdk - Command menu component

**Form Management**:
- React Hook Form - Form state and validation
- @hookform/resolvers - Zod schema resolver integration
- Zod - Schema validation library

**Database & ORM**:
- @neondatabase/serverless - Neon PostgreSQL serverless driver
- Drizzle ORM - TypeScript ORM
- drizzle-zod - Schema validation integration
- connect-pg-simple - PostgreSQL session store

**Styling**:
- Tailwind CSS - Utility-first CSS framework
- class-variance-authority - Component variant management
- clsx & tailwind-merge - Conditional class name utilities

**Development Tools**:
- Vite - Build tool and dev server
- TypeScript - Type safety
- ESBuild - Production bundling
- @replit/vite-plugin-* - Replit-specific development plugins

**Date & Time**:
- date-fns - Date manipulation and formatting

**Network Integration**:
- ws - WebSocket library for Neon database connections
- UniFi Controller API (mocked in current implementation)