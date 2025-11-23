# Frontier Tower WiFi Portal

## Overview

The Frontier Tower WiFi Portal is a captive portal application designed to manage WiFi access for a multi-tenant building, catering to members, guests, and event attendees. It integrates with UniFi network controllers for user authorization and network usage tracking. The system comprises a user-facing registration portal that showcases AI projects (Omi.me, modelcontextprotocol-security.io, safemode.dev) and an administrative dashboard for comprehensive access management, event handling, and analytics. The project's core purpose is to provide a modern, efficient, and scalable WiFi access control solution, enhancing user experience and administrative oversight within an AI-focused environment. This platform aims to foster community growth and streamline operations for the Frontier Tower.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

The frontend is built with React 18 and TypeScript using Vite. It utilizes `shadcn/ui` based on Radix UI and Tailwind CSS, following a "new-york" style, with a mobile-first design philosophy. State management is handled by TanStack Query for server state and React Hook Form with Zod for form validation. Wouter is used for client-side routing across public portals, events, and the admin dashboard.

### Backend

The backend is powered by Node.js with Express.js, providing RESTful API endpoints. Session management uses Express session middleware with a PostgreSQL store. A mock UniFi controller service simulates guest authorization, supporting modern and legacy UniFi API specifications.

### Data Storage

PostgreSQL, accessed via Neon's serverless driver, is the chosen database. Drizzle ORM with TypeScript schema definitions manages the data, including tables for admin users, captive WiFi users, events, bookings, directory listings (companies, communities, persons with hierarchical support), and UniFi configurations. Drizzle-Zod ensures consistent schema validation.

### UI/UX Decisions

The Admin Dashboard is mobile-optimized with sticky navigation, responsive data tables, and tab-based navigation (Analytics, Users, Events, Bookings, Directory, Settings). It features a 2D building visualization for user distribution and comprehensive event analytics. Theming includes full dark mode support with automatic time-based switching and manual override. The Directory UI offers filterable, expandable listing cards with admin CRUD capabilities. Profile completion percentages are displayed in the admin dashboard.

### Technical Implementations

*   **Admin Authentication**: Password-based authentication with session management and role-based access control (Owner/Staff), including login history tracking.
*   **External Events Integration**: Proxies and syncs Luma events from an external service, including URL extraction and robust deduplication.
*   **UniFi Captive Portal Compliance**: Implements UniFi External Captive Portal specification with redirect-based authorization and MAC address extraction.
*   **Event Management**: Supports AI-powered bulk event import using OpenAI GPT-4o. Event images are downloaded, secured, and served locally. Events use a soft-delete architecture.
*   **Guest Management**: Features a unified progressive disclosure guest registration form with conditional fields, multi-step password verification, and error recovery.
*   **Booking Systems**: Dedicated routes for event/meeting bookings (`/booking`) and building tours (`/tour`), including conditional fields and validation.
*   **Building Directory**: Displays tenant information with filtering and a `/addlisting` form for user-submitted entries, including unique slug-based edit URLs.
*   **Membership & Chat Requests**: Routes for membership inquiries (`/apply-to-join`) and Telegram chat invite requests (`/chat`), with data storage and automated email notifications via Resend.
*   **Member Authentication**: OAuth 2.0 integration with Frontier Tower authentication server, implementing PKCE flow, token refresh, and cookie-based sessions.
*   **Jobs/Recruitment**: A `/jobs` route offers a retro-futuristic, terminal-themed application for internal positions, storing applications and sending email notifications.
*   **Gigs & Jobs**: Linked to external Fxchange platform at https://fxchange.io/maker/open. Admin dashboard includes dedicated "Gigs & Jobs" tab (`/admin#careers`) for internal moderation of job listings with features including approve pending submissions, toggle featured status (star icon), and delete listings (soft delete via isActive flag). Featured listings appear prominently with star badges. API endpoints: GET /api/job-listings (public, approved only), POST /api/job-listings (public posting, creates pending), GET /api/admin/job-listings (admin, all active listings), PATCH approve/toggle-featured/DELETE (admin with isActive checks).

## External Dependencies

*   **UI Component Libraries**: Radix UI, shadcn/ui, Lucide React, embla-carousel-react, cmdk, qrcode.react.
*   **Form Management**: React Hook Form, @hookform/resolvers, Zod.
*   **Database & ORM**: @neondatabase/serverless, Drizzle ORM, drizzle-zod, connect-pg-simple.
*   **Styling**: Tailwind CSS, class-variance-authority, clsx, tailwind-merge.
*   **Development Tools**: Vite, TypeScript, ESBuild.
*   **Date & Time**: date-fns.
*   **Network Integration**: UniFi Controller API (mocked).
*   **AI Integration**: OpenAI GPT-4o (for event parsing).
*   **Email Service**: Resend (for transactional emails).