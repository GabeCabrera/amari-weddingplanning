"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
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
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon, Google as GoogleIcon } from '@mui/icons-material';
import { toast } from "sonner";
import * as redditPixel from "@/lib/reddit-pixel";

function RegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    emailOptIn: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    try {
      redditPixel.trackSignUp();
      await signIn("google", { callbackUrl: "/welcome" });
    } catch {
      toast.error("Something went wrong with Google sign up.");
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Registration failed.");
      }

      const signInResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        throw new Error(signInResult.error);
      }

      toast.success("Account created successfully!");
      redditPixel.trackSignUp();
      window.location.href = "/welcome";
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
        <Button
            type="button"
            variant="outlined"
            fullWidth
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignUp}
            disabled={isLoading || isGoogleLoading}
            sx={{ mb: 2, textTransform: 'none', py: 1.5 }}
        >
            {isGoogleLoading ? <CircularProgress size={24} /> : "Sign Up with Google"}
        </Button>

        <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">OR</Typography>
        </Divider>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Your Names" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Emma & James" required disabled={isLoading || isGoogleLoading} />
            <TextField label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} required disabled={isLoading || isGoogleLoading} />
            <TextField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} required disabled={isLoading || isGoogleLoading} helperText="At least 8 characters" />
            <TextField label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required disabled={isLoading || isGoogleLoading} />
            
            <FormControlLabel
                control={<Checkbox name="emailOptIn" checked={formData.emailOptIn} onChange={handleChange} disabled={isLoading || isGoogleLoading} />}
                label={<Typography variant="body2">Send me helpful wedding planning tips and updates.</Typography>}
            />
            
            <Button type="submit" variant="contained" fullWidth disabled={isLoading || isGoogleLoading} sx={{ py: 1.5, mt: 1 }}>
                {isLoading ? <CircularProgress size={24} /> : "Create Account"}
            </Button>
        </Box>
    </Box>
  );
}

export default function RegisterPage() {
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
                        Create your account.
                    </Typography>
                </Box>
                
                <Suspense fallback={<CircularProgress />}>
                    <RegisterForm />
                </Suspense>

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="body2">
                        Already have an account?{" "}
                        <Link href="/login" passHref>
                            <Typography component="a" color="primary" sx={{ fontWeight: 'medium' }}>
                                Sign In
                            </Typography>
                        </Link>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    </Box>
  );
}