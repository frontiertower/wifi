# FrontierPortal Design Guidelines

## Design Approach

**Selected Framework:** Design System Approach using shadcn/ui + Tailwind CSS

**Rationale:** This is a utility-focused application where efficiency, trust, and clarity are paramount. Users need to quickly register for WiFi access, and administrators need efficient data management tools. The existing shadcn/ui system provides the professional polish and consistency needed for network infrastructure software.

**Design Principles:**
- **Clarity First:** Every step should be immediately understandable
- **Progressive Disclosure:** Show only what's needed at each step
- **Trust Through Consistency:** Professional, predictable interface builds confidence
- **Mobile-First:** Most users will register on their phones while connecting

## Typography System

**Font Family:** 
- Primary: Inter or DM Sans (Google Fonts)
- Fallback: system-ui, sans-serif

**Type Scale:**
- Hero/Page Titles: text-4xl to text-5xl, font-bold
- Section Headers: text-2xl to text-3xl, font-semibold
- Card Titles: text-xl, font-semibold
- Body Text: text-base, font-normal
- Helper Text: text-sm, font-normal
- Labels: text-sm, font-medium

**Line Heights:**
- Headlines: leading-tight
- Body: leading-relaxed
- Forms: leading-normal

## Layout System

**Spacing Primitives:** Use Tailwind units: 2, 4, 6, 8, 12, 16, 20, 24

**Container Strategy:**
- Portal Pages: max-w-md to max-w-lg (centered, mobile-optimized)
- Admin Dashboard: max-w-7xl (full workspace)
- Form Sections: p-6 to p-8 interior padding
- Card Spacing: gap-6 between cards, gap-4 within cards

**Grid System:**
- Admin Tables: Full-width responsive tables with horizontal scroll on mobile
- Dashboard Stats: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Form Layouts: Single column on mobile, max 2 columns on desktop for related fields

## Component Library

### Registration Portal

**Role Selection Cards:**
- Large, tappable cards in grid-cols-1 md:grid-cols-3 layout
- Each card: p-8, rounded-xl border, with icon (96px size), title, and 2-3 line description
- Hover state: subtle elevation with shadow-lg
- Selected state: thicker border with distinct treatment

**Form Containers:**
- Clean card with rounded-lg, border, p-6 to p-8
- Form sections separated by mb-6
- Field labels above inputs with mb-2
- Helper text below inputs in muted style

**Input Components:**
- Text inputs: h-11, px-4, rounded-md with focus rings
- Dropdowns: Same height as text inputs for alignment
- Phone/Email: Full-width with proper input types
- Checkbox/Radio: Larger touch targets (min-h-10)

**Event Selection:**
- Radio button list with card-style options
- Each event: p-4, rounded-lg, border, with event name, date, and description
- "Other Event" option triggers text input reveal
- Custom event input appears smoothly below selection

### Admin Dashboard

**Navigation:**
- Sidebar: w-64 on desktop, slide-out drawer on mobile
- Top bar: h-16 with breadcrumbs and user menu
- Tab navigation for sections (Users, Vouchers, Events)

**Data Tables:**
- Striped rows for readability (alternate row styling)
- Sticky header on scroll
- Action buttons: icon-only on mobile, icon+text on desktop
- Status badges: rounded-full px-3 py-1, uppercase text-xs

**Stats Cards:**
- Grid of 4 metric cards at top of dashboard
- Each card: p-6, with large number (text-3xl), label, and trend indicator
- Icon in corner (absolute positioning)

**Voucher Management:**
- Generate voucher interface: compact form with instant preview
- Voucher codes: monospace font, easy copy button
- Voucher list: table with code, type, uses, expiration, status

### Success & Redirect Flow

**Success Page:**
- Centered content with max-w-md
- Large success icon (checkmark, 120px)
- Headline confirming access granted
- Connection details (network name, duration)
- Auto-redirect countdown with progress indicator
- Manual "Continue" button as fallback

### Shared Components

**Buttons:**
- Primary: px-6 py-3, rounded-md, font-medium
- Secondary: variant with subtle background
- Icon buttons: square aspect ratio, p-2
- Loading states with spinner

**Cards:**
- Consistent rounded-lg with border
- Shadow only on hover for interactive cards
- Internal padding: p-4 to p-6

**Modals/Dialogs:**
- Centered overlay with max-w-lg
- Smooth fade + scale animation
- Clear close button in top-right

**Toast Notifications:**
- Bottom-right positioning
- Auto-dismiss after 5 seconds
- Success/error variants with appropriate icons

## Responsive Behavior

**Breakpoints:**
- Mobile: base (default)
- Tablet: md: (768px+)
- Desktop: lg: (1024px+)

**Mobile Optimizations:**
- Stack all multi-column layouts to single column
- Increase touch target sizes (min-h-12 for buttons)
- Full-width cards with reduced padding (p-4)
- Hamburger menu for admin navigation
- Tables scroll horizontally with sticky first column

**Desktop Enhancements:**
- Multi-column forms for efficiency
- Sidebar navigation always visible
- Hover states and tooltips
- Wider containers for data tables

## Images

**Hero Image:** 
- NOT recommended for portal pages (forms need immediate focus)
- Consider subtle abstract background pattern instead
- Admin dashboard: optional banner image in header (h-32, subtle opacity)

**Event Images:**
- Small thumbnail icons for event selection (64px × 64px)
- Position: left of event card content

**Success Page:**
- Illustrated success graphic or animated checkmark (recommended)
- Size: 200px × 200px, centered above text

**Branding:**
- Frontier Tower logo in top-left of all pages (h-8 to h-10)
- Favicon for browser tabs

## Interaction Patterns

**Form Progression:**
1. Role selection (3 large cards)
2. Form fields appear with slide-down animation
3. Validation on blur with inline error messages
4. Submit button disabled until valid
5. Loading state during submission
6. Success page with auto-redirect

**Admin Workflows:**
- Inline editing for quick updates
- Confirmation modals for destructive actions
- Bulk actions with checkbox selection
- Export data buttons for reports

**Micro-interactions:**
- Smooth transitions (duration-200 to duration-300)
- Focus rings on keyboard navigation
- Skeleton loaders during data fetch
- Optimistic UI updates where possible

## Accessibility Requirements

- All form inputs have associated labels
- Focus indicators on all interactive elements
- ARIA labels for icon-only buttons
- Keyboard navigation throughout
- Error messages announced to screen readers
- Sufficient contrast ratios (WCAG AA minimum)
- Skip navigation link for keyboard users

## Performance Considerations

- Lazy load admin dashboard heavy components
- Optimize table rendering for large datasets (virtual scrolling if >100 rows)
- Debounce search inputs
- Cache event data with react-query
- Minimize bundle size with code splitting