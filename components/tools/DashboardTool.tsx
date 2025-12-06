"use client";

import { useState, useEffect } from "react";
import { usePlannerData, formatCurrency } from "@/lib/hooks/usePlannerData";
import Link from "next/link";
import {
  Box,
  Typography,
  Container,
  CircularProgress,
  Paper,
  Button,
  Grid,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  LinearProgress,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  AccessTime as ClockIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  ChatBubbleOutline as ChatIcon,
  Checklist as ChecklistIcon,
  Store as StoreIcon,
  CalendarMonth as CalendarIcon,
  AttachMoney as BudgetIcon,
  People as PeopleIcon,
  Cake as CakeIcon,
  Favorite as FavoriteIcon,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";

// Helper to format time ago
function formatTimeAgo(timestamp: number): string {
  if (timestamp === 0) return "never"; // Handle initial state
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
}

interface QuickActionProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

function QuickAction({ href, icon, title, description }: QuickActionProps) {
  return (
    <Card
      component={Link}
      href={href}
      sx={{
        textDecoration: "none",
        "&:hover": { borderColor: "primary.main", boxShadow: 1 },
      }}
    >
      <CardContent>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "12px",
            bgcolor: "primary.light",
            color: "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function DashboardTool() {
  const { data, loading, refetch, lastRefresh } = usePlannerData();
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

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
        <CircularProgress />
      </Box>
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
    link?: string;
  }> = [];

  // Calculate alerts/priorities
  // Budget alerts
  if (budget && budget.total > 0 && budget.percentUsed > 100) {
    alerts.push({
      type: "warning",
      message: `You're over budget by ${formatCurrency(
        budget.spent - budget.total
      )}`,
      link: "/budget", // Assuming a route exists
    });
  } else if (budget && budget.total > 0 && budget.percentUsed > 90) {
    alerts.push({
      type: "warning",
      message: `Budget is ${budget.percentUsed}% allocated`,
      link: "/budget",
    });
  }

  // Vendor alerts
  const essentialVendors = ["venue", "photographer", "catering", "officiant"];
  const bookedCategories =
    vendors?.list
      .filter(
        (v) =>
          v.status === "booked" || v.status === "confirmed" || v.status === "paid"
      )
      .map((v) => v.category.toLowerCase()) || [];

  const missingEssentials = essentialVendors.filter(
    (v) => !bookedCategories.some((b) => b.includes(v))
  );
  if (missingEssentials.length > 0 && summary?.daysUntil && summary.daysUntil < 180) {
    alerts.push({
      type: "warning",
      message: `Still need to book: ${missingEssentials.join(", ")}`,
      link: "/vendors",
    });
  }

  // Guest alerts
  if (
    guests &&
    guests.stats.total > 0 &&
    guests.stats.pending > 0 &&
    summary?.daysUntil &&
    summary.daysUntil < 60
  ) {
    alerts.push({
      type: "info",
      message: `${guests.stats.pending} guests haven't RSVP'd yet`,
      link: "/guests",
    });
  }

  // Success alerts
  if (vendors && vendors.stats.booked >= 3) {
    alerts.push({
      type: "success",
      message: `${vendors.stats.booked} vendors booked!`,
      link: "/vendors",
    });
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {summary?.coupleNames || "Your Wedding"}
          </Typography>
          {summary?.weddingDate && (
            <Typography color="text.secondary">
              {(() => {
                const dateStr = summary.weddingDate;
                const date = dateStr.includes("T")
                  ? new Date(dateStr)
                  : new Date(dateStr + "T12:00:00");
                const formattedDate = date.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });
                return formattedDate;
              })()}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
          >
            <ClockIcon sx={{ fontSize: "1rem" }} />
            Updated {timeAgo}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon className={isRefreshing ? "animate-spin" : ""} />}
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <List disablePadding>
            {alerts.map((alert, i) => (
              <ListItem
                key={i}
                component={Link}
                href={alert.link || "#"}
                sx={{
                  mb: 1,
                  borderRadius: 1,
                  "&:last-child": { mb: 0 },
                  textDecoration: "none",
                }}
                disablePadding
              >
                <Alert
                  severity={alert.type}
                  iconMapping={{
                    warning: <WarningIcon />,
                    info: <InfoIcon />,
                    success: <CheckCircleIcon />,
                  }}
                  sx={{ width: "100%" }}
                >
                  {alert.message}
                </Alert>
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Stats cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Days to go
              </Typography>
              {summary?.daysUntil !== null ? (
                <Typography variant="h4" component="p">
                  {summary?.daysUntil}
                </Typography>
              ) : (
                <Typography variant="h6" color="text.secondary">
                  Set a date
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Planning progress
              </Typography>
              {decisions?.progress ? (
                <>
                  <Typography variant="h4" component="p">
                    {decisions.progress.percentComplete}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={decisions.progress.percentComplete}
                    sx={{ mt: 1, height: 8, borderRadius: 5 }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {decisions.progress.decided} of {decisions.progress.total} decisions
                  </Typography>
                </>
              ) : (
                <Typography variant="h6" color="text.secondary">
                  Start planning
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <Card component={Link} href="/budget" sx={{ textDecoration: "none", height: "100%" }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Budget
              </Typography>
              {budget && budget.total > 0 ? (
                <>
                  <Typography variant="h4" component="p">
                    {formatCurrency(budget.total)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {formatCurrency(budget.spent)} allocated ({budget.percentUsed}%)
                  </Typography>
                </>
              ) : budget && budget.spent > 0 ? (
                <>
                  <Typography variant="h4" component="p">
                    {formatCurrency(budget.spent)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    allocated so far
                  </Typography>
                </>
              ) : (
                <Typography variant="h6" color="text.secondary">
                  Not set
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <Card component={Link} href="/guests" sx={{ textDecoration: "none", height: "100%" }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Guests
              </Typography>
              {guests && guests.stats.total > 0 ? (
                <>
                  <Typography variant="h4" component="p">
                    {guests.stats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {guests.stats.confirmed} confirmed, {guests.stats.pending} pending
                  </Typography>
                </>
              ) : kernel?.guestCount ? (
                <>
                  <Typography variant="h4" component="p">
                    ~{kernel.guestCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    estimated
                  </Typography>
                </>
              ) : (
                <Typography variant="h6" color="text.secondary">
                  Not set
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid xs={12} md={4}>
          <QuickAction
            href="/"
            icon={<ChatIcon />}
            title="Chat with Aisle"
            description="Get help with anything"
          />
        </Grid>
        <Grid xs={12} md={4}>
          <QuickAction
            href="/checklist"
            icon={<ChecklistIcon />}
            title="View checklist"
            description={
              decisions?.progress
                ? `${decisions.progress.notStarted} items to do`
                : "See what's next"
            }
          />
        </Grid>
        <Grid xs={12} md={4}>
          <QuickAction
            href="/vendors"
            icon={<StoreIcon />}
            title="Track vendors"
            description={
              vendors?.stats.booked
                ? `${vendors.stats.booked} booked`
                : "Manage your team"
            }
          />
        </Grid>
      </Grid>

      {/* Vendors booked */}
      {vendors && vendors.list.length > 0 && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Typography variant="h6" component="h3">
              Your Vendors
            </Typography>
            <Button component={Link} href="/vendors" size="small">
              View all →
            </Button>
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {vendors.list.slice(0, 8).map((vendor) => {
              const isBooked =
                vendor.status === "booked" ||
                vendor.status === "confirmed" ||
                vendor.status === "paid";
              return (
                <Chip
                  key={vendor.id}
                  label={vendor.name}
                  icon={isBooked ? <CheckCircleIcon /> : undefined}
                  color={isBooked ? "success" : "default"}
                  variant={isBooked ? "filled" : "outlined"}
                  size="small"
                />
              );
            })}
            {vendors.list.length > 8 && (
              <Chip
                label={`+${vendors.list.length - 8} more`}
                variant="outlined"
                size="small"
              />
            )}
          </Box>
        </Paper>
      )}

      {/* Vibe */}
      {summary?.vibe && summary.vibe.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
            Your Vibe
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {summary.vibe.map((v, i) => (
              <Chip key={i} label={v} color="primary" variant="outlined" />
            ))}
          </Box>
        </Paper>
      )}

      {/* Empty state prompt */}
      {!summary?.weddingDate && !budget?.spent && !guests?.stats.total && (
        <Paper
          sx={{
            mt: 4,
            p: 3,
            bgcolor: "primary.light",
            textAlign: "center",
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
            Let&apos;s get started!
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Head to chat and tell me about your wedding plans. I&apos;ll help you organize
            everything.
          </Typography>
          <Button component={Link} href="/" variant="contained">
            Start chatting
          </Button>
        </Paper>
      )}
    </Container>
  );
}