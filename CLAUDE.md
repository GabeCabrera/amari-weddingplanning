# Aisle - Wedding Planning SaaS

## Big Picture Architecture

Aisle is a multi-tenant wedding planning platform where each couple gets a personalized subdomain (`sarahandgabe.aisle.wedding`). The app is built with Next.js 14 (App Router), Vercel Postgres, and NextAuth.js.

### Core Domain Model
```
Tenant (couple's workspace) → Users (2 per tenant) → Planner → Pages (ordered) → Fields (editable data)
```

- **Tenant**: Represents a couple's wedding workspace. Identified by subdomain slug.
- **User**: Individual account linked to a tenant. Email + password auth.
- **Planner**: The couple's active wedding planner document.
- **Page**: A template instance (e.g., "Guest List", "Budget Tracker"). Orderable via `position` field.
- **Field**: Key-value storage for editable content within a page.

### Request Flow
1. Middleware extracts subdomain → resolves tenant
2. Auth checks user belongs to tenant
3. Pages render tenant-scoped data

## Project Structure
```
/app
  /(auth)           # Login, forgot-password, reset-password routes
  /(planner)        # Main planning interface
    /welcome        # Onboarding typewriter intro
    /templates      # Template marketplace
    /planner        # Page editor with drag-drop reordering
  /api              # API routes for CRUD operations
/components
  /ui               # Primitives (Button, Input, Dialog)
  /providers        # Auth provider
/lib
  /db               # Drizzle ORM schema and queries
    schema.ts       # Database schema (source of truth)
    queries.ts      # Query helpers
    index.ts        # DB connection
  /auth
    config.ts       # NextAuth configuration
  /templates
    registry.ts     # Template definitions
    validation.ts   # Page completion validation
  utils.ts          # Utility functions
/scripts
  create-tenant.ts  # Admin script to create couples
```

## CLEANUP NEEDED
The following files/directories are from a previous iteration and should be deleted:
- `/app/(app)/` - duplicate of /(planner), delete entire folder
- `/lib/auth.ts` - replaced by `/lib/auth/config.ts`
- `/types/next-auth.d.ts` - types now in auth config
- `/next.config.mjs` - replaced by `next.config.js`

## Key Files
- `lib/db/schema.ts` - Drizzle schema (source of truth for data model)
- `lib/templates/registry.ts` - Template definitions with fields, categories, filters
- `lib/auth/config.ts` - NextAuth configuration with type declarations
- `middleware.ts` - Subdomain parsing, tenant resolution
- `app/(planner)/planner/planner-editor.tsx` - Main planner editor

## Database (Vercel Postgres + Drizzle)
Run migrations: `pnpm db:push`
Generate types: `pnpm db:generate`
Studio: `pnpm db:studio`

### Important Patterns
- All queries are tenant-scoped. Never query without `tenantId` filter.
- Use `lib/db/queries.ts` helpers, not raw Drizzle in components.

## Authentication Flow
1. Admin creates tenant + generates temp password via `scripts/create-tenant.ts`
2. User receives onboarding email with subdomain URL
3. First login forces password change (`user.mustChangePassword` flag)
4. After password change, redirect to welcome if `tenant.onboardingComplete` is false
5. Welcome page shows typewriter intro, then marks onboarding complete

## Template System
Templates are defined in `lib/templates/registry.ts`:
```ts
{
  id: 'guest-list',
  name: 'Guest List',
  category: 'planning',
  timelineFilters: ['12-months', '6-months', '3-months'],
  icon: 'Users',
  suggestedInStarterPack: true,
  fields: [
    { key: 'guests', label: 'Guests', type: 'array', arrayItemSchema: [...] }
  ]
}
```

Pages store field data as JSONB. The `PageRenderer` component dynamically renders fields based on template definition.

## Completion Indicators
A page is "complete" when all required fields in its template are filled. Check via `lib/templates/validation.ts`. Incomplete pages show a pencil icon (✎) in the sidebar.

## Dev Commands
```bash
pnpm dev           # Start dev server (localhost:3000)
pnpm build         # Production build
pnpm db:push       # Push schema to database
pnpm db:studio     # Open Drizzle Studio
pnpm lint          # ESLint
pnpm typecheck     # TypeScript check
```

## Creating Tenants
```bash
npx tsx scripts/create-tenant.ts
```
Follow prompts to create a couple with their user accounts.

## Environment Variables
```
DATABASE_URL=        # Vercel Postgres connection string
NEXTAUTH_SECRET=     # Random string for session encryption
NEXTAUTH_URL=        # Base URL (https://aisle.wedding for prod)
```

## Conventions
- Use `cn()` from `lib/utils` for conditional classnames
- Prefer server components; use `'use client'` only when needed
- API routes return `{ data?, error? }` shape
- Toast notifications via `sonner`
- Forms use native form handling (no react-hook-form in current impl)

## Calendar Feature (Google Calendar Integration)
The wedding calendar is a full-featured planning calendar with bidirectional Google Calendar sync.

### Architecture
```
/lib/calendar
  google-client.ts    # Google OAuth & Calendar API wrapper
  sync-engine.ts      # Bidirectional sync logic
  index.ts            # Exports

/app/api/calendar
  /events             # CRUD for calendar events
    route.ts          # GET (list), POST (create)
    /[eventId]        # GET, PUT, DELETE single event
  /google
    /connect          # Initiate OAuth flow
    /callback         # OAuth callback, creates wedding calendar
    /disconnect       # Revoke connection
    /sync             # Manual sync trigger
    /status           # Connection status + share link
```

### Key Decisions
1. **Dedicated Wedding Calendar**: Creates a new calendar in Google (e.g., "Sarah & Gabe's Wedding") to keep events separate from personal calendars
2. **Partner Sharing**: One partner connects Google, shares calendar link with other partner (no dual OAuth needed)
3. **Google Notifications**: Relies on Google Calendar's notification system

### Database Tables
- `calendar_events` - Local event storage with Google sync metadata
- `google_calendar_connections` - OAuth tokens, calendar ID, sync state
- `calendar_sync_log` - Debugging sync operations

### Environment Variables for Google Calendar
```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/api/calendar/google/callback
```

## Multi-Tenant Subdomain Handling
In development, use `tenant-slug.localhost:3000`. Middleware parses subdomain from host header. For local testing of specific tenants, add entries to `/etc/hosts`:
```
127.0.0.1 sarahandgabe.localhost
```

## Design System
- Fonts: Cormorant Garamond (serif headings), Montserrat (body)
- Colors: Warm neutral palette (`warm-50` through `warm-900`)
- Styling: Minimal, elegant, lots of whitespace
- Animations: Subtle fade-ins via Framer Motion
