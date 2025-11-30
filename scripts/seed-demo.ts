// Demo Account Seeder
// Creates a fully populated demo account for screenshots and demos
// Run with: npx tsx scripts/seed-demo.ts

// Load environment variables FIRST before any other imports
import "dotenv/config";
import { resolve } from "path";
import { config } from "dotenv";
config({ path: resolve(process.cwd(), ".env.local") });

import { db } from "../lib/db";
import { tenants, users, planners, pages } from "../lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const DEMO_EMAIL = "demo@aisleboard.com";
const DEMO_PASSWORD = "demo1234";
const DEMO_SLUG = "emma-james-demo";

// Wedding date: 6 months from now
const weddingDate = new Date();
weddingDate.setMonth(weddingDate.getMonth() + 6);
weddingDate.setHours(16, 0, 0, 0); // 4 PM

async function seedDemo() {
  console.log("🌱 Seeding demo account...\n");

  // Check if demo account already exists
  const existingTenant = await db.query.tenants.findFirst({
    where: eq(tenants.slug, DEMO_SLUG),
  });

  if (existingTenant) {
    console.log("⚠️  Demo account already exists. Deleting and recreating...\n");
    
    // Find and delete planner pages first
    const existingPlanner = await db.query.planners.findFirst({
      where: eq(planners.tenantId, existingTenant.id),
    });
    
    if (existingPlanner) {
      await db.delete(pages).where(eq(pages.plannerId, existingPlanner.id));
      await db.delete(planners).where(eq(planners.id, existingPlanner.id));
    }
    
    // Delete user
    await db.delete(users).where(eq(users.tenantId, existingTenant.id));
    
    // Delete tenant
    await db.delete(tenants).where(eq(tenants.id, existingTenant.id));
    
    console.log("✓ Old demo account deleted\n");
  }

  // 1. Create tenant
  console.log("Creating tenant...");
  const [tenant] = await db
    .insert(tenants)
    .values({
      slug: DEMO_SLUG,
      displayName: "Emma & James",
      weddingDate: weddingDate,
      plan: "complete", // Full access
      onboardingComplete: true,
    })
    .returning();

  console.log(`✓ Tenant created: ${tenant.displayName} (${tenant.slug})`);

  // 2. Create user
  console.log("Creating user...");
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const [user] = await db
    .insert(users)
    .values({
      tenantId: tenant.id,
      email: DEMO_EMAIL,
      passwordHash,
      name: "Emma",
      role: "owner",
      mustChangePassword: false,
    })
    .returning();

  console.log(`✓ User created: ${user.email}`);

  // 3. Create planner
  console.log("Creating planner...");
  const [planner] = await db
    .insert(planners)
    .values({
      tenantId: tenant.id,
    })
    .returning();

  console.log(`✓ Planner created`);

  // 4. Create pages with demo data
  console.log("Creating pages with demo data...\n");

  const demoPages = [
    // Cover Page
    {
      templateId: "cover",
      title: "Cover Page",
      position: 0,
      fields: {
        names: "Emma & James",
        weddingDate: weddingDate.toISOString().split("T")[0],
      },
    },

    // Overview
    {
      templateId: "overview",
      title: "Wedding Overview",
      position: 1,
      fields: {
        ceremonyVenue: "St. Mary's Chapel",
        ceremonyAddress: "1234 Church Lane, Napa Valley, CA 94558",
        ceremonyTime: "4:00 PM",
        receptionVenue: "Vineyard Estate",
        receptionAddress: "5678 Wine Country Road, Napa Valley, CA 94558",
        receptionTime: "6:00 PM",
        theme: "Romantic Garden",
        colorPalette: [
          { color: "Sage Green", hex: "#9CAF88" },
          { color: "Dusty Rose", hex: "#DCAE96" },
          { color: "Ivory", hex: "#FFFFF0" },
          { color: "Gold", hex: "#D4AF37" },
        ],
        emergencyContacts: [
          { name: "Sarah Mitchell", role: "Maid of Honor", phone: "(555) 123-4567" },
          { name: "Michael Chen", role: "Best Man", phone: "(555) 234-5678" },
          { name: "Lisa Rodriguez", role: "Wedding Planner", phone: "(555) 345-6789" },
        ],
        notes: "Remember to confirm final headcount with caterer 2 weeks before!",
      },
    },

    // Budget
    {
      templateId: "budget",
      title: "Budget Tracker",
      position: 2,
      fields: {
        totalBudget: 45000,
        items: [
          { category: "Venue", vendor: "Vineyard Estate", totalCost: 12000, amountPaid: 6000, notes: "Includes ceremony & reception" },
          { category: "Catering", vendor: "Farm to Table Catering", totalCost: 8500, amountPaid: 4250, notes: "120 guests @ $70/person" },
          { category: "Photography", vendor: "Capture the Moment", totalCost: 4500, amountPaid: 2250, notes: "8 hours + engagement shoot" },
          { category: "Videography", vendor: "Cinematic Weddings", totalCost: 3000, amountPaid: 1500, notes: "Full day + highlight reel" },
          { category: "Florist", vendor: "Blooming Beautiful", totalCost: 3500, amountPaid: 1750, notes: "Bouquets, centerpieces, arch" },
          { category: "Music / DJ", vendor: "DJ Mike", totalCost: 1800, amountPaid: 900, notes: "Ceremony + 5hr reception" },
          { category: "Wedding Attire", vendor: "Bella Bridal", totalCost: 2800, amountPaid: 2800, notes: "Dress + alterations" },
          { category: "Hair & Makeup", vendor: "Glam Squad", totalCost: 800, amountPaid: 400, notes: "Bride + 4 bridesmaids" },
          { category: "Invitations & Stationery", vendor: "Paper & Ink Co", totalCost: 600, amountPaid: 600, notes: "Save the dates, invites, programs" },
          { category: "Wedding Cake", vendor: "Sweet Celebrations", totalCost: 700, amountPaid: 350, notes: "3-tier vanilla with buttercream" },
          { category: "Decorations", vendor: "Various", totalCost: 1500, amountPaid: 800, notes: "Lighting, linens, signage" },
          { category: "Transportation", vendor: "Luxury Limos", totalCost: 800, amountPaid: 400, notes: "Vintage car for couple" },
          { category: "Officiant", vendor: "Rev. Johnson", totalCost: 500, amountPaid: 250, notes: "Includes rehearsal" },
          { category: "Wedding Rings", vendor: "Forever Diamonds", totalCost: 2500, amountPaid: 2500, notes: "Both bands" },
          { category: "Favors & Gifts", vendor: "Local Winery", totalCost: 400, amountPaid: 400, notes: "Mini wine bottles" },
          { category: "Honeymoon", vendor: "Travel Agency", totalCost: 6000, amountPaid: 3000, notes: "Bali - 10 nights" },
        ],
      },
    },

    // Guest List
    {
      templateId: "guest-list",
      title: "Guest List",
      position: 3,
      fields: {
        guests: [
          { name: "Robert & Mary Thompson", email: "thompson@email.com", phone: "(555) 111-1111", address: "123 Oak St, San Francisco, CA", rsvp: true, meal: "Beef", giftReceived: true, thankYouSent: true },
          { name: "David Chen", email: "dchen@email.com", phone: "(555) 222-2222", address: "456 Pine Ave, Oakland, CA", rsvp: true, meal: "Chicken", giftReceived: true, thankYouSent: false },
          { name: "Jennifer & Mark Wilson", email: "wilsons@email.com", phone: "(555) 333-3333", address: "789 Elm Dr, Berkeley, CA", rsvp: true, meal: "Vegetarian", giftReceived: false, thankYouSent: false },
          { name: "Amanda Foster", email: "afoster@email.com", phone: "(555) 444-4444", address: "321 Maple Ln, Palo Alto, CA", rsvp: true, meal: "Fish", giftReceived: true, thankYouSent: true },
          { name: "Thomas & Lisa Garcia", email: "garcias@email.com", phone: "(555) 555-5555", address: "654 Cedar Rd, San Jose, CA", rsvp: false, meal: "", giftReceived: false, thankYouSent: false },
          { name: "Sarah Mitchell", email: "smitchell@email.com", phone: "(555) 123-4567", address: "111 First St, Napa, CA", rsvp: true, meal: "Chicken", giftReceived: true, thankYouSent: true },
          { name: "Michael Chen", email: "mchen@email.com", phone: "(555) 234-5678", address: "222 Second St, Napa, CA", rsvp: true, meal: "Beef", giftReceived: true, thankYouSent: true },
          { name: "Emily & John Davis", email: "davis@email.com", phone: "(555) 666-6666", address: "777 Birch Blvd, Sonoma, CA", rsvp: true, meal: "Chicken", giftReceived: false, thankYouSent: false },
          { name: "Rachel Kim", email: "rkim@email.com", phone: "(555) 777-7777", address: "888 Walnut Way, SF, CA", rsvp: true, meal: "Vegetarian", giftReceived: true, thankYouSent: false },
          { name: "Christopher & Anna Lee", email: "lees@email.com", phone: "(555) 888-8888", address: "999 Spruce St, Oakland, CA", rsvp: true, meal: "Beef", giftReceived: false, thankYouSent: false },
          { name: "Jessica Brown", email: "jbrown@email.com", phone: "(555) 999-9999", address: "101 Aspen Ave, Berkeley, CA", rsvp: true, meal: "Fish", giftReceived: true, thankYouSent: true },
          { name: "Daniel & Maria Rodriguez", email: "rodriguez@email.com", phone: "(555) 101-0101", address: "202 Palm Dr, San Jose, CA", rsvp: true, meal: "Chicken", giftReceived: false, thankYouSent: false },
          { name: "Aunt Patricia", email: "patriciat@email.com", phone: "(555) 111-2222", address: "303 Olive St, LA, CA", rsvp: true, meal: "Beef", giftReceived: true, thankYouSent: true },
          { name: "Uncle George & Aunt Helen", email: "ghelenw@email.com", phone: "(555) 333-4444", address: "404 Vine Rd, San Diego, CA", rsvp: true, meal: "Chicken", giftReceived: true, thankYouSent: false },
          { name: "Grandma Rose", email: "", phone: "(555) 555-6666", address: "505 Garden Ln, Napa, CA", rsvp: true, meal: "Fish", giftReceived: true, thankYouSent: true },
        ],
      },
    },

    // Vendor Contacts
    {
      templateId: "vendor-contacts",
      title: "Vendor Contacts",
      position: 4,
      fields: {
        vendors: [
          { service: "Venue Coordinator", company: "Vineyard Estate - Laura", phone: "(555) 100-1000", email: "laura@vineyardestate.com", depositPaid: true },
          { service: "Catering", company: "Farm to Table - Chef Marco", phone: "(555) 100-2000", email: "marco@farmtotable.com", depositPaid: true },
          { service: "Photography", company: "Capture the Moment - Alex", phone: "(555) 100-3000", email: "alex@capturemoment.com", depositPaid: true },
          { service: "Videography", company: "Cinematic Weddings - Ryan", phone: "(555) 100-4000", email: "ryan@cinematicwed.com", depositPaid: true },
          { service: "Florist", company: "Blooming Beautiful - Rose", phone: "(555) 100-5000", email: "rose@bloomingbeautiful.com", depositPaid: true },
          { service: "DJ", company: "DJ Mike", phone: "(555) 100-6000", email: "djmike@music.com", depositPaid: true },
          { service: "Hair & Makeup", company: "Glam Squad - Tiffany", phone: "(555) 100-7000", email: "tiffany@glamsquad.com", depositPaid: true },
          { service: "Officiant", company: "Rev. Johnson", phone: "(555) 100-8000", email: "revjohnson@email.com", depositPaid: true },
          { service: "Cake", company: "Sweet Celebrations - Amy", phone: "(555) 100-9000", email: "amy@sweetcelebrations.com", depositPaid: true },
          { service: "Transportation", company: "Luxury Limos - Carlos", phone: "(555) 100-1100", email: "carlos@luxurylimos.com", depositPaid: true },
        ],
      },
    },

    // Wedding Party
    {
      templateId: "wedding-party",
      title: "Wedding Party",
      position: 5,
      fields: {
        bridesmaids: [
          { name: "Sarah Mitchell", role: "Maid of Honor", email: "smitchell@email.com", phone: "(555) 123-4567" },
          { name: "Rachel Kim", role: "Bridesmaid", email: "rkim@email.com", phone: "(555) 777-7777" },
          { name: "Jessica Brown", role: "Bridesmaid", email: "jbrown@email.com", phone: "(555) 999-9999" },
          { name: "Amanda Foster", role: "Bridesmaid", email: "afoster@email.com", phone: "(555) 444-4444" },
        ],
        groomsmen: [
          { name: "Michael Chen", role: "Best Man", email: "mchen@email.com", phone: "(555) 234-5678" },
          { name: "David Chen", role: "Groomsman", email: "dchen@email.com", phone: "(555) 222-2222" },
          { name: "Christopher Lee", role: "Groomsman", email: "clee@email.com", phone: "(555) 888-8888" },
          { name: "Daniel Rodriguez", role: "Groomsman", email: "drodriguez@email.com", phone: "(555) 101-0101" },
        ],
        others: [
          { name: "Lily Thompson", role: "Flower Girl", email: "", phone: "(555) 111-1111" },
          { name: "Max Wilson", role: "Ring Bearer", email: "", phone: "(555) 333-3333" },
          { name: "Grandma Rose", role: "Scripture Reader", email: "", phone: "(555) 555-6666" },
        ],
      },
    },

    // Day-Of Schedule
    {
      templateId: "day-of-schedule",
      title: "Day-Of Schedule",
      position: 6,
      fields: {
        events: [
          { time: "10:00 AM", event: "Hair & makeup begins for bridal party" },
          { time: "11:00 AM", event: "Photographer arrives at bridal suite" },
          { time: "12:00 PM", event: "Light lunch for bridal party" },
          { time: "1:00 PM", event: "Groom & groomsmen begin getting ready" },
          { time: "2:00 PM", event: "First look photos (optional)" },
          { time: "2:30 PM", event: "Wedding party photos" },
          { time: "3:00 PM", event: "Family photos" },
          { time: "3:30 PM", event: "Guests begin arriving" },
          { time: "4:00 PM", event: "Ceremony begins" },
          { time: "4:30 PM", event: "Ceremony ends" },
          { time: "4:45 PM", event: "Cocktail hour begins" },
          { time: "5:00 PM", event: "Couple photos during golden hour" },
          { time: "5:45 PM", event: "Guests move to reception" },
          { time: "6:00 PM", event: "Grand entrance & first dance" },
          { time: "6:15 PM", event: "Welcome toast & dinner service" },
          { time: "7:30 PM", event: "Speeches & toasts" },
          { time: "8:00 PM", event: "Cake cutting" },
          { time: "8:15 PM", event: "Parent dances" },
          { time: "8:30 PM", event: "Open dancing begins" },
          { time: "10:30 PM", event: "Last dance" },
          { time: "10:45 PM", event: "Sparkler exit" },
          { time: "11:00 PM", event: "Event ends" },
        ],
      },
    },

    // Music & Playlist
    {
      templateId: "music-playlist",
      title: "Music & Playlist",
      position: 7,
      fields: {
        firstDanceSong: "Perfect",
        firstDanceArtist: "Ed Sheeran",
        parentDance1Song: "My Wish",
        parentDance1Artist: "Rascal Flatts",
        parentDance2Song: "What a Wonderful World",
        parentDance2Artist: "Louis Armstrong",
        cakeCuttingSong: "Sugar",
        lastDanceSong: "Don't Stop Believin'",
        guestArrivalMusic: "Acoustic covers playlist",
        processionalSong: "Canon in D",
        brideEntranceSong: "A Thousand Years - Christina Perri",
        recessionalSong: "Signed, Sealed, Delivered",
        mustPlaySongs: [
          { song: "Uptown Funk", artist: "Bruno Mars", notes: "Dance floor opener" },
          { song: "September", artist: "Earth, Wind & Fire", notes: "" },
          { song: "Dancing Queen", artist: "ABBA", notes: "Bride's request" },
          { song: "Sweet Caroline", artist: "Neil Diamond", notes: "Family tradition" },
          { song: "I Gotta Feeling", artist: "Black Eyed Peas", notes: "" },
          { song: "Shut Up and Dance", artist: "Walk the Moon", notes: "" },
          { song: "Love Story", artist: "Taylor Swift", notes: "" },
        ],
        doNotPlaySongs: [
          { song: "Cha Cha Slide", artist: "DJ Casper", reason: "Overplayed" },
          { song: "Macarena", artist: "Los del Río", reason: "Too cheesy" },
          { song: "Cotton Eye Joe", artist: "Rednex", reason: "Just no" },
        ],
        djNotes: "Keep energy high but mix in some slower songs for older guests. Announce last call for requests at 10 PM.",
      },
    },

    // Ceremony Script
    {
      templateId: "ceremony-script",
      title: "Ceremony Script",
      position: 8,
      fields: {
        officiantName: "Rev. Michael Johnson",
        ceremonyStyle: "Non-denominational",
        estimatedLength: "30 minutes",
        elements: [
          { element: "Welcome & Opening", person: "Officiant", content: "Welcome family and friends", duration: "3 min" },
          { element: "Reading", person: "Grandma Rose", content: "1 Corinthians 13:4-8", duration: "2 min" },
          { element: "Reading", person: "Sarah Mitchell", content: "Union by Robert Fulghum", duration: "2 min" },
          { element: "Vows - Partner 1", person: "Emma", content: "Personal vows", duration: "2 min" },
          { element: "Vows - Partner 2", person: "James", content: "Personal vows", duration: "2 min" },
          { element: "Ring Exchange", person: "Both", content: "Traditional ring exchange", duration: "3 min" },
          { element: "Unity Candle", person: "Both", content: "Lighting the unity candle together", duration: "3 min" },
          { element: "Pronouncement", person: "Officiant", content: "I now pronounce you...", duration: "1 min" },
          { element: "First Kiss", person: "Both", content: "", duration: "1 min" },
          { element: "Closing & Introduction", person: "Officiant", content: "Mr. & Mrs. announcement", duration: "1 min" },
        ],
        partner1Vows: "James, from the moment I met you, I knew my life would never be the same. You make every ordinary day extraordinary. I promise to love you, support you, and laugh with you for all the days of our lives. I choose you today, tomorrow, and always.",
        partner2Vows: "Emma, you are my best friend, my partner, and my home. I promise to cherish every moment with you, to hold your hand through life's adventures, and to love you more each day. You are my everything, and I can't wait to spend forever with you.",
        readings: [
          { title: "Love is Patient", author: "1 Corinthians 13:4-8", reader: "Grandma Rose", text: "Love is patient, love is kind. It does not envy, it does not boast..." },
          { title: "Union", author: "Robert Fulghum", reader: "Sarah Mitchell", text: "You have known each other from the first glance of acquaintance to this point of commitment..." },
        ],
        notes: "Keep tissues handy! Remember to pause for photos after the kiss.",
      },
    },

    // Seating Chart
    {
      templateId: "seating-chart",
      title: "Seating Chart",
      position: 9,
      fields: {
        tables: [
          { tableNumber: 1, guests: [
            { name: "Emma" }, { name: "James" }, { name: "Sarah Mitchell" }, { name: "Michael Chen" }, { name: "Rachel Kim" }, { name: "David Chen" }
          ]},
          { tableNumber: 2, guests: [
            { name: "Robert Thompson" }, { name: "Mary Thompson" }, { name: "Aunt Patricia" }, { name: "Uncle George" }, { name: "Aunt Helen" }, { name: "Grandma Rose" }
          ]},
          { tableNumber: 3, guests: [
            { name: "Jennifer Wilson" }, { name: "Mark Wilson" }, { name: "Emily Davis" }, { name: "John Davis" }, { name: "Anna Lee" }, { name: "Christopher Lee" }
          ]},
          { tableNumber: 4, guests: [
            { name: "Amanda Foster" }, { name: "Jessica Brown" }, { name: "Daniel Rodriguez" }, { name: "Maria Rodriguez" }, { name: "Thomas Garcia" }, { name: "Lisa Garcia" }
          ]},
        ],
      },
    },

    // Honeymoon Planner
    {
      templateId: "honeymoon-planner",
      title: "Honeymoon Planner",
      position: 10,
      fields: {
        destination: "Bali, Indonesia",
        departureDate: new Date(weddingDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        returnDate: new Date(weddingDate.getTime() + 12 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        budget: 6000,
        flights: [
          { airline: "Singapore Airlines", flightNumber: "SQ 1234", departure: "SFO 11:00 PM", arrival: "SIN 6:00 AM +1", date: "", confirmationCode: "ABC123" },
          { airline: "Singapore Airlines", flightNumber: "SQ 5678", departure: "SIN 8:00 AM", arrival: "DPS 10:30 AM", date: "", confirmationCode: "ABC123" },
        ],
        accommodations: [
          { name: "Four Seasons Resort Bali at Sayan", checkIn: "", checkOut: "", confirmationCode: "FS789456", address: "Sayan, Ubud, Bali 80571" },
          { name: "Ayana Resort Bali", checkIn: "", checkOut: "", confirmationCode: "AY123789", address: "Jimbaran, Bali 80364" },
        ],
        activities: [
          { activity: "Private cooking class", date: "", time: "10:00 AM", confirmationCode: "COOK001", notes: "Learn to make nasi goreng!" },
          { activity: "Sunrise hike at Mount Batur", date: "", time: "2:00 AM pickup", confirmationCode: "HIKE002", notes: "Bring warm layers" },
          { activity: "Couples spa day", date: "", time: "2:00 PM", confirmationCode: "SPA003", notes: "At Four Seasons" },
          { activity: "Ubud Monkey Forest", date: "", time: "Morning", confirmationCode: "", notes: "Don't bring food!" },
          { activity: "Sunset dinner at Uluwatu", date: "", time: "5:00 PM", confirmationCode: "DIN004", notes: "Watch Kecak dance" },
        ],
        packingList: [
          { item: "Passports", packed: true },
          { item: "Travel insurance docs", packed: true },
          { item: "Sunscreen SPF 50", packed: false },
          { item: "Mosquito repellent", packed: false },
          { item: "Comfortable walking shoes", packed: false },
          { item: "Swimsuits", packed: false },
          { item: "Light layers for temples", packed: false },
          { item: "Camera & charger", packed: false },
          { item: "Adapters (Type C/F)", packed: false },
          { item: "Medications", packed: false },
        ],
        documents: [
          { document: "Passport - Emma", status: "Have it", expirationDate: "" },
          { document: "Passport - James", status: "Have it", expirationDate: "" },
          { document: "Travel Insurance", status: "Have it", expirationDate: "" },
          { document: "Vaccination Records", status: "Have it", expirationDate: "" },
        ],
        notes: "Indonesia offers visa-free entry for US citizens for stays up to 30 days. Don't forget to notify credit card companies of travel!",
      },
    },

    // Task Board
    {
      templateId: "task-board",
      title: "Task Board",
      position: 11,
      fields: {
        partner1Name: "Emma",
        partner2Name: "James",
        tasks: [
          { title: "Finalize menu with caterer", assignee: "partner1", status: "done", color: "green", dueDate: "" },
          { title: "Confirm DJ playlist", assignee: "partner2", status: "done", color: "blue", dueDate: "" },
          { title: "Order wedding favors", assignee: "partner1", status: "done", color: "pink", dueDate: "" },
          { title: "Book honeymoon excursions", assignee: "both", status: "in-progress", color: "purple", dueDate: "" },
          { title: "Write vows", assignee: "both", status: "in-progress", color: "yellow", dueDate: "" },
          { title: "Final dress fitting", assignee: "partner1", status: "todo", color: "pink", dueDate: "" },
          { title: "Pick up suits", assignee: "partner2", status: "todo", color: "blue", dueDate: "" },
          { title: "Confirm transportation", assignee: "partner2", status: "todo", color: "blue", dueDate: "" },
          { title: "Create seating chart", assignee: "both", status: "done", color: "purple", dueDate: "" },
          { title: "Send final RSVPs to caterer", assignee: "partner1", status: "todo", color: "green", dueDate: "" },
        ],
      },
    },

    // Notes
    {
      templateId: "notes",
      title: "Notes & Ideas",
      position: 12,
      fields: {
        content: `# Wedding Notes & Ideas

## Things to Remember
- Bring emergency kit (safety pins, stain remover, pain reliever)
- Assign someone to collect gifts at end of night
- Remember to eat!! Schedule a moment for us to grab food together
- Designate an "unplugged ceremony" - ask guests to put phones away

## Photo Shot List
- First look reaction
- Getting ready candids
- Family formals (both sides)
- Wedding party silly photos
- Detail shots of rings, flowers, invites
- Golden hour couple portraits
- Dance floor candids
- Sparkler exit

## Speech Notes
- Dad's toast: Keep it to 5 minutes
- Maid of honor: Confirmed topic is appropriate 😅
- Best man: Remind him NO embarrassing college stories

## Last Minute Questions
- ✅ Rain backup plan confirmed with venue
- ✅ Cake delivery time set for 2 PM
- ⬜ Confirm florist has correct boutonnière count
- ⬜ Double check sunset time for photos

## Vendor Tips
- Photographer: $200 cash
- DJ: $150 cash
- Hair/Makeup: 20%
- Caterer: Included in contract

---
*This is going to be the best day ever! 💕*`,
      },
    },
  ];

  for (const page of demoPages) {
    await db.insert(pages).values({
      plannerId: planner.id,
      templateId: page.templateId,
      title: page.title,
      position: page.position,
      fields: page.fields,
    });
    console.log(`  ✓ ${page.title}`);
  }

  console.log("\n✨ Demo account created successfully!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  Email:    ${DEMO_EMAIL}`);
  console.log(`  Password: ${DEMO_PASSWORD}`);
  console.log(`  Plan:     Complete (all features unlocked)`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

seedDemo()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error seeding demo account:", err);
    process.exit(1);
  });
