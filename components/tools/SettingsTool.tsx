"use client";

import { useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  User,
  ShieldQuestion,
  AlertTriangle,
  Loader2,
  Save,
  Instagram,
  Globe,
  Link as LinkIcon, // Using Link as a generic link icon
  UserPlus // Import UserPlus
} from "lucide-react";
// ... (rest of imports)

export default function SettingsTool() {
  // ... (existing state and useEffect)

  const handleInvitePartner = () => {
    // In a real implementation, this would generate a unique invite link
    const inviteLink = `https://scribeandstem.com/invite/${session?.user?.id || "unique-id"}`;
    navigator.clipboard.writeText(inviteLink);
    toast.success("Invitation link copied to clipboard!");
  };

  // ... (rest of handleProfileSave)

  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-6 space-y-8 animate-fade-up">
      {/* ... (Header and Account section) */}

      <Card className="bg-white rounded-3xl border border-border shadow-soft">
        <CardHeader className="p-6 border-b border-border/70 bg-muted/20 rounded-t-3xl">
          <CardTitle className="font-serif text-xl text-foreground">Account</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium text-lg border border-primary/20 shrink-0">
              {userInitial || "?"}
            </div>
            <div>
              <p className="font-medium text-lg text-foreground">{session?.user?.name || "Unknown"}</p>
              <p className="text-sm text-muted-foreground">
                {session?.user?.email || "No email"}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="rounded-full">
                  Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] rounded-xl">
                {/* ... (Dialog content same as before) ... */}
                <DialogHeader>
                  <DialogTitle className="font-serif text-2xl">Edit Your Profile</DialogTitle>
                  <DialogDescription>
                    Update your display name, bio, and social links.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleProfileSave} className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="rounded-lg h-10"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="bio">Bio (short description)</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us a little about your wedding style or story..."
                      className="rounded-lg min-h-[80px]"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="profileImage">Profile Image URL</Label>
                    <Input
                      id="profileImage"
                      value={profileImage}
                      onChange={(e) => setProfileImage(e.target.value)}
                      placeholder="https://yourimage.com/profile.jpg"
                      className="rounded-lg h-10"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="instagram">Instagram Username</Label>
                    <Input
                      id="instagram"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="@yourhandle"
                      className="rounded-lg h-10"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tiktok">TikTok Username</Label>
                    <Input
                      id="tiktok"
                      value={tiktok}
                      onChange={(e) => setTiktok(e.target.value)}
                      placeholder="@yourhandle"
                      className="rounded-lg h-10"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="website">Personal Website/Blog</Label>
                    <Input
                      id="website"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://yourwebsite.com"
                      className="rounded-lg h-10"
                      disabled={isLoading}
                    />
                  </div>
                  <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => setIsEditProfileOpen(false)} disabled={isLoading} className="rounded-full">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading} className="rounded-full shadow-soft">
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save Changes
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Partner Collaboration Section */}
      <Card className="bg-white rounded-3xl border border-border shadow-soft">
        <CardHeader className="p-6 border-b border-border/70 bg-muted/20 rounded-t-3xl">
          <CardTitle className="font-serif text-xl text-foreground">Partner Collaboration</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-lg text-foreground">Invite Partner</p>
              <p className="text-sm text-muted-foreground">
                Share your board and plan together in real-time.
              </p>
            </div>
            <Button onClick={handleInvitePartner} className="rounded-full shadow-soft bg-secondary hover:bg-secondary/90 text-white">
              <UserPlus className="h-4 w-4 mr-2" /> Invite
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Plan section */}
      {/* ... (rest of the file) */}

      {/* Plan section */}
      <Card className="bg-white rounded-3xl border border-border shadow-soft">
        <CardHeader className="p-6 border-b border-border/70 bg-muted/20 rounded-t-3xl">
          <CardTitle className="font-serif text-xl text-foreground">Plan</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-lg text-foreground">Free Plan</p>
              <p className="text-sm text-muted-foreground">Basic features included</p>
            </div>
            <Link href="/choose-plan">
              <Button className="rounded-full shadow-soft">
                <ShieldQuestion className="h-4 w-4 mr-2" /> Upgrade
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="bg-white rounded-3xl border border-destructive/30 shadow-soft">
        <CardHeader className="p-6 border-b border-destructive/30 bg-destructive/10 rounded-t-3xl">
          <CardTitle className="font-serif text-xl text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-lg text-foreground">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            <Button variant="destructive" className="rounded-full shadow-soft">
              <AlertTriangle className="h-4 w-4 mr-2" /> Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}