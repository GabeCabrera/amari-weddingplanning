# Aisle - Wedding Planning SaaS

A beautiful, minimalist wedding planning platform where each couple gets their own personalized subdomain.

## Features

- **Multi-tenant architecture**: Each couple gets `{names}.aisle.wedding`
- **Personalized onboarding**: Typewriter-style welcome experience
- **Template marketplace**: Choose from curated planning templates
- **Drag-and-drop pages**: Reorganize your planner however you like
- **Auto-saving**: Changes persist automatically
- **Completion tracking**: Visual indicators for in-progress pages
- **Secure authentication**: Per-user accounts with password reset

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Vercel Postgres (Neon) + Drizzle ORM
- **Auth**: NextAuth.js with credentials provider
- **Styling**: Tailwind CSS
- **Drag & Drop**: dnd-kit
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Vercel account (for Postgres)

### Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd aisle
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Set up Vercel Postgres:
   - Create a new Postgres database in your Vercel dashboard
   - Copy the `DATABASE_URL` to `.env.local`

5. Generate a NextAuth secret:
   ```bash
   openssl rand -base64 32
   ```
   Add this to `NEXTAUTH_SECRET` in `.env.local`

6. Push the database schema:
   ```bash
   pnpm db:push
   ```

7. Start the dev server:
   ```bash
   pnpm dev
   ```

### Creating Your First Tenant

Use the admin script to create a new couple:

```bash
npx tsx scripts/create-tenant.ts
```

This will prompt you for:
- Partner names
- Subdomain slug
- Email addresses
- Optional wedding date

It will output temporary passwords for each user.

### Local Subdomain Testing

To test subdomains locally, add entries to `/etc/hosts`:

```
127.0.0.1 sarahandgabe.localhost
```

Then visit `http://sarahandgabe.localhost:3000`

## Project Structure

```
/app
  /(auth)           # Login, password reset flows
  /(planner)        # Main planning interface
    /welcome        # Onboarding typewriter intro
    /templates      # Template marketplace
    /planner        # Page editor with drag-drop
  /api              # API routes
/components
  /ui               # Reusable UI components
  /providers        # Context providers
/lib
  /db               # Drizzle schema and queries
  /auth             # NextAuth configuration
  /templates        # Template definitions
/scripts            # Admin utilities
```

## Available Templates

- **Cover Page** - Personalized planner cover
- **Wedding Overview** - Key details at a glance
- **Budget Tracker** - Track estimated vs actual costs
- **Guest List** - RSVPs, meals, thank you cards
- **Vendor Contacts** - All your vendors in one place
- **Wedding Party** - Bridesmaids, groomsmen, special roles
- **Planning Timeline** - Checklist by time until wedding
- **Day-Of Schedule** - Hour-by-hour wedding day plan
- **Seating Chart** - Table assignments
- **Notes** - Free-form notes

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

### Custom Domain Setup

For production with custom subdomains:

1. Add a wildcard DNS record: `*.aisle.wedding` → Vercel
2. Configure the domain in Vercel dashboard
3. Update `NEXTAUTH_URL` to `https://aisle.wedding`

## Development Commands

```bash
pnpm dev           # Start dev server
pnpm build         # Production build
pnpm start         # Start production server
pnpm lint          # Run ESLint
pnpm typecheck     # TypeScript check
pnpm db:push       # Push schema to database
pnpm db:studio     # Open Drizzle Studio
pnpm db:generate   # Generate migrations
```

## License

<!-- Triggering rebuild -->
Private - All rights reserved
