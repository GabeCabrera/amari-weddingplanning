# Wedding Calendar - Enterprise Feature Plan

## Vision
A beautiful, full-featured wedding planning calendar that syncs bidirectionally with Google Calendar. Couples can manage all wedding-related events, deadlines, vendor appointments, and milestones in one place - and have it automatically sync to their personal calendars.

---

## Feature Overview

### Core Capabilities
1. **Full Calendar Views** - Month, week, day, and agenda views
2. **Event Management** - Create, edit, delete, drag-and-drop events
3. **Google Calendar Sync** - Two-way sync with user's Google Calendar
4. **Smart Categories** - Auto-categorize events (vendor meetings, deadlines, fittings, etc.)
5. **Cross-Page Integration** - Pull data from other templates (tasks, vendor contacts, etc.)
6. **Countdown & Milestones** - Wedding countdown, key milestone tracking
7. **Shared Calendar** - Both partners see the same calendar
8. **Reminders & Notifications** - Email/push notifications for upcoming events

---

## Technical Architecture

### 1. Database Schema Additions

```sql
-- Calendar events table
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Event details
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  all_day BOOLEAN DEFAULT false,
  location TEXT,
  
  -- Categorization
  category TEXT NOT NULL DEFAULT 'other',
  -- Categories: 'vendor', 'deadline', 'appointment', 'milestone', 'personal', 'other'
  color TEXT DEFAULT 'blue',
  
  -- Related entities
  vendor_id TEXT, -- Links to vendor from budget page
  task_id TEXT, -- Links to task from task board
  
  -- Google Calendar sync
  google_event_id TEXT UNIQUE,
  google_calendar_id TEXT,
  sync_status TEXT DEFAULT 'local', -- 'local', 'synced', 'pending', 'conflict'
  last_synced_at TIMESTAMP WITH TIME ZONE,
  google_etag TEXT, -- For conflict detection
  
  -- Recurrence (for future)
  recurrence_rule TEXT, -- iCal RRULE format
  recurrence_id TEXT, -- For instances of recurring events
  
  -- Reminders
  reminders JSONB DEFAULT '[]', -- [{type: 'email', minutes: 60}, {type: 'popup', minutes: 30}]
  
  -- Metadata
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Google Calendar connections table
CREATE TABLE google_calendar_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- OAuth tokens
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Sync settings
  connected_calendar_id TEXT NOT NULL DEFAULT 'primary',
  sync_enabled BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_token TEXT, -- For incremental sync
  
  -- User info
  google_email TEXT,
  connected_at TIMESTAMP DEFAULT NOW(),
  connected_by UUID REFERENCES users(id)
);

-- Sync history for debugging
CREATE TABLE calendar_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'push', 'pull', 'conflict_resolved'
  event_id UUID REFERENCES calendar_events(id),
  google_event_id TEXT,
  status TEXT NOT NULL, -- 'success', 'failed', 'conflict'
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Google Calendar Integration

#### OAuth Flow
```
1. User clicks "Connect Google Calendar"
2. Redirect to Google OAuth consent screen
3. User grants access to calendar
4. Callback saves tokens to google_calendar_connections
5. Initial sync pulls existing events
6. Subsequent syncs are incremental
```

#### Required Google API Scopes
```
- https://www.googleapis.com/auth/calendar
- https://www.googleapis.com/auth/calendar.events
```

#### Sync Strategy
- **Push**: When user creates/edits event in Aisle → sync to Google
- **Pull**: Periodic background sync (webhook or polling) → update Aisle
- **Conflict Resolution**: Last-write-wins with user notification
- **Incremental Sync**: Use Google's syncToken for efficiency

### 3. File Structure

```
/app
  /api
    /calendar
      /events
        route.ts              # CRUD for events
        [eventId]/route.ts    # Single event operations
      /google
        /connect/route.ts     # OAuth initiation
        /callback/route.ts    # OAuth callback
        /disconnect/route.ts  # Revoke connection
        /sync/route.ts        # Manual sync trigger
        /webhook/route.ts     # Google push notifications
      
/lib
  /calendar
    google-client.ts         # Google API client wrapper
    sync-engine.ts           # Bidirectional sync logic
    event-mapper.ts          # Map between Aisle and Google event formats
    conflict-resolver.ts     # Handle sync conflicts
    
/components
  /calendar
    Calendar.tsx             # Main calendar component
    CalendarHeader.tsx       # Navigation, view switcher
    CalendarGrid.tsx         # Month/week grid
    EventCard.tsx            # Event display card
    EventModal.tsx           # Create/edit event modal
    EventQuickAdd.tsx        # Quick add popover
    GoogleCalendarConnect.tsx # Connection UI
    SyncStatus.tsx           # Sync indicator
    
/app/(planner)/planner/renderers
  CalendarRenderer.tsx       # Main renderer for calendar template
```

### 4. Component Architecture

#### CalendarRenderer (Main Component)
```tsx
interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end?: Date;
  allDay: boolean;
  location?: string;
  category: EventCategory;
  color: string;
  vendorId?: string;
  taskId?: string;
  googleEventId?: string;
  syncStatus: 'local' | 'synced' | 'pending' | 'conflict';
  reminders: Reminder[];
}

type EventCategory = 
  | 'vendor'      // Vendor meetings, appointments
  | 'deadline'    // Payment deadlines, decision deadlines
  | 'appointment' // Fittings, tastings, etc.
  | 'milestone'   // Engagement party, rehearsal dinner
  | 'personal'    // Personal events
  | 'other';

