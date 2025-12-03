# Wedding Decision & Task System

## The Problem

The AI needs to understand:
1. **What needs to get done** to have a wedding
2. **What state each decision is in** (thinking → researching → decided → locked)
3. **When something is locked** and can't be changed
4. **What triggers a lock** (payment, signed contract, date passed)

---

## Decision States

Every major wedding decision goes through these states:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   NOT YET   │ ──▶ │ RESEARCHING │ ──▶ │   DECIDED   │ ──▶ │   LOCKED    │
│             │     │             │     │             │     │             │
│ Haven't     │     │ Looking at  │     │ Made choice │     │ Can't change│
│ started     │     │ options     │     │ but flexible│     │ committed   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                                   │
                                                                   ▼
                                                            Lock Triggers:
                                                            • Deposit paid
                                                            • Contract signed
                                                            • Date passed
                                                            • User confirms
```

---

## Lock Triggers

A decision becomes LOCKED when ANY of these happen:

| Trigger | Example |
|---------|---------|
| `deposit_paid` | Paid venue deposit |
| `contract_signed` | Signed photographer contract |
| `full_payment` | Paid in full |
| `date_passed` | Wedding date is in the past |
| `user_confirmed` | User explicitly said "lock this" |
| `dependent_locked` | Something else depends on this being fixed |

---

## The Master Checklist

These are ALL the decisions/tasks that go into a wedding, organized by category and typical timeline.

### PHASE 1: Foundation (12+ months out)
```
□ Set wedding date
□ Set budget
□ Choose wedding style/vibe
□ Create guest list (draft)
□ Book venue (ceremony)
□ Book venue (reception) - if different
□ Start dress/suit shopping
```

### PHASE 2: Core Vendors (9-12 months out)
```
□ Book photographer
□ Book videographer (if wanted)
□ Book caterer / decide on food
□ Book DJ/band
□ Book florist
□ Book officiant
□ Book wedding planner (if using)
```

### PHASE 3: Details (6-9 months out)
```
□ Book hair & makeup
□ Order wedding dress
□ Order suits/tuxes
□ Choose wedding party attire
□ Book transportation
□ Order invitations
□ Plan honeymoon
□ Book rehearsal dinner venue
□ Register for gifts
□ Order wedding cake
```

### PHASE 4: Refinement (3-6 months out)
```
□ Send save-the-dates
□ Finalize guest list
□ Plan ceremony details
□ Write vows (if custom)
□ Choose readings
□ Plan reception details
□ Create seating chart (draft)
□ Book hotel room blocks
□ Plan bachelor/bachelorette parties
□ Schedule dress fittings
□ Order wedding rings
```

### PHASE 5: Final Details (1-3 months out)
```
□ Send invitations
□ Finalize menu
□ Create day-of timeline
□ Finalize seating chart
□ Confirm all vendors
□ Get marriage license
□ Final dress fitting
□ Break in wedding shoes
□ Create playlist / do-not-play list
□ Write toasts (if giving)
□ Prepare tips/payments for vendors
□ Plan welcome bags (if doing)
```

### PHASE 6: Week Of
```
□ Confirm final headcount with caterer
□ Confirm timeline with all vendors
□ Pack for honeymoon
□ Prepare emergency kit
□ Rehearsal & rehearsal dinner
□ Get rest!
```

### PHASE 7: Post-Wedding
```
□ Return rentals
□ Preserve dress (if wanted)
□ Send thank you notes
□ Change name (if applicable)
□ Review/tip vendors
□ Get photos/video back
```

---

## Decision Data Model

```typescript
interface WeddingDecision {
  id: string;
  category: DecisionCategory;
  name: string;                    // "venue", "photographer", etc.
  displayName: string;             // "Wedding Venue"
  
  // State
  status: "not_started" | "researching" | "decided" | "locked";
  
  // The actual decision
  choice?: {
    name: string;                  // "The Grand Ballroom"
    vendor?: string;               // Vendor ID if applicable
    date?: string;                 // If it's a date decision
    amount?: number;               // If it has a cost
    notes?: string;
  };
  
  // Lock info
  lockedAt?: Date;
  lockReason?: LockReason;
  lockDetails?: string;            // "Paid $5000 deposit on 3/15"
  
  // Financials
  estimatedCost?: number;
  depositPaid?: number;
  depositPaidAt?: Date;
  totalPaid?: number;
  contractSigned?: boolean;
  contractSignedAt?: Date;
  
  // Timeline
  dueBy?: Date;                    // When this should be decided by
  decidedAt?: Date;
  
  // Relationships
  dependsOn?: string[];            // Other decisions this depends on
  blockedBy?: string[];            // What's preventing progress
}

