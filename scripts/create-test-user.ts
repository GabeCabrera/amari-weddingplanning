import "dotenv/config";
import { resolve } from "path";
import { config } from "dotenv";
config({ path: resolve(process.cwd(), ".env.local") });

import { db } from "../lib/db";
import { users, tenants } from "../lib/db/schema";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

async function createTestUser() {
  const email = "test.reviewer@scribeandstem.com";
  const password = "GoogleVerification2025!";
  const name = "Google Reviewer";

  console.log(`Creating test user: ${email}`);

  // 1. Create Tenant
  const slug = `reviewer-${nanoid(6)}`;
  const [tenant] = await db
    .insert(tenants)
    .values({
      slug,
      displayName: name,
      plan: "free",
      onboardingComplete: true, // Important: Skip onboarding
      plannerName: "Scribe",
    })
    .returning();

  console.log(`Tenant created: ${tenant.id} (${slug})`);

  // 2. Hash Password
  const passwordHash = await bcrypt.hash(password, 10);

  // 3. Create User
  const [user] = await db
    .insert(users)
    .values({
      email,
      name,
      passwordHash,
      tenantId: tenant.id,
      role: "owner",
      isTestAccount: true, // Mark as test
      emailVerified: new Date(),
    })
    .returning();

  console.log(`\n✅ Test User Created Successfully!`);
  console.log(`-----------------------------------`);
  console.log(`Email:    ${email}`);
  console.log(`Password: ${password}`);
  console.log(`-----------------------------------`);
}

createTestUser()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error creating test user:", err);
    process.exit(1);
  });
