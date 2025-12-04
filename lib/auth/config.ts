import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { getUserByEmail, getTenantById } from "@/lib/db/queries";
import { db } from "@/lib/db";
import { users, tenants, oauthAccounts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      tenantId: string;
      tenantSlug: string;
      mustChangePassword: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    tenantId: string;
    tenantSlug: string;
    mustChangePassword: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    tenantId: string;
    tenantSlug: string;
    mustChangePassword: boolean;
  }
}

// Google OAuth scopes we request
// Add more scopes here as you integrate more Google APIs
const GOOGLE_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/calendar.events", // Read/write calendar events
  "https://www.googleapis.com/auth/calendar.readonly", // Read calendars list
].join(" ");

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent", // Always show consent screen to get refresh token
          access_type: "offline", // Request refresh token
          scope: GOOGLE_SCOPES,
        },
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await getUserByEmail(credentials.email);
        if (!user) {
          throw new Error("Invalid email or password");
        }

        // If user signed up with Google and has no password, they need to use Google login
        if (!user.passwordHash) {
          throw new Error("Please sign in with Google");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        const tenant = await getTenantById(user.tenantId);
        if (!tenant) {
          throw new Error("Account not properly configured");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          tenantId: user.tenantId,
          tenantSlug: tenant.slug,
          mustChangePassword: user.mustChangePassword,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // For credentials login, just return true (already handled in authorize)
      if (account?.provider === "credentials") {
        return true;
      }

      // For Google login
      if (account?.provider === "google" && user.email) {
        try {
          // Check if user already exists
          const existingUser = await getUserByEmail(user.email);

          if (existingUser) {
            // User exists - update their Google ID if not set
            if (!existingUser.googleId) {
              await db
                .update(users)
                .set({
                  googleId: account.providerAccountId,
                  name: existingUser.name || user.name,
                  updatedAt: new Date(),
                })
                .where(eq(users.id, existingUser.id));
            }

            // Save/update OAuth tokens
            await saveOAuthTokens(
              existingUser.id,
              existingUser.tenantId,
              account,
              user
            );

            return true;
          }

          // New user - create account
          const slug = `wedding-${nanoid(8)}`;
          const unsubscribeToken = nanoid(32);
          const displayName = user.name || "";

          // Create tenant
          const [tenant] = await db
            .insert(tenants)
            .values({
              slug,
              displayName,
              plan: "free",
              onboardingComplete: false,
            })
            .returning();

          // Create user linked to tenant
          const [newUser] = await db
            .insert(users)
            .values({
              email: user.email.toLowerCase(),
              name: user.name,
              passwordHash: "", // No password for Google-only users
              tenantId: tenant.id,
              role: "owner",
              googleId: account.providerAccountId,
              emailOptIn: true,
              unsubscribeToken,
            })
            .returning();

          // Save OAuth tokens for the new user
          await saveOAuthTokens(newUser.id, tenant.id, account, user);

          return true;
        } catch (error) {
          console.error("Error during Google sign in:", error);
          return false;
        }
      }

      return true;
    },

    async jwt({ token, user, account, trigger, session }) {
      // Initial sign in
      if (account && user) {
        // For Google login, we need to fetch the user from our database
        if (account.provider === "google" && token.email) {
          const dbUser = await getUserByEmail(token.email);
          if (dbUser) {
            const tenant = await getTenantById(dbUser.tenantId);
            token.id = dbUser.id;
            token.tenantId = dbUser.tenantId;
            token.tenantSlug = tenant?.slug ?? "";
            token.mustChangePassword = false;
          }
        } else {
          // Credentials login
          token.id = user.id;
          token.tenantId = user.tenantId;
          token.tenantSlug = user.tenantSlug;
          token.mustChangePassword = user.mustChangePassword;
        }
      }

      // Handle session updates (e.g., after password change)
      if (trigger === "update" && session) {
        token.mustChangePassword =
          session.mustChangePassword ?? token.mustChangePassword;
      }

      return token;
    },

    async session({ session, token }) {
      session.user = {
        id: token.id,
        email: token.email ?? "",
        name: token.name,
        tenantId: token.tenantId,
        tenantSlug: token.tenantSlug,
        mustChangePassword: token.mustChangePassword,
      };
      return session;
    },
  },
};

/**
 * Save or update OAuth tokens for a user
 */
async function saveOAuthTokens(
  userId: string,
  tenantId: string,
  account: {
    provider: string;
    providerAccountId: string;
    access_token?: string;
    refresh_token?: string;
    expires_at?: number;
    scope?: string;
    token_type?: string;
    id_token?: string;
  },
  user: {
    email?: string | null;
    name?: string | null;
    image?: string | null;
  }
) {
  if (!account.access_token) {
    console.warn("No access token to save for", account.provider);
    return;
  }

  const expiresAt = account.expires_at
    ? new Date(account.expires_at * 1000)
    : null;

  // Check if we already have an OAuth account for this user/provider
  const existing = await db.query.oauthAccounts.findFirst({
    where: and(
      eq(oauthAccounts.userId, userId),
      eq(oauthAccounts.provider, account.provider)
    ),
  });

  if (existing) {
    // Update existing tokens
    await db
      .update(oauthAccounts)
      .set({
        accessToken: account.access_token,
        // Only update refresh token if we got a new one (Google doesn't always send it)
        ...(account.refresh_token && { refreshToken: account.refresh_token }),
        accessTokenExpiresAt: expiresAt,
        scope: account.scope,
        tokenType: account.token_type,
        idToken: account.id_token,
        providerEmail: user.email,
        providerName: user.name,
        providerImage: user.image,
        updatedAt: new Date(),
      })
      .where(eq(oauthAccounts.id, existing.id));

    console.log(`Updated OAuth tokens for ${account.provider}`);
  } else {
    // Create new OAuth account
    await db.insert(oauthAccounts).values({
      userId,
      tenantId,
      provider: account.provider,
      providerAccountId: account.providerAccountId,
      accessToken: account.access_token,
      refreshToken: account.refresh_token,
      accessTokenExpiresAt: expiresAt,
      scope: account.scope,
      tokenType: account.token_type || "Bearer",
      idToken: account.id_token,
      providerEmail: user.email,
      providerName: user.name,
      providerImage: user.image,
    });

    console.log(`Created OAuth account for ${account.provider}`);
  }
}
