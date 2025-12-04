/**
 * OAuth Token Service
 * 
 * Handles token retrieval and automatic refresh for all OAuth providers.
 * Use this whenever you need to make API calls to external services.
 */

import { db } from "@/lib/db";
import { oauthAccounts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// Buffer time before expiration to trigger refresh (5 minutes)
const EXPIRY_BUFFER_MS = 5 * 60 * 1000;

export interface OAuthTokens {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date | null;
  scope: string | null;
}

export type TokenResult = {
  success: true;
  tokens: OAuthTokens;
} | {
  success: false;
  error: string;
  needsReauth: boolean;
}

/**
 * Get valid OAuth tokens for a user and provider.
 * Automatically refreshes if expired.
 */
export async function getOAuthTokens(
  userId: string,
  provider: "google" | "pinterest" | string
): Promise<TokenResult> {
  // Get the stored OAuth account
  const account = await db.query.oauthAccounts.findFirst({
    where: and(
      eq(oauthAccounts.userId, userId),
      eq(oauthAccounts.provider, provider)
    ),
  });

  if (!account) {
    return {
      success: false,
      error: `No ${provider} account connected`,
      needsReauth: true,
    };
  }

  // Check if token is expired or about to expire
  const now = new Date();
  const isExpired = account.accessTokenExpiresAt 
    ? account.accessTokenExpiresAt.getTime() - EXPIRY_BUFFER_MS < now.getTime()
    : false;

  if (isExpired) {
    // Try to refresh
    if (!account.refreshToken) {
      return {
        success: false,
        error: `${provider} token expired and no refresh token available`,
        needsReauth: true,
      };
    }

    const refreshResult = await refreshOAuthToken(account.id, provider, account.refreshToken);
    if (!refreshResult.success) {
      return refreshResult;
    }

    return {
      success: true,
      tokens: refreshResult.tokens,
    };
  }

  // Token is still valid
  return {
    success: true,
    tokens: {
      accessToken: account.accessToken,
      refreshToken: account.refreshToken,
      expiresAt: account.accessTokenExpiresAt,
      scope: account.scope,
    },
  };
}

/**
 * Get tokens by tenant ID (useful for background jobs)
 */
export async function getOAuthTokensByTenant(
  tenantId: string,
  provider: "google" | "pinterest" | string
): Promise<TokenResult> {
  const account = await db.query.oauthAccounts.findFirst({
    where: and(
      eq(oauthAccounts.tenantId, tenantId),
      eq(oauthAccounts.provider, provider)
    ),
  });

  if (!account) {
    return {
      success: false,
      error: `No ${provider} account connected for this tenant`,
      needsReauth: true,
    };
  }

  // Use the user-based function for the actual token retrieval
  return getOAuthTokens(account.userId, provider);
}

/**
 * Refresh an OAuth token
 */
async function refreshOAuthToken(
  accountId: string,
  provider: string,
  refreshToken: string
): Promise<TokenResult> {
  try {
    let tokenEndpoint: string;
    let clientId: string;
    let clientSecret: string;

    // Configure based on provider
    switch (provider) {
      case "google":
        tokenEndpoint = "https://oauth2.googleapis.com/token";
        clientId = process.env.GOOGLE_CLIENT_ID!;
        clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
        break;
      case "pinterest":
        tokenEndpoint = "https://api.pinterest.com/v5/oauth/token";
        clientId = process.env.PINTEREST_CLIENT_ID!;
        clientSecret = process.env.PINTEREST_CLIENT_SECRET!;
        break;
      default:
        return {
          success: false,
          error: `Unknown provider: ${provider}`,
          needsReauth: true,
        };
    }

    // Make refresh request
    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`Token refresh failed for ${provider}:`, error);
      
      // If refresh fails with 400/401, the refresh token is likely invalid
      if (response.status === 400 || response.status === 401) {
        return {
          success: false,
          error: `${provider} refresh token is invalid. Please reconnect your account.`,
          needsReauth: true,
        };
      }

      return {
        success: false,
        error: `Failed to refresh ${provider} token: ${response.status}`,
        needsReauth: false,
      };
    }

    const data = await response.json();
    
    // Calculate new expiration time
    const expiresAt = data.expires_in 
      ? new Date(Date.now() + data.expires_in * 1000)
      : null;

    // Update the stored tokens
    await db
      .update(oauthAccounts)
      .set({
        accessToken: data.access_token,
        // Some providers return a new refresh token
        ...(data.refresh_token && { refreshToken: data.refresh_token }),
        accessTokenExpiresAt: expiresAt,
        ...(data.scope && { scope: data.scope }),
        updatedAt: new Date(),
      })
      .where(eq(oauthAccounts.id, accountId));

    console.log(`Successfully refreshed ${provider} token`);

    return {
      success: true,
      tokens: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken,
        expiresAt,
        scope: data.scope || null,
      },
    };
  } catch (error) {
    console.error(`Error refreshing ${provider} token:`, error);
    return {
      success: false,
      error: `Failed to refresh ${provider} token`,
      needsReauth: false,
    };
  }
}

/**
 * Check if a user has connected a specific provider
 */
export async function hasOAuthConnection(
  userId: string,
  provider: string
): Promise<boolean> {
  const account = await db.query.oauthAccounts.findFirst({
    where: and(
      eq(oauthAccounts.userId, userId),
      eq(oauthAccounts.provider, provider)
    ),
    columns: { id: true },
  });

  return !!account;
}

/**
 * Get all connected OAuth providers for a user
 */
export async function getConnectedProviders(userId: string): Promise<string[]> {
  const accounts = await db.query.oauthAccounts.findMany({
    where: eq(oauthAccounts.userId, userId),
    columns: { provider: true },
  });

  return accounts.map((a) => a.provider);
}

/**
 * Disconnect an OAuth provider
 */
export async function disconnectOAuthProvider(
  userId: string,
  provider: string
): Promise<boolean> {
  const result = await db
    .delete(oauthAccounts)
    .where(
      and(
        eq(oauthAccounts.userId, userId),
        eq(oauthAccounts.provider, provider)
      )
    );

  return true;
}

/**
 * Check if tokens have a specific scope
 */
export function hasScope(tokenScope: string | null, requiredScope: string): boolean {
  if (!tokenScope) return false;
  const scopes = tokenScope.split(" ");
  return scopes.includes(requiredScope);
}
