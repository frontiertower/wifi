# Frontier Tower WiFi Portal

## Overview

Frontier Tower WiFi Portal is a captive portal application that manages WiFi access for a building with three distinct user types: members, guests, and event attendees. The system integrates with UniFi network controllers to authorize users and track network usage. Built with a modern TypeScript stack, it provides both a user-facing registration portal and an administrative dashboard for managing access, vouchers, and events.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### Users Tab Table Optimization (November 4, 2025)
- Removed redundant Floor column from Users tab table
- Consolidated floor information into Event / Details column for cleaner layout
- Ensured floor information always displays for all user types (event, guest, member)
- Event users: Show event name, organization, and floor in Details column
- Guest users: Show host and floor in Details column
- Member users: Show floor in Details column
- Reduced table from 7 columns to 6 columns for improved mobile responsiveness
- Fixed empty cell bug where floor wouldn't show if event name or host was missing
- All 27 test users verified to display floor information correctly

### Guests Tab Removal and Hash Navigation Fix (November 4, 2025)
- Completely removed Guests tab from admin dashboard (vouchers functionality no longer needed)
- Cleaned up all orphaned code: Tab type, navigation array, hash validation, query, and interface
- Fixed hash navigation to properly handle URL hash changes between tabs
- Added hashchange event listener to update active tab when hash changes (not just on mount)
- Navigation now works correctly when switching between hashes (e.g., #settings → #users)
- Invalid hashes (like #vouchers) gracefully default to Analytics tab without errors
- Admin dashboard now has exactly 5 tabs: Analytics, Users, Events, Location, Settings
- No requests to removed /api/admin/vouchers endpoint
- Tested and verified all hash navigation scenarios work correctly

### Mobile-Optimized Admin Dashboard (November 4, 2025)
- Comprehensive mobile responsive design implementation for admin dashboard
- Sticky navigation header with shortened title on mobile ("FT Admin" vs "Frontier Tower Admin")
- Horizontally scrollable tab navigation with optimized spacing for small screens
- All data tables (Users, Guests, Events) wrapped in overflow-x-auto for horizontal scrolling
- Responsive stat cards in Analytics tab: 1 column mobile → 2 columns tablet → 3-4 columns desktop
- Flexible form layouts in Settings tab with full-width buttons on mobile
- Responsive typography: headings scale from text-base to text-lg, stats from text-2xl to text-3xl
- Adaptive padding throughout: p-4 on mobile, p-6 on larger screens
- Search controls and headers stack vertically on mobile, horizontally on larger screens
- Tested and verified on mobile (390x844), tablet (768x1024), and desktop viewports
- Dark mode compatibility preserved across all responsive layouts

### Settings Tab for UniFi Configuration (November 4, 2025)
- Added Settings tab in admin dashboard for configuring UniFi controller integration
- New `settings` database table stores configuration as key-value pairs
- Supports both Modern API (Network Application 9.1.105+) and Legacy API
- Modern API uses Bearer token authentication with `/v1/sites/{siteId}/clients` endpoints
- Legacy API uses session-based authentication with `/api/s/{site}/cmd/stamgr` endpoint
- Settings stored in database with fallback to environment variables for backward compatibility
- API endpoints: GET/POST `/api/admin/settings` for retrieving and saving configuration
- Authorization endpoint reads from database settings instead of just env vars
- Radio button UI to select API type: None (Mock Mode), Modern, or Legacy
- Conditional form fields based on selected API type
- Inline setup instructions for both API types
- Settings persist across application restarts

### Location Tab User Names Display (November 4, 2025)
- Enhanced Location tab to display user first names on each floor in addition to counts
- Shows up to 5 first names per floor in comma-separated format below the user count
- When more than 5 users on a floor, displays "+X more" indicator after the 5 names
- Backend extracts first name from full name using `split(' ')[0]`
- Responsive text sizing (text-xs on mobile, text-sm on larger screens) with dark mode support
- Names only displayed when floor has users (empty floors show no names section)
- Updated `getFloorStats()` to return `Record<string, { count: number; names: string[] }>`
- Tested and verified with multiple user scenarios including edge cases

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

### Event Guests Today Counter (October 30, 2025)
- Replaced "Data Usage Today" stat with "Event Guests Today" counter
- Counts event attendees (role="event") registered after 4am using same 4am reset logic
- Purple color scheme with Users icon to match event badge styling throughout app
- Backend query filters captive_users by role and 4am cutoff timestamp
- Displays count in fourth stat card on admin dashboard
- Complements Members Today, Guests Today, and Events Today metrics

### Members Today Counter (October 30, 2025)
- Changed "Users Today" to "Members Today" - counts only members (role="member") registered after 4am
- Blue color scheme with Users icon to match member badge styling throughout app
- Backend query filters captive_users by role="member" and 4am cutoff timestamp
- Complements Guests Today and Event Guests Today for role-specific daily tracking
- Dashboard now shows four role-specific daily counters: Members Today, Guests Today, Events Today, Event Guests Today

### Daily Counters with 4am Reset (October 30, 2025)
- All "Today" counters (Members, Guests, Event Guests) reset at 4am daily (not midnight) to align with business hours
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

### Events Today Feature (November 3, 2025)
- Updated admin dashboard stats to show "Events Today" instead of "Active Events"
- Backend counts only events where start_date is today (not events spanning multiple days)
- SQL query: `DATE(start_date) = CURRENT_DATE`
- Displays count of all events starting today (including finished events) in orange-colored stat card
- Counts 11 events starting Oct 30, 2025 regardless of whether they've already finished

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