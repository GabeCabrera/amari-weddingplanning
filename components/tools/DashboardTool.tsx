"use client";

import { useState, useEffect } from "react";
import { usePlannerData, formatCurrency } from "@/lib/hooks/usePlannerData";
import { useBrowser } from "@/components/layout/browser-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
  RefreshCw, 
  Clock, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  CheckSquare, 
  CreditCard, 
  Users, 
  Store, 
  ArrowRight 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Helper to format time ago
function formatTimeAgo(timestamp: number): string {
  if (timestamp === 0) return "never"; // Handle initial state
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
}

export default function DashboardTool() {
  const { data, loading, refetch, lastRefresh } = usePlannerData();
  const browser = useBrowser();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeAgo, setTimeAgo] = useState("just now");

  useEffect(() => {
    const updateTimeAgo = () => setTimeAgo(formatTimeAgo(lastRefresh));
    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 10000);
    return () => clearInterval(interval);
  }, [lastRefresh]);

  useEffect(() => {
    const handleVisibility = () => {
      if (
        document.visibilityState === "visible" &&
        Date.now() - lastRefresh > 30000
      ) {
        refetch();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [lastRefresh, refetch]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleToolClick = (toolId: string) => {
    browser.openTool(toolId);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" data-testid="loading-spinner" />
      </div>
    );
  }

  const summary = data?.summary;
  const budget = data?.budget;
  const guests = data?.guests;
  const vendors = data?.vendors;
  const decisions = data?.decisions;
  const kernel = data?.kernel;

  const alerts: Array<{
    type: "warning" | "info" | "success";
    message: string;
    toolId?: string;
  }> = [];

  // Calculate alerts/priorities
  if (budget && budget.total > 0 && budget.percentUsed > 100) {
    alerts.push({
      type: "warning",
      message: `Over budget by ${formatCurrency(budget.spent - budget.total)}`,
      toolId: "budget",
    });
  } else if (budget && budget.total > 0 && budget.percentUsed > 90) {
    alerts.push({
      type: "warning",
      message: `Budget is ${budget.percentUsed}% allocated`,
      toolId: "budget",
    });
  }

  const essentialVendors = ["venue", "photographer", "catering", "officiant"];
  const bookedCategories =
    vendors?.list
      .filter(
        (v) =>
          v.status === "booked" || v.status === "confirmed" || v.status === "paid"
      )
      .map((v) => (v.category || "").toLowerCase()) || [];

  const missingEssentials = essentialVendors.filter(
    (v) => !bookedCategories.some((b) => b.includes(v))
  );
  if (missingEssentials.length > 0 && summary?.daysUntil && summary.daysUntil < 180) {
    alerts.push({
      type: "warning",
      message: `Need to book: ${missingEssentials.join(", ")}`,
      toolId: "vendors",
    });
  }

  if (
    guests &&
    guests.stats.total > 0 &&
    guests.stats.pending > 0 &&
    summary?.daysUntil &&
    summary.daysUntil < 60
  ) {
    alerts.push({
      type: "info",
      message: `${guests.stats.pending} guests pending RSVP`,
      toolId: "guests",
    });
  }

  if (vendors && vendors.stats.booked >= 3) {
    alerts.push({
      type: "success",
      message: `${vendors.stats.booked} vendors booked!`,
      toolId: "vendors",
    });
  }

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-6 space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-5xl md:text-6xl text-foreground tracking-tight">
            {summary?.coupleNames || "Your Wedding"}
          </h1>
          {summary?.weddingDate && (
            <p className="text-xl text-muted-foreground mt-2 font-light">
              {(() => {
                const dateStr = summary.weddingDate;
                const date = dateStr.includes("T")
                  ? new Date(dateStr)
                  : new Date(dateStr + "T12:00:00");
                return date.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });
              })()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-sm border border-border">
            <Clock className="h-3 w-3" />
            Updated {timeAgo}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full h-8 px-3 border-border hover:bg-white hover:text-primary"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-3 w-3 mr-2", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <button
              key={i}
              onClick={() => handleToolClick(alert.toolId || "dashboard")}
              className={cn(
                "w-full flex items-center p-4 rounded-xl text-sm font-medium transition-all hover:scale-[1.01] shadow-sm border text-left",
                alert.type === "warning" && "bg-orange-50 text-orange-900 border-orange-100 hover:bg-orange-100",
                alert.type === "info" && "bg-blue-50 text-blue-900 border-blue-100 hover:bg-blue-100",
                alert.type === "success" && "bg-green-50 text-green-900 border-green-100 hover:bg-green-100"
              )}
            >
              {alert.type === "warning" && <AlertTriangle className="h-4 w-4 mr-3 shrink-0" />}
              {alert.type === "info" && <Info className="h-4 w-4 mr-3 shrink-0" />}
              {alert.type === "success" && <CheckCircle className="h-4 w-4 mr-3 shrink-0" />}
              {alert.message}
              <ArrowRight className="h-4 w-4 ml-auto opacity-50" />
            </button>
          ))}
        </div>
      )}

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Checklist Card */}
        <div 
          onClick={() => handleToolClick("checklist")}
          className="group cursor-pointer bg-white rounded-3xl p-8 border border-border shadow-soft hover:shadow-lifted transition-all duration-500 hover:-translate-y-1"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
              <CheckSquare className="h-6 w-6" />
            </div>
            <div className="h-8 w-8 rounded-full border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          
          <h3 className="font-serif text-2xl mb-2 text-foreground">Checklist</h3>
          
          {decisions?.progress ? (
            <div className="space-y-4">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-medium font-sans text-foreground">
                  {decisions.progress.percentComplete}%
                </span>
                <span className="text-muted-foreground font-medium">complete</span>
              </div>
              
              {/* Custom Progress Bar */}
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-1000 ease-out"
                  style={{ width: `${decisions.progress.percentComplete}%` }}
                />
              </div>
              
              <p className="text-sm text-muted-foreground">
                {decisions.progress.decided} of {decisions.progress.total} decisions made
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground">Start planning your big day</p>
          )}
        </div>

        {/* Budget Card */}
        <div 
          onClick={() => handleToolClick("budget")}
          className="group cursor-pointer bg-white rounded-3xl p-8 border border-border shadow-soft hover:shadow-lifted transition-all duration-500 hover:-translate-y-1"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="h-12 w-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-700 group-hover:scale-110 transition-transform duration-500">
              <CreditCard className="h-6 w-6" />
            </div>
            <div className="h-8 w-8 rounded-full border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <h3 className="font-serif text-2xl mb-2 text-foreground">Budget</h3>

          {budget && budget.total > 0 ? (
            <div>
              <div className="text-4xl font-medium font-sans text-foreground mb-1">
                {formatCurrency(budget.total)}
              </div>
              <p className="text-muted-foreground">
                <span className="text-foreground font-medium">{formatCurrency(budget.spent)}</span> allocated ({budget.percentUsed}%)
              </p>
            </div>
          ) : budget && budget.spent > 0 ? (
            <div>
              <div className="text-4xl font-medium font-sans text-foreground mb-1">
                {formatCurrency(budget.spent)}
              </div>
              <p className="text-muted-foreground">allocated so far</p>
            </div>
          ) : (
            <p className="text-muted-foreground">Set your budget</p>
          )}
        </div>

        {/* Guests Card */}
        <div 
          onClick={() => handleToolClick("guests")}
          className="group cursor-pointer bg-white rounded-3xl p-8 border border-border shadow-soft hover:shadow-lifted transition-all duration-500 hover:-translate-y-1"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-700 group-hover:scale-110 transition-transform duration-500">
              <Users className="h-6 w-6" />
            </div>
            <div className="h-8 w-8 rounded-full border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <h3 className="font-serif text-2xl mb-2 text-foreground">Guest List</h3>

          {guests && guests.stats.total > 0 ? (
            <div>
              <div className="text-4xl font-medium font-sans text-foreground mb-1">
                {guests.stats.total}
              </div>
              <div className="flex gap-3 text-sm">
                <span className="text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-md">
                  {guests.stats.confirmed} confirmed
                </span>
                <span className="text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-md">
                  {guests.stats.pending} pending
                </span>
              </div>
            </div>
          ) : kernel?.guestCount ? (
            <div>
              <div className="text-4xl font-medium font-sans text-foreground mb-1">
                ~{kernel.guestCount}
              </div>
              <p className="text-muted-foreground">estimated guests</p>
            </div>
          ) : (
            <p className="text-muted-foreground">Build your guest list</p>
          )}
        </div>

        {/* Vendors Card */}
        <div 
          onClick={() => handleToolClick("vendors")}
          className="group cursor-pointer bg-white rounded-3xl p-8 border border-border shadow-soft hover:shadow-lifted transition-all duration-500 hover:-translate-y-1"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-700 group-hover:scale-110 transition-transform duration-500">
              <Store className="h-6 w-6" />
            </div>
            <div className="h-8 w-8 rounded-full border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <h3 className="font-serif text-2xl mb-2 text-foreground">Vendors</h3>

          {vendors && vendors.list && vendors.list.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {vendors.list.slice(0, 3).map((vendor) => {
                const isBooked = ["booked", "confirmed", "paid"].includes(vendor.status || "");
                return (
                  <span 
                    key={vendor.id}
                    className={cn(
                      "px-3 py-1 rounded-full text-sm border",
                      isBooked 
                        ? "bg-stone-800 text-white border-stone-800" 
                        : "bg-stone-50 text-stone-600 border-stone-200"
                    )}
                  >
                    {vendor.name}
                  </span>
                );
              })}
              {vendors.list.length > 3 && (
                <span className="px-3 py-1 rounded-full text-sm bg-white border border-dashed border-border text-muted-foreground">
                  +{vendors.list.length - 3} more
                </span>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">Track your vendors</p>
          )}
        </div>

      </div>
    </div>
  );
}