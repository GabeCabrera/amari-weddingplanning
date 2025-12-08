"use client";

import { useSession } from "next-auth/react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  User, // Lucide icon for user
  ShieldQuestion, // Lucide icon for plan/upgrade
  AlertTriangle, // Lucide icon for danger zone
} from "lucide-react";

export default function SettingsTool() {
  const { data: session } = useSession();

  const userInitial = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-6 space-y-8 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="font-serif text-5xl md:text-6xl text-foreground tracking-tight">
          Settings
        </h1>
        <p className="text-xl text-muted-foreground mt-2 font-light">
          Manage your account and preferences
        </p>
      </div>

      {/* Account section */}
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
          <Button variant="outline" className="rounded-full">
            Edit Profile
          </Button>
        </CardContent>
      </Card>

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
