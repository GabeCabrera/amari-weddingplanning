"use client";

import { useSession } from "next-auth/react";
import React from "react";
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

export default function SettingsTool() {
  const { data: session } = useSession();

  const userInitial = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>
        <Typography color="text.secondary">
          Manage your account and preferences
        </Typography>
      </Box>

      {/* Account section */}
      <Paper elevation={1} sx={{ mb: 3 }}>
        <Box sx={{ px: 3, py: 2, bgcolor: "grey.50", borderBottom: 1, borderColor: "divider" }}>
          <Typography variant="h6" component="h2">
            Account
          </Typography>
        </Box>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: "primary.main" }}>
              {userInitial || "?"}
            </Avatar>
            <Box>
              <Typography variant="h6">{session?.user?.name || "Unknown"}</Typography>
              <Typography variant="body2" color="text.secondary">
                {session?.user?.email || "No email"}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Plan section */}
      <Paper elevation={1} sx={{ mb: 3 }}>
        <Box sx={{ px: 3, py: 2, bgcolor: "grey.50", borderBottom: 1, borderColor: "divider" }}>
          <Typography variant="h6" component="h2">
            Plan
          </Typography>
        </Box>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                Free Plan
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Basic features included
              </Typography>
            </Box>
            <Button variant="contained" color="primary" href="/choose-plan" size="small">
              Upgrade
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Danger zone */}
      <Paper elevation={1} sx={{ border: 1, borderColor: "error.light" }}>
        <Box sx={{ px: 3, py: 2, bgcolor: "error.light", borderBottom: 1, borderColor: "error.light" }}>
          <Typography variant="h6" component="h2" color="error.contrastText">
            Danger Zone
          </Typography>
        </Box>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                Delete Account
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Permanently delete your account and all data
              </Typography>
            </Box>
            <Button variant="outlined" color="error" size="small">
              Delete
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}