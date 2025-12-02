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

PostgreSQL, accessed via Neon's serverless driver, is the chosen database. Drizzle ORM with TypeScript schema definitions manages the data, including tables for admin users, captive WiFi users, events, bookings, directory listings (companies, communities, citizens/persons, and amenities with hierarchical support), and UniFi configurations. Drizzle-Zod ensures consistent schema validation.

### UI/UX Decisions

The Homepage features a theme toggle in the top-right corner, a language selector dropdown below the header, and a "Follow the White Rabbit" button at the bottom with a rabbit icon, triggering a Matrix-themed modal for navigation pathways. The language selector uses a shadcn Select component displaying both flag emoji and language name (10 languages: English, Deutsch, Español, 中文, 한국어, 日本語, Français, हिन्दी, العربية, Swahili). Language changes use wouter's client-side routing (setLocation) to preserve SPA experience and maintain UniFi captive portal query parameters across navigation. The Admin Dashboard is mobile-optimized with sticky navigation, responsive data tables, and tab-based navigation (Analytics, Users, Events, Bookings, Directory, Settings). It features a 2D building visualization for user distribution and comprehensive event analytics. The Analytics tab sections are ordered as: (1) Leads by Type and Leads by Status analytics cards, (2) Events Per Month (Last 12 Months) chart, (3) Event Statistics cards, (4) Lifetime Totals metrics, (5) Today's Activity counters, and (6) Building Location Map visualization. All sections include proper conditional rendering and consistent spacing. Theming includes full dark mode support with automatic time-based switching and manual override. The Directory UI offers filterable, expandable listing cards with admin CRUD capabilities. Profile completion percentages are displayed in the admin dashboard.

### Technical Implementations

*   **Admin Authentication**: Password-based authentication with session management and role-based access control (Owner/Staff), including login history tracking.
*   **External Events Integration**: Proxies and syncs Luma events from an external service, including URL extraction and robust deduplication.
*   **UniFi Captive Portal Compliance**: Implements UniFi External Captive Portal specification with redirect-based authorization and MAC address extraction.
*   **Event Management**: Supports AI-powered bulk event import using OpenAI GPT-4o. Event images are downloaded, secured, and served locally. Events use a soft-delete architecture.
*   **Guest Management**: Features a unified progressive disclosure guest registration form with conditional fields, multi-step password verification, and error recovery.
*   **Booking Systems**: Dedicated routes for event/meeting bookings (`/booking`) and building tours (`/tour`), including conditional fields and validation.
*   **Building Directory**: Displays tenant information with filtering and a `/addlisting` form for user-submitted entries, including unique slug-based edit URLs. Logo images are stored as base64 data URLs directly in the database's `logoUrl` field to ensure persistence across deployments (no file-based upload storage).
*   **Virtual Tour**: A `/virtual-tour` route displays amenities and communities from the directory in an expandable card format, sorted by floor (highest first). Filter buttons allow viewing all listings, only amenities, or only communities. Each card shows the listing name, floor location, description, and website link when expanded. Accessible from homepage via dedicated button with cyan styling.
*   **Membership & Chat Requests**: Routes for membership inquiries (`/apply-to-join`) and Telegram chat invite requests (`/chat`), with data storage and automated email notifications via Resend.
*   **Member Authentication**: OAuth 2.0 integration with Frontier Tower authentication server, implementing PKCE flow, token refresh, and cookie-based sessions.
*   **Jobs/Recruitment**: A `/jobs` route offers a retro-futuristic, terminal-themed application for internal positions, storing applications and sending email notifications.
*   **Careers Board with Moderation**: A `/careers` route displays community job listings with public posting and admin moderation workflow. Anyone can submit job listings through a "Post a Job" button, but submissions require admin approval (isApproved flag) before appearing publicly. Comprehensive validation enforces character limits (title max 200, company max 100, location max 100, description 50-2000, requirements max 1000) and proper URL/email format. Public submissions show success message indicating pending approval. Admin dashboard includes dedicated "Careers" tab (`/admin#careers`) where admins can view pending and approved listings, approve submissions, toggle featured status (star icon), and delete listings (soft delete via isActive flag). Featured listings (like Head of Finance) appear in "Featured Opportunities" section with star badges. Soft delete protection prevents deleted listings from being revived. API endpoints: GET /api/job-listings (public, approved only), POST /api/job-listings (public posting, creates pending), GET /api/admin/job-listings (admin, all active listings), PATCH approve/toggle-featured/DELETE (admin with isActive checks).
*   **Unified Leads Management**: The admin dashboard "Leads" tab consolidates all lead sources into a single unified view. The system aggregates leads from 6 different tables (tour bookings, event host bookings, membership inquiries, chat invite requests, residency requests, and WiFi guests) and presents them in a single table with type badges. Analytics cards display lead counts by type (Tour, Event Host, Membership, Chat Invite, Residency, WiFi Guest Tours) and by status (Pending, New, Contacted, Scheduled, Approved, Other). Each lead row includes an inline status dropdown with 10 status options (Pending, New, Contacted, Scheduled, Interviewed, Rejected, Approved, Paid, Quoted, Citizen) allowing admins to update lead status directly in the table. Status changes persist immediately to the database. The leads table includes comprehensive filtering functionality with toggle buttons for all 6 lead types and 10 status values. Multiple filters can be selected simultaneously using OR logic within categories and AND logic across categories (e.g., show WiFi Guest OR Tour leads that are Pending OR New). Active filters update the count display to show "Y of X" format and a "Clear Filters" button appears to reset all selections. Filter state is managed using React Sets with useMemo-based filtering for optimal performance. API endpoints: GET /api/admin/leads (fetches all leads in unified format), POST /api/leads/:type/:id/status (updates status for any lead type).

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