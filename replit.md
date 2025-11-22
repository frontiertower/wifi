# Frontier Tower WiFi Portal

## Overview

Frontier Tower WiFi Portal is a captive portal application designed to manage WiFi access for a multi-tenant building, specifically supporting members, guests, and event attendees. It integrates with UniFi network controllers for user authorization and network usage tracking. The system features a user-facing registration portal that showcases AI projects (Omi.me, modelcontextprotocol-security.io, safemode.dev) and an administrative dashboard for comprehensive access management, event handling, and analytics. The project's core purpose is to provide a modern, efficient, and scalable WiFi access control solution, enhancing user experience and administrative oversight within an AI-focused environment.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

*   **Framework**: React 18 with TypeScript, using Vite.
*   **UI Component System**: shadcn/ui built on Radix UI and Tailwind CSS, adhering to a "new-york" style.
*   **Design Philosophy**: Mobile-first, progressive disclosure, focusing on clarity and trust with Inter or DM Sans fonts and a neutral color scheme.
*   **State Management**: TanStack Query for server state, React Hook Form with Zod for form management.
*   **Routing**: Wouter for client-side routing, distinguishing between public portal, events, past events, and admin dashboard.

### Backend Architecture

*   **Runtime**: Node.js with Express.js.
*   **API Design**: RESTful endpoints including role-specific registration and administrative routes.
*   **Session Management**: Express session middleware with a PostgreSQL-backed store.
*   **Network Integration**: Mock UniFi controller service for simulating guest authorization, supporting both modern and legacy UniFi API specifications.

### Data Storage

*   **Database**: PostgreSQL via Neon's serverless driver.
*   **ORM**: Drizzle ORM with TypeScript schema definitions.
*   **Schema Design**: Includes tables for admin users, captive WiFi users, events, bookings, tour bookings, event host bookings, membership applications, chat invite requests, user sessions, directory listings (supporting company, community, and person types with communityName and parentCommunityId fields for hierarchical organization), and UniFi configuration settings.
*   **Validation**: Drizzle-Zod integration for consistent schema validation.

### UI/UX Decisions

