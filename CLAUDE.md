# Aisle - AI-Powered Wedding Planning Platform

## Big Picture Architecture

Aisle is an AI-powered wedding planning platform where couples chat with an AI concierge that takes actions on their behalf. The AI manages budgets, guest lists, vendors, timelines, and decisions through natural conversation.

### Core Domain Model
```
Tenant (couple's workspace) → Users (2 per tenant) → Wedding Kernel (couple profile) → Pages (data storage)
```

- **Tenant**: Represents a couple's wedding workspace
- **User**: Individual account linked to a tenant. Email + password auth
- **Wedding Kernel**: Stores couple's profile, preferences, and planning context
- **Pages**: JSONB storage for structured data (budget items, guests, vendors, etc.)
- **Decisions**: Wedding planning decision tracker with lock capability

### Request Flow
1. User sends message to AI chat
2. AI analyzes message, extracts info for kernel, and calls tools
3. Tools execute actions (add guest, update budget, etc.)
4. AI responds with confirmation and optional artifact display

## Project Structure
```
/app
  /(auth)           # Login, forgot-password, reset-password routes
  /(chat)           # Main AI chat interface + tool modals
    /budget         # Budget overview (read-only view)
    /guests         # Guest list view
    /vendors        # Vendor tracking view
    /timeline       # Day-of schedule view
    /checklist      # Decision checklist view
    /settings       # Account settings
  /(onboarding)     # Plan selection, payment, welcome
  /api              # API routes
    /chat           # AI conversation endpoints
    /calendar       # Google Calendar integration
    /planner/data   # Data API for dashboard views
    /stripe         # Payment processing
/components
  /ui               # Primitives (Button, Input, Dialog)
  /layout           # AppShell with modal-based navigation
  /artifacts        # AI artifact renderers
  /providers        # Auth provider
/lib
  /db               # Drizzle ORM schema and queries
    schema.ts       # Database schema (source of truth)
    queries.ts      # Query helpers
  /auth
    config.ts       # NextAuth configuration
  /ai               # AI system
    tools.ts        # Tool definitions
    executor.ts     # Tool execution logic
    prompt.ts       # System prompt builder
    decisions.ts    # Decision tracking logic
  /calendar         # Google Calendar integration
  /hooks            # React hooks (usePlannerData)
```

## Key Files
- `lib/db/schema.ts` - Drizzle schema (source of truth for data model)
- `lib/ai/tools.ts` - AI tool definitions (budget, guests, vendors, etc.)
- `lib/ai/executor.ts` - Tool execution and database operations
- `lib/ai/prompt.ts` - System prompt with personality and instructions
- `lib/auth/config.ts` - NextAuth configuration
- `middleware.ts` - Route protection
- `app/(chat)/page.tsx` - Main chat interface

## Database (Vercel Postgres + Drizzle)
Run migrations: `pnpm db:push`
Generate types: `pnpm db:generate`
Studio: `pnpm db:studio`

### Important Patterns
- All queries are tenant-scoped. Never query without `tenantId` filter
- Use `lib/db/queries.ts` helpers, not raw Drizzle in components
- Data is stored in `pages` table as JSONB keyed by templateId

## AI System

### Tools
The AI has tools to take actions. Defined in `lib/ai/tools.ts`:
- **Budget**: add_budget_item, update_budget_item, delete_budget_item, set_total_budget
- **Guests**: add_guest, update_guest, delete_guest, add_guest_group, get_guest_list, get_guest_stats
- **RSVP**: create_rsvp_link, get_rsvp_link, get_rsvp_responses, sync_rsvp_responses
- **Vendors**: add_vendor, update_vendor_status, delete_vendor
- **Calendar**: add_event, add_day_of_event
- **Tasks**: add_task, complete_task, delete_task
- **Decisions**: update_decision, lock_decision, skip_decision, show_checklist
- **Display**: show_artifact, analyze_planning_gaps

### Wedding Kernel
Stores persistent context about the couple:
- Names, wedding date, location
- Budget, guest count
- Vibe/style preferences
- Communication style (emoji usage, formality, knowledge level)
- Decision history

### Artifacts
Visual displays triggered by `show_artifact` tool:
- budget_overview, guest_list, guest_stats
- timeline, calendar, vendor_list
- checklist, countdown, wedding_summary, planning_gaps

## Authentication Flow
1. User signs up or logs in
2. Choose plan (Free / Subscription)
3. Redirected to welcome page
4. Main chat interface becomes home

## Pricing Model
- **Free**: 10 AI messages, basic features
- **Aisle**: $12/month or $99/year (subscription via Stripe)
  - Unlimited AI planner
  - All features unlocked

## Google Calendar Integration
Located in `/lib/calendar/` and `/app/api/calendar/google/`:
- OAuth flow creates dedicated wedding calendar
- Bidirectional sync engine
- Partner sharing via calendar link

Environment variables:
```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/api/calendar/google/callback
```

## Dev Commands
```bash
pnpm dev           # Start dev server (localhost:3000)
pnpm build         # Production build
pnpm db:push       # Push schema to database
pnpm db:studio     # Open Drizzle Studio
pnpm lint          # ESLint
pnpm typecheck     # TypeScript check
```

## Environment Variables
```
DATABASE_URL=        # Vercel Postgres connection string
NEXTAUTH_SECRET=     # Random string for session encryption
NEXTAUTH_URL=        # Base URL
ANTHROPIC_API_KEY=   # Claude API key
STRIPE_SECRET_KEY=   # Stripe API key
STRIPE_PRICE_MONTHLY= # Stripe monthly price ID
STRIPE_PRICE_YEARLY=  # Stripe yearly price ID
```

## Conventions
- Use `cn()` from `lib/utils` for conditional classnames
- Prefer server components; use `'use client'` only when needed
- API routes return `{ data?, error? }` shape
- Toast notifications via `sonner`
- Mobile-first design approach

## Design System
- Fonts: System fonts (Apple system fonts on iOS/Mac)
- Colors: Warm neutral palette with rose accents
- Styling: Minimal, elegant, calming aesthetic
- Animations: Subtle, purposeful (typewriter, breathing logo)
