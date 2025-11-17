# Frontier Tower WiFi Portal

## Overview

Frontier Tower WiFi Portal is a captive portal application designed to manage WiFi access for a multi-tenant building with a focus on AI, Agents, and LLMs. It supports three distinct user types: members, guests, and event attendees. The system integrates with UniFi network controllers for user authorization and network usage tracking, and pulls events from an external feed. It features a user-facing registration portal showcasing AI projects (Omi.me, modelcontextprotocol-security.io, safemode.dev) and an administrative dashboard for access management, event handling, and analytics. The project aims to provide a modern, efficient, and scalable solution for WiFi access control, enhancing user experience and administrative oversight.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

*   **Framework**: React 18 with TypeScript, using Vite for development and building.
*   **UI Component System**: shadcn/ui built on Radix UI primitives and Tailwind CSS, adhering to a "new-york" style.
*   **Design Philosophy**: Mobile-first, progressive disclosure, focusing on clarity and trust with Inter or DM Sans fonts and a neutral color scheme.
*   **State Management**: TanStack Query for server state, React Hook Form with Zod for form management.
*   **Routing**: Wouter for client-side routing, distinguishing between public portal (`/`), events page (`/events`), and admin dashboard (`/admin`).
*   **Component Organization**: Structured separation of page components, reusable UI components, and shadcn/ui primitives.

### Backend Architecture

*   **Runtime**: Node.js with Express.js.
*   **API Design**: RESTful endpoints under `/api`, including role-specific registration (`/api/register/*`) and administrative routes (`/api/admin/*`).
*   **Session Management**: Express session middleware with a PostgreSQL-backed store (`connect-pg-simple`).
*   **Development Setup**: Vite middleware for HMR, serving static frontend in production.
*   **Network Integration**: Mock UniFi controller service for simulating guest authorization, capable of capturing UniFi parameters.

### Data Storage

*   **Database**: PostgreSQL via Neon's serverless driver.
*   **ORM**: Drizzle ORM with TypeScript schema definitions for type-safe queries and migrations.
*   **Schema Design**:
    *   `users`: Admin authentication.
    *   `captive_users`: WiFi user registrations with role-based fields.
    *   `events`: Event metadata.
    *   `sessions`: User session tracking.
    *   `settings`: Key-value configuration for UniFi integration.
*   **Validation**: Drizzle-Zod integration for consistent schema validation.

### UI/UX Decisions

*   **Admin Dashboard**: Mobile-optimized with sticky navigation, horizontally scrollable tab navigation, responsive data tables, stat cards, and form layouts. Includes a 2D building visualization in the Location tab showing user distribution and first names.
*   **Theming**: Full dark mode support for registration forms with a theme toggle.
*   **Analytics**: Comprehensive dashboard with lifetime and daily counters (Members Today, Guests Today, Event Guests Today, Events Today) featuring a 4 AM daily reset.
*   **Badges**: Colored role-type badges for members, guests, and events in the admin dashboard.

### Technical Implementations

*   **Hero Section & Branding (November 17, 2025)**:
    *   Portal homepage showcases AI, Agents, and LLMs focus
    *   Brain icon replaces Building icon in header
    *   Subtitle displays "AI • Agents • LLMs"
*   **External Events Feed Integration (November 17, 2025)**:
    *   New API endpoint `/api/external-events` proxies Luma events from external timeline service
    *   Event form fetches real-time events from https://studio--frontier-tower-timeline.us-central1.hosted.app/api/events
    *   Events filtered by selected date using startsAt timestamp
    *   Supports both database events and custom event names
    *   Custom event validation allows "Other Event" option for non-listed events
    *   **Event Sync (November 17, 2025)**:
        *   New admin endpoint `/api/admin/events/sync` automatically syncs events from external feed
        *   Production-ready with AbortController timeout (10s), Zod validation, and comprehensive error handling
        *   Idempotent upserts using unique constraint on `externalId` field prevent duplicates
        *   Per-event validation with detailed logging for debugging
        *   "Sync Events" button in admin dashboard with loading states and toast notifications
        *   Architect-reviewed and verified for production deployment
*   **UniFi Captive Portal Compliance (November 7, 2025)**:
    *   Correctly implements UniFi External Captive Portal specification with redirect-based authorization
    *   MAC address extraction uses `id` query parameter (primary) with `mac` as fallback per UniFi spec
    *   After successful authorization, redirects users to their original URL (`url` parameter)
    *   Legacy API with full compatibility:
        *   Login via `/api/login` with fallback to `/api/auth/login` for newer controllers
        *   CSRF token extraction from cookies and inclusion in `X-CSRF-Token` header
        *   Dual-path support: classic `/api/s/{site}/cmd/stamgr` and UniFi OS `/proxy/network/api/s/{site}/cmd/stamgr`
        *   Proper payload format: `{"cmd":"authorize-guest","mac":"...","minutes":1440}`
    *   Modern API support via Bearer token with `/v1/sites/{siteId}/clients` endpoints
    *   Architecture-reviewed and verified against UniFi specification