type CalendarView = 'month' | 'week' | 'day' | 'agenda';
```

### 5. UI/UX Design

#### Calendar Views

**Month View**
- Clean grid showing all days
- Events shown as colored bars
- Click day to see details or quick-add
- Drag events to reschedule

**Week View**
- Hour-by-hour timeline
- Events sized by duration
- Drag to adjust time/duration

**Day View**
- Detailed single-day view
- Full event details visible
- Hour blocks for scheduling

**Agenda View**
- List of upcoming events
- Grouped by day
- Great for mobile

#### Event Categories & Colors
```
Vendor Meetings    → Blue     #3B82F6
Deadlines          → Red      #EF4444
Appointments       → Purple   #8B5CF6
Milestones         → Gold     #F59E0B
Personal           → Green    #10B981
Other              → Gray     #6B7280
```

#### Google Calendar Sync UI
- Connection status indicator (green dot = synced)
- "Connect Google Calendar" button
- "Last synced: 2 minutes ago"
- Manual sync button
- Sync conflict notifications

### 6. Smart Features

#### Auto-Import from Other Pages
- **Task Board**: Tasks with due dates → calendar events
- **Vendor Contacts**: Generate "meeting" events
- **Budget**: Payment due dates → deadline events
- **Day-Of Schedule**: Import as all-day event

#### Smart Suggestions
- "You have a vendor meeting in 2 days but no follow-up scheduled"
- "Payment deadline coming up in 1 week"
- "Consider scheduling a tasting 3 months before wedding"

#### Wedding Countdown
- Days until wedding prominently displayed
- Key milestones leading up (100 days, 1 month, 1 week)

---

## Implementation Phases

### Phase 1: Core Calendar UI (Week 1)
- [ ] Database schema for calendar_events
- [ ] Basic CalendarRenderer component
- [ ] Month, week, day views
- [ ] Create/edit/delete events
- [ ] Event categories and colors
- [ ] Drag-and-drop rescheduling

### Phase 2: Google Calendar OAuth (Week 2)
- [ ] Set up Google Cloud project
- [ ] OAuth flow (connect/disconnect)
- [ ] Store tokens securely
- [ ] google_calendar_connections table
- [ ] Basic connection UI

### Phase 3: Two-Way Sync (Week 3)
- [ ] Push events to Google Calendar
- [ ] Pull events from Google Calendar
- [ ] Incremental sync with syncToken
- [ ] Conflict detection and resolution
- [ ] Sync status indicators

### Phase 4: Cross-Page Integration (Week 4)
- [ ] Import tasks with due dates
- [ ] Import vendor deadlines from budget
- [ ] Import day-of schedule
- [ ] Suggested events based on timeline

### Phase 5: Polish & Advanced Features (Week 5)
- [ ] Agenda view
- [ ] Mobile-responsive design
- [ ] Reminders/notifications
- [ ] Wedding countdown widget
- [ ] Export to PDF/print

---

## API Endpoints

### Events API
```
GET    /api/calendar/events              # List events (with date range)
POST   /api/calendar/events              # Create event
GET    /api/calendar/events/[id]         # Get single event
PUT    /api/calendar/events/[id]         # Update event
DELETE /api/calendar/events/[id]         # Delete event
POST   /api/calendar/events/[id]/sync    # Force sync single event
```

### Google Calendar API
```
GET    /api/calendar/google/connect      # Start OAuth flow
GET    /api/calendar/google/callback     # OAuth callback
POST   /api/calendar/google/disconnect   # Revoke connection
POST   /api/calendar/google/sync         # Trigger full sync
GET    /api/calendar/google/status       # Get sync status
POST   /api/calendar/google/webhook      # Google push notification receiver
```

---

## Environment Variables Needed

```env
# Google Calendar OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/calendar/google/callback

# Optional: Google Push Notifications
GOOGLE_WEBHOOK_SECRET=
```

---

## Libraries to Add

```json
{
  "dependencies": {
    "@fullcalendar/react": "^6.x",
    "@fullcalendar/daygrid": "^6.x",
    "@fullcalendar/timegrid": "^6.x",
    "@fullcalendar/interaction": "^6.x",
    "@fullcalendar/list": "^6.x",
    "googleapis": "^130.x",
    "date-fns": "^3.x",
    "date-fns-tz": "^3.x"
  }
}
```

---

## Security Considerations

1. **OAuth Tokens**: Store encrypted, refresh before expiry
2. **Tenant Isolation**: All queries scoped by tenant_id
3. **Rate Limiting**: Respect Google API quotas
4. **Webhook Verification**: Validate Google webhook signatures
5. **Token Refresh**: Handle expired tokens gracefully

---

## Success Metrics

- Calendar page load time < 500ms
- Sync latency < 5 seconds
- Zero data loss during sync
- Mobile responsive and usable
- User can manage full wedding timeline

---

## Decisions Made

1. ✅ **Dedicated Wedding Calendar** - Create a new calendar in Google called "{Names}'s Wedding" to keep wedding events separate from personal events
2. ✅ **Partner Sharing** - One partner connects Google, then shares calendar with the other via invite link (no need for both to OAuth)
3. ✅ **Google Notifications** - Rely on Google Calendar's built-in notification system, no need to build our own
4. 🔮 **Future**: Consider Apple Calendar / Outlook support later

---

## Next Steps

1. Review and approve this plan
2. Set up Google Cloud project and OAuth credentials
3. Begin Phase 1 implementation
