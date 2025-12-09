# Project: "The Muse" (Inspiration Platform Overhaul)

**Objective:** Transform the `Inspo` tool into a full-featured, social inspiration platform within Scribe & Stem, mirroring the "Board & Pin" mechanics of Pinterest but optimized for wedding logistics.

## 1. Nomenclature & Branding
*   **Palette** → **Board** (The container).
*   **Spark** → **Idea** (The content item).
*   **Explore** → **The Feed** (Global discovery).

## 2. Core Features (Implemented ✅)
*   [x] **Multiple Boards:** Organize ideas into collections.
*   [x] **Privacy Controls:** Public vs. Private boards.
*   [x] **Vibe Search:** Semantic search for ideas.
*   [x] **Remixing:** Save public ideas to personal boards.
*   [x] **Wedding Portfolio:** Public profile page for couples.

## 3. Active Phase: The Social Graph & Identity 🚧

### A. The Follow System
*   **Tenant-to-Tenant Graph:** Couples follow other couples (not user-to-user).
*   **Schema:** New `follows` table.
*   **UI:** "Follow" button on Profile and Board views.

### B. Profile Enrichment
*   **Bio / Our Story:** A text field for the couple to describe themselves.
*   **Social Links:** Instagram, TikTok, Website links on the profile.
*   **Profile Header:** Custom cover image for the public profile.

### C. Implementation Plan
1.  **Schema Migration:**
    *   Add `follows` table.
    *   Add `bio`, `links` columns to `tenants`.
2.  **API Development:**
    *   `/api/social/follow` (Toggle).
    *   `/api/settings/profile` (Update bio/links).
3.  **Frontend Updates:**
    *   `UserProfile.tsx`: Add Follow button + Bio.
    *   `SettingsTool.tsx`: Add "Public Profile" editing form.

---
**Approved by:** User
**Date:** Dec 9, 2025