*   **UniFi Configuration**: Dedicated Settings tab in the admin dashboard for configuring UniFi controller integration, supporting both Modern and Legacy APIs with database storage for settings.
*   **Event Management**: AI-powered bulk event import using OpenAI GPT-4o for parsing unstructured text into structured event data, with robust validation.
*   **Daily Counters**: Atomic SQL upserts for daily guest registration counts to prevent race conditions and ensure data integrity.
*   **Public Events Page (November 17, 2025)**:
    *   New public-facing `/events` route displays all upcoming and past events
    *   API endpoint `/api/events` returns all active events sorted by start date
    *   Events automatically grouped by end date: upcoming (endDate >= now) and past (endDate < now)
    *   Event cards display status badges (Happening Now, Upcoming, Past) based on current time
    *   Comprehensive event details including date, time, host, location, attendee counts, and event codes
    *   Responsive card grid layout (3 columns on desktop, 2 on tablet, 1 on mobile) with hover interactions
    *   Loading skeletons and empty state handling for optimal UX
    *   Full dark mode support with theme toggle
    *   **Luma Integration (November 17, 2025)**:
        *   Added `url` field to events schema for storing Luma event URLs
        *   Event sync captures URLs from external feed and conditionally includes them to prevent overwriting
        *   Storage layer preserves existing URLs when sync payload doesn't provide URL field
        *   "View on Luma" button on event cards links to https://lu.ma/{url} when URL is available
        *   Proper data integrity with conditional upserts that only update URL when provided
*   **Unified Guest Form (November 17, 2025)**:
    *   Combined "Guest of a Member" and "Guest at Event" into single progressive disclosure form
    *   Basic fields shown first (Full Name, Email, Telegram Username, Phone Number)
    *   Two guest type selection buttons: "Guest of a Member" and "Guest at Event"
    *   Conditional fields based on selection:
        *   Guest of Member: Shows Host Contact field
        *   Guest at Event: Shows Event Date and Event Name fields with real-time event fetching
    *   Users can change guest type mid-flow via "Change guest type" button
    *   Fixed timezone bug: Uses local date (getFullYear/getMonth/getDate) instead of UTC conversion to prevent date shifts
    *   Home page updated with single "Guest Access" button replacing separate guest/event buttons
    *   Architect-reviewed and tested with end-to-end playwright validation
*   **Booking System (November 17, 2025)**:
    *   New `/booking` route allows users to book events/meetings with comprehensive organizer details
    *   **Database Schema**: `bookings` table with optional `eventId` reference, custom event fields (name, description, dates, location), and organizer details (name, email, phone, LinkedIn, Twitter, company)
    *   **Backend API**:
        *   POST `/api/bookings`: Creates bookings with smart event enrichment before validation
        *   GET `/api/bookings`: Retrieves all bookings
        *   GET `/api/bookings/:id`: Retrieves single booking by ID
        *   Backend enrichment: When `eventId` provided, automatically fetches event details from database and populates booking fields before validation
    *   **Form Validation**: Multi-layer validation system
        *   Schema-level: `insertBookingSchema` with required field validation (min(1), email format, date range)
        *   Form-level: React Hook Form with `zodResolver` and `mode: "onChange"` for real-time validation
        *   Button-level: Submit disabled when `!form.formState.isValid`
        *   Submission-level: Explicit `await form.trigger()` + `formState.isValid` check before mutation
    *   **Two Booking Modes**:
        *   Existing Event: Select from dropdown → auto-populates event details (readonly fields) → fill organizer info
        *   Custom Event: Fill all event details manually → fill organizer info
    *   **ReadOnly vs Disabled**: Event fields use `readOnly` (not `disabled`) in existing-event mode to ensure react-hook-form includes values in submission while preventing user edits
    *   **Data Integrity**: z.coerce.date() handles JSON date serialization, endDate > startDate validation, non-empty string requirements
    *   Architect-reviewed and verified for end-to-end production readiness

## External Dependencies

*   **UI Component Libraries**: Radix UI, shadcn/ui, Lucide React, embla-carousel-react, cmdk.
*   **Form Management**: React Hook Form, @hookform/resolvers, Zod.
*   **Database & ORM**: @neondatabase/serverless, Drizzle ORM, drizzle-zod, connect-pg-simple.
*   **Styling**: Tailwind CSS, class-variance-authority, clsx, tailwind-merge.
*   **Development Tools**: Vite, TypeScript, ESBuild, @replit/vite-plugin-\*.
*   **Date & Time**: date-fns.
*   **Network Integration**: ws (for Neon DB), UniFi Controller API (mocked).
*   **AI Integration**: OpenAI GPT-4o (via Replit AI Integrations) for event parsing.