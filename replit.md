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
*   **Routing**: Wouter for client-side routing, distinguishing between public portal (`/`) and admin dashboard (`/admin`).
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
    *   Featured Projects section displays three key projects:
        *   Omi.me - https://omi.me
        *   modelcontextprotocol-security.io - https://modelcontextprotocol-security.io
        *   safemode.dev - https://safemode.dev
    *   All project links open in new tabs
*   **External Events Feed Integration (November 17, 2025)**:
    *   New API endpoint `/api/external-events` proxies Luma events from external timeline service
    *   Event form fetches real-time events from https://studio--frontier-tower-timeline.us-central1.hosted.app/api/events
    *   Events filtered by selected date using startsAt timestamp
    *   Supports both database events and custom event names
    *   Custom event validation allows "Other Event" option for non-listed events
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

## External Dependencies

*   **UI Component Libraries**: Radix UI, shadcn/ui, Lucide React, embla-carousel-react, cmdk.
*   **Form Management**: React Hook Form, @hookform/resolvers, Zod.
*   **Database & ORM**: @neondatabase/serverless, Drizzle ORM, drizzle-zod, connect-pg-simple.
*   **Styling**: Tailwind CSS, class-variance-authority, clsx, tailwind-merge.
*   **Development Tools**: Vite, TypeScript, ESBuild, @replit/vite-plugin-\*.
*   **Date & Time**: date-fns.
*   **Network Integration**: ws (for Neon DB), UniFi Controller API (mocked).
*   **AI Integration**: OpenAI GPT-4o (via Replit AI Integrations) for event parsing.