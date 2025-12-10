import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file if present (for local testing)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const REQUIRED_KEYS = [
  // Database
  'DATABASE_URL',

  // NextAuth
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',

  // Google
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REDIRECT_URI',
  'GOOGLE_SEARCH_API_KEY',
  'GOOGLE_SEARCH_ENGINE_ID',

  // Google Analytics
  'NEXT_PUBLIC_GOOGLE_ANALYTICS_ID',

  // Email
  'RESEND_API_KEY',

  // Cron Security
  'CRON_SECRET',

  // Stripe (Crucial for launch)
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRICE_MONTHLY',
  'STRIPE_PRICE_YEARLY',
  'STRIPE_PRICE_PREMIUM_MONTHLY',
  'STRIPE_PRICE_PREMIUM_YEARLY',
];

const OPTIONAL_KEYS = [
  'NEXT_PUBLIC_REDDIT_PIXEL_ID',
];

function verifyEnv() {
  console.log('🔍 Starting Environment Audit...\n');

  let missingCount = 0;
  let optionalMissingCount = 0;

  REQUIRED_KEYS.forEach((key) => {
    if (!process.env[key]) {
      console.error(`❌ Missing Required: ${key}`);
      missingCount++;
    } else {
      console.log(`✅ Found: ${key}`);
    }
  });

  console.log('\n--- Optional Keys ---');
  OPTIONAL_KEYS.forEach((key) => {
    if (!process.env[key]) {
      console.warn(`⚠️  Missing Optional: ${key}`);
      optionalMissingCount++;
    } else {
      console.log(`✅ Found: ${key}`);
    }
  });

  console.log('\n-----------------------------------');
  if (missingCount > 0) {
    console.error(`🚨 Audit FAILED. ${missingCount} required variables are missing.`);
    process.exit(1);
  } else {
    console.log('🎉 Audit PASSED. All required variables are present.');
    console.log('   (Verify values are correct for PRODUCTION context)');
    process.exit(0);
  }
}

verifyEnv();
