/**
 * Admin script to create a new tenant (couple) and their user accounts
 * 
 * Usage:
 *   npx tsx scripts/create-tenant.ts
 * 
 * This will prompt you for the details and create:
 * 1. A tenant with the given slug (subdomain)
 * 2. Two user accounts (one for each partner)
 * 3. Generate temporary passwords that must be changed on first login
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import bcrypt from "bcryptjs";
import * as readline from "readline";
import * as schema from "../lib/db/schema";

// Load environment variables
import { config } from "dotenv";
config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in environment");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .replace(/(^-|-$)/g, "");
}

async function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log("\n🎊 Aisle - Create New Tenant\n");
  console.log("This will create a new wedding planner for a couple.\n");

  // Get partner names
  const partner1Name = await prompt("Partner 1 name (e.g., Sarah): ");
  const partner2Name = await prompt("Partner 2 name (e.g., Gabe): ");

  // Generate display name and slug
  const displayName = `${partner1Name} & ${partner2Name}`;
  const suggestedSlug = slugify(`${partner1Name}and${partner2Name}`);
  
  const slug = await prompt(`Subdomain slug [${suggestedSlug}]: `) || suggestedSlug;

  // Get emails
  const partner1Email = await prompt(`${partner1Name}'s email: `);
  const partner2Email = await prompt(`${partner2Name}'s email: `);

  // Optional wedding date
  const weddingDateStr = await prompt("Wedding date (YYYY-MM-DD, or leave blank): ");
  const weddingDate = weddingDateStr ? new Date(weddingDateStr) : null;

  // Generate passwords
  const partner1Password = generateTempPassword();
  const partner2Password = generateTempPassword();

  console.log("\n📝 Creating tenant and users...\n");

  try {
    // Create tenant
    const [tenant] = await db
      .insert(schema.tenants)
      .values({
        slug,
        displayName,
        weddingDate,
        onboardingComplete: false,
      })
      .returning();

    console.log(`✅ Tenant created: ${tenant.displayName} (${tenant.slug})`);

    // Create users
    const partner1Hash = await bcrypt.hash(partner1Password, 12);
    const partner2Hash = await bcrypt.hash(partner2Password, 12);

    const [user1] = await db
      .insert(schema.users)
      .values({
        tenantId: tenant.id,
        email: partner1Email.toLowerCase(),
        passwordHash: partner1Hash,
        name: partner1Name,
        mustChangePassword: true,
      })
      .returning();

    const [user2] = await db
      .insert(schema.users)
      .values({
        tenantId: tenant.id,
        email: partner2Email.toLowerCase(),
        passwordHash: partner2Hash,
        name: partner2Name,
        mustChangePassword: true,
      })
      .returning();

    console.log(`✅ User created: ${user1.name} (${user1.email})`);
    console.log(`✅ User created: ${user2.name} (${user2.email})`);

    // Output summary
    console.log("\n" + "=".repeat(60));
    console.log("🎉 TENANT CREATED SUCCESSFULLY!");
    console.log("=".repeat(60));
    console.log(`\nSubdomain URL: https://${slug}.aisle.wedding`);
    console.log(`(For local dev: http://${slug}.localhost:3000)\n`);
    
    console.log("📧 ONBOARDING EMAIL INFO:");
    console.log("-".repeat(40));
    console.log(`\n${partner1Name}:`);
    console.log(`  Email: ${partner1Email}`);
    console.log(`  Temporary Password: ${partner1Password}`);
    
    console.log(`\n${partner2Name}:`);
    console.log(`  Email: ${partner2Email}`);
    console.log(`  Temporary Password: ${partner2Password}`);
    
    console.log("\n⚠️  Users will be prompted to change their password on first login.");
    console.log("=".repeat(60) + "\n");

  } catch (error) {
    console.error("❌ Error creating tenant:", error);
    process.exit(1);
  }

  process.exit(0);
}

main();
