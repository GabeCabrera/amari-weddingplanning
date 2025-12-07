"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Typography,
  Container,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { toast } from "sonner";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!token) {
    return (
      <Alert severity="error">
        Invalid or expired password reset link. Please request a new one.
      </Alert>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password.");
      }
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Box sx={{ textAlign: 'center' }}>
        <CheckCircleIcon color="success" sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h5" component="h1" gutterBottom>
          Password Reset
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Your password has been successfully reset.
        </Typography>
        <Button variant="contained" component={Link} href="/login">
          Sign In
        </Button>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Set a New Password
        </Typography>
        <Typography color="text.secondary">
          Enter your new password below.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          id="password"
          type="password"
          label="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
          helperText="At least 8 characters"
        />
        <TextField
          id="confirmPassword"
          type="password"
          label="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={isLoading}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isLoading}
          sx={{ py: 1.5, mt: 1 }}
        >
          {isLoading ? <CircularProgress size={24} /> : "Reset Password"}
        </Button>
      </Box>
    </>
  );
}

export default function ResetPasswordPage() {
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
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Suspense fallback={<CircularProgress />}>
            <ResetPasswordForm />
          </Suspense>
        </Paper>
      </Container>
    </Box>
  );
}