*   **Admin Dashboard**: Mobile-optimized with sticky navigation, responsive data tables, stat cards, and form layouts. Tab-based navigation includes Analytics, Users, Events, Bookings, Directory, and Settings tabs with hash-based routing (e.g., /admin#directory). The Analytics tab includes a 2D building visualization map showing user distribution across all 14 floors.
*   **Theming**: Full dark mode support with automatic time-based switching. Dark mode is automatically enabled after 6pm and light mode after 6am. Users can manually override the theme at any time using the theme toggle, and their preference is saved.
*   **Analytics**: Comprehensive dashboard with lifetime and daily counters, featuring a 4 AM daily reset.
*   **Badges**: Colored role-type badges for members, guests, and events in the admin dashboard.
*   **Directory UI**: Gear icon-only admin button positioned top-right next to theme toggle. Expandable listing cards with logos, descriptions, and edit buttons in expanded view. Responsive layout: single-column horizontal cards on desktop (descriptions visible inline), vertical compact cards on mobile (descriptions shown on expand). Floor/office sorting: hierarchical two-level sort by floor number first, then office number within each floor. Filter buttons allow filtering by listing type: All, Companies, Communities, or People.
*   **Admin Directory Management**: Full CRUD directory management integrated as a tab in the admin dashboard. Features inline editing (click Edit → modify fields → Save/Cancel), delete with confirmation dialog, and "Add New Listing" button. All directory fields editable including LinkedIn URL and Twitter handle. Accessible via /admin#directory.

### Technical Implementations

*   **Hero Section & Branding**: Portal homepage highlights AI, Agents, and LLMs focus.
*   **External Events Feed Integration**: API endpoint `/api/external-events` proxies Luma events from an external timeline service. An admin endpoint `/api/admin/events/sync` automatically syncs events from this feed with idempotent upserts and includes automatic cleanup of duplicate events without URLs. URL extraction logic uses regex to capture Luma URLs from event descriptions (both `lu.ma` and `luma.com` formats) since the external API embeds URLs in description text rather than providing a separate URL field. The sync process automatically deletes events without Luma URLs before syncing new events to maintain data quality.
*   **UniFi Captive Portal Compliance**: Correctly implements UniFi External Captive Portal specification with redirect-based authorization, MAC address extraction, and dual-path API support.
*   **UniFi Configuration**: Dedicated settings tab in admin dashboard for UniFi controller integration.
*   **Event Management**: AI-powered bulk event import using OpenAI GPT-4o. Public events page displays upcoming and past events, with Luma integration for event URLs. Event images are downloaded from external sources and saved locally to `/uploads/events` for better performance and reliability. Image download system includes comprehensive security controls: streaming with size limits (10MB max), file signature validation (JPEG, PNG, GIF, WebP), abort controller for timeout protection (30s max), and production-ready error handling. All event images are served via secure Express routes with path traversal protection. Events use soft delete architecture with an `isHidden` field - deleted events are marked hidden instead of permanently removed, allowing admins to see deletion history. Hidden events display grayed out with a "Hidden" badge and disabled Details button in the admin dashboard.
*   **Daily Counters**: Atomic SQL upserts for daily guest registration counts.
*   **Unified Guest Form**: Combines guest registration types (Tower Member, Guest of a Member, Guest at Event) into a single progressive disclosure form with conditional fields and multi-step password verification. Flow progression: Form → Password Screen → Congratulations Page. Supports dual default passwords ("makesomething" and "frontiertower995") when no custom admin password is set. Error recovery preserves form data and allows password retry without data loss. Tower Member option includes floor selection dropdown populated from directory listings.
*   **Booking System**: A `/booking` route allows users to book events/meetings, supporting both existing events and custom events, with comprehensive organizer details and multi-layer validation.
*   **Tour Booking System**: A `/tour` route enables visitors to schedule building tours with date/time selection, contact information, and optional private office inquiry. Features conditional form fields that appear when users express interest in private office spaces, including number of people input with Zod validation refinement.
*   **Building Directory**: A `/directory` route displays all building tenants (companies, communities, and individuals) with location (floor/office) and contact information (phone, email, telegram, website). Features filter buttons to show all listings or filter by type (Companies, Communities, People). Each listing can be associated with a parent community for hierarchical organization. A `/addlisting` form allows users to add new directory entries (company, community, or person) with a dropdown to select parent community, all with backend validation ensuring data integrity.
*   **Unique Edit URLs**: Each directory listing has a unique slug-based edit URL (e.g., `/directory/edit/makerspace`) derived from the listing name. Slugs are generated by converting names to lowercase, removing special characters, and replacing spaces with hyphens. Edit links appear in expanded directory cards.
*   **Membership Inquiry System**: A `/apply-to-join` route enables prospective members to submit membership inquiries with comprehensive contact and professional information. The form collects name, email, phone (required), plus optional fields for Telegram, LinkedIn, company, and website. Inquiries are stored with a "pending" status for admin review. Features full validation on both frontend and backend, success toast notifications, and automatic redirect after submission.
*   **Chat Invite Request System**: A `/chat` route allows visitors to request an invitation to the Frontier Tower Telegram community. The form collects name, phone, email (all required), and LinkedIn (optional). All requests are stored in the database and trigger automated email notifications to events@thefrontiertower.com with the requester's details and the Telegram invite link (https://t.me/+M0KxFTd3LnJkNzky). Email notifications are non-blocking and use the Resend integration.
*   **Email Notifications**: Integrated with Resend for transactional emails. All booking and application submissions (tour bookings, membership applications, chat invite requests) automatically send detailed email notifications to events@thefrontiertower.com. Email service uses dynamic imports and non-blocking async operations with error logging.
*   **Member Authentication**: OAuth 2.0 integration with Frontier Tower authentication server (api.berlinhouse.com) for member login. Implements PKCE flow for enhanced security, automatic token refresh, cookie-based session management, and user info retrieval. Member Login button in header shows authentication state and user info when logged in. Requires FT_OAUTH_CLIENT_ID, FT_OAUTH_CLIENT_SECRET, and FT_OAUTH_REDIRECT_URI environment variables.

## External Dependencies

*   **UI Component Libraries**: Radix UI, shadcn/ui, Lucide React, embla-carousel-react, cmdk.
*   **Form Management**: React Hook Form, @hookform/resolvers, Zod.
*   **Database & ORM**: @neondatabase/serverless, Drizzle ORM, drizzle-zod, connect-pg-simple.
*   **Styling**: Tailwind CSS, class-variance-authority, clsx, tailwind-merge.
*   **Development Tools**: Vite, TypeScript, ESBuild.
*   **Date & Time**: date-fns.
*   **Network Integration**: UniFi Controller API (mocked).
*   **AI Integration**: OpenAI GPT-4o (via Replit AI Integrations) for event parsing.
*   **Email Service**: Resend (via Replit connectors) for transactional email notifications.