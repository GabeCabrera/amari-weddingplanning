"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Box,
  Typography,
  Container,
  Paper,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon, MarkEmailRead as MarkEmailReadIcon } from '@mui/icons-material';
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        throw new Error("Failed to send reset email.");
      }
      setIsSubmitted(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Button
        component={Link}
        href="/login"
        startIcon={<ArrowBackIcon />}
        sx={{ position: 'absolute', top: 24, left: 24, color: 'text.secondary' }}
      >
        Back to Login
      </Button>
      <Container maxWidth="xs">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
          {isSubmitted ? (
            <>
              <MarkEmailReadIcon color="success" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h5" component="h1" gutterBottom>
                Check Your Email
              </Typography>
              <Typography color="text.secondary">
                If an account exists for **{email}**, you&apos;ll receive a password reset link shortly.
              </Typography>
            </>
          ) : (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" component="h1" gutterBottom>
                  Reset Password
                </Typography>
                <Typography color="text.secondary">
                  Enter your email and we&apos;ll send you a link to reset your password.
                </Typography>
              </Box>
              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  id="email"
                  type="email"
                  label="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={isLoading}
                  sx={{ py: 1.5 }}
                >
                  {isLoading ? <CircularProgress size={24} /> : "Send Reset Link"}
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
}