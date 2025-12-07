"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
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
  Divider,
  Alert,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon, Google as GoogleIcon } from '@mui/icons-material';
import { toast } from "sonner";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const error = searchParams.get("error");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        toast.error(result.error);
      } else if (result?.ok) {
        window.location.href = callbackUrl;
      }
    } catch (e) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      // We trigger the sign-in and NextAuth will handle the redirect
      await signIn("google", { callbackUrl });
    } catch {
      toast.error("Something went wrong with Google sign in.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error === "CredentialsSignin" ? "Invalid email or password." : "An error occurred during sign in."}
        </Alert>
      )}
      <Button
        type="button"
        variant="outlined"
        fullWidth
        startIcon={<GoogleIcon />}
        onClick={handleGoogleSignIn}
        disabled={isLoading || isGoogleLoading}
        sx={{ mb: 2, textTransform: 'none', py: 1.5 }}
      >
        {isGoogleLoading ? <CircularProgress size={24} /> : "Continue with Google"}
      </Button>

      <Divider sx={{ my: 3 }}>
        <Typography variant="body2" color="text.secondary">OR</Typography>
      </Divider>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          id="email"
          type="email"
          label="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading || isGoogleLoading}
        />
        <TextField
          id="password"
          type="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading || isGoogleLoading}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isLoading || isGoogleLoading}
          sx={{ py: 1.5 }}
        >
          {isLoading ? <CircularProgress size={24} /> : "Sign In with Email"}
        </Button>
      </Box>
    </Box>
  );
}

export default function LoginPage() {
  return (
    <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
        <Button
            component={Link}
            href="/"
            startIcon={<ArrowBackIcon />}
            sx={{ position: 'absolute', top: 24, left: 24, color: 'text.secondary' }}
        >
            Back to Home
        </Button>
        <Container maxWidth="xs">
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography variant="h3" component="h1" sx={{ fontFamily: 'serif', mb: 1 }}>
                        Scribe & Stem
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        Your wedding story starts here.
                    </Typography>
                </Box>
                
                <Suspense fallback={<CircularProgress />}>
                    <LoginForm />
                </Suspense>

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="body2">
                        Don't have an account?{" "}
                        <Link href="/register" passHref>
                            <Typography component="a" color="primary" sx={{ fontWeight: 'medium' }}>
                                Create one
                            </Typography>
                        </Link>
                    </Typography>
                    <Link href="/forgot-password" passHref>
                        <Typography component="a" variant="body2" color="text.secondary" sx={{ mt: 1, display: 'inline-block' }}>
                            Forgot your password?
                        </Typography>
                    </Link>
                </Box>
            </Paper>
        </Container>
    </Box>
  );
}