type DecisionCategory = 
  | "foundation"      // Date, budget, vibe
  | "venue"           // Ceremony, reception
  | "vendors"         // Photo, video, catering, etc.
  | "attire"          // Dress, suits, accessories
  | "details"         // Decor, flowers, music
  | "logistics"       // Transport, hotels, timeline
  | "ceremony"        // Officiant, vows, readings
  | "reception"       // Food, cake, seating
  | "guests"          // List, invites, RSVPs
  | "honeymoon"       // Travel, accommodations
  | "legal"           // License, name change
  | "post_wedding";   // Thank yous, photos

type LockReason =
  | "deposit_paid"
  | "contract_signed"
  | "full_payment"
  | "date_passed"
  | "user_confirmed"
  | "dependent_locked"
  | "already_happened";
```

---

## AI Behavior Rules

### When to WARN before changing:
- Decision is in "decided" state
- Money has been discussed for this item
- Date is approaching

### When to REFUSE to change:
- Decision is "locked"
- Deposit has been paid
- Contract is signed
- Date has passed

### What to say:
```
User: "Actually, let's change the venue to somewhere else"

If DECIDED (not locked):
"You mentioned you'd decided on The Grand Ballroom. Are you sure you want 
to change that? I can help you look at other options if you'd like."

If LOCKED (deposit paid):
"The Grand Ballroom is locked in - you paid the $5,000 deposit on March 15th. 
If you're having second thoughts, you'd need to contact them about their 
cancellation policy. Would you like me to note that you want to look into this?"

If LOCKED (contract signed):
"You signed the contract with The Grand Ballroom on March 20th. This is a 
binding agreement, so changing would involve their cancellation terms. 
Is something wrong with the venue I can help with?"
```

---

## Default Checklist

When a new couple signs up, create these decisions automatically:

```typescript
const DEFAULT_DECISIONS = [
  // Foundation
  { name: "wedding_date", displayName: "Wedding Date", category: "foundation", required: true },
  { name: "budget", displayName: "Budget", category: "foundation", required: true },
  { name: "guest_count", displayName: "Guest Count", category: "foundation", required: true },
  { name: "style", displayName: "Wedding Style", category: "foundation", required: false },
  
  // Venue
  { name: "ceremony_venue", displayName: "Ceremony Venue", category: "venue", required: true },
  { name: "reception_venue", displayName: "Reception Venue", category: "venue", required: true },
  
  // Core Vendors
  { name: "photographer", displayName: "Photographer", category: "vendors", required: false },
  { name: "videographer", displayName: "Videographer", category: "vendors", required: false },
  { name: "caterer", displayName: "Caterer", category: "vendors", required: true },
  { name: "dj_band", displayName: "DJ / Band", category: "vendors", required: false },
  { name: "florist", displayName: "Florist", category: "vendors", required: false },
  { name: "officiant", displayName: "Officiant", category: "vendors", required: true },
  { name: "cake", displayName: "Wedding Cake", category: "vendors", required: false },
  
  // Attire
  { name: "wedding_dress", displayName: "Wedding Dress", category: "attire", required: false },
  { name: "suits", displayName: "Suits / Tuxedos", category: "attire", required: false },
  { name: "rings", displayName: "Wedding Rings", category: "attire", required: true },
  
  // Logistics
  { name: "transportation", displayName: "Transportation", category: "logistics", required: false },
  { name: "accommodations", displayName: "Guest Accommodations", category: "logistics", required: false },
  
  // Ceremony
  { name: "ceremony_music", displayName: "Ceremony Music", category: "ceremony", required: false },
  { name: "vows", displayName: "Vows", category: "ceremony", required: false },
  
  // Reception
  { name: "menu", displayName: "Menu", category: "reception", required: true },
  { name: "seating", displayName: "Seating Chart", category: "reception", required: false },
  { name: "first_dance", displayName: "First Dance Song", category: "reception", required: false },
  
  // Guests
  { name: "guest_list", displayName: "Guest List", category: "guests", required: true },
  { name: "invitations", displayName: "Invitations", category: "guests", required: true },
  
  // Legal
  { name: "marriage_license", displayName: "Marriage License", category: "legal", required: true },
  
  // Honeymoon
  { name: "honeymoon", displayName: "Honeymoon", category: "honeymoon", required: false },
];
```

---

## User Control

Users can:
1. **Add decisions** - "We also need to plan the after-party"
2. **Skip decisions** - "We're not doing a videographer"
3. **Manually lock** - "Lock this in, we're not changing it"
4. **Unlock (with warning)** - If not financially committed

The AI should:
1. Respect locked decisions completely
2. Warn before modifying "decided" items
3. Track what caused the lock
4. Never assume something is locked without evidence
5. Ask clarifying questions: "Have you signed anything with them yet?"
