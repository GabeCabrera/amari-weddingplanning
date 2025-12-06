"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  TextField, 
  Button, 
  Container, 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  FormControl, 
  FormLabel, 
  RadioGroup, 
  FormControlLabel, 
  Radio,
  Select,
  MenuItem,
  InputLabel,
  Checkbox,
  Alert,
  Avatar
} from "@mui/material";
import { Heart, Check, Calendar, Mail } from "lucide-react";
import { toast } from "sonner";
import type { RsvpForm } from "@/lib/db/schema";

interface StemClientProps {
  form: RsvpForm;
  coupleNames: string;
  weddingDate?: string;
}

interface FormFields {
  name: boolean;
  email: boolean;
  phone: boolean;
  address: boolean;
  attending: boolean;
  mealChoice: boolean;
  dietaryRestrictions: boolean;
  plusOne: boolean;
  plusOneName: boolean;
  plusOneMeal: boolean;
  songRequest: boolean;
  notes: boolean;
}

export function StemClient({ form, coupleNames, weddingDate }: StemClientProps) {
  const fields = form.fields as FormFields;
  const mealOptions = (form.mealOptions as string[]) || [];
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    attending: null as boolean | null,
    mealChoice: "",
    dietaryRestrictions: "",
    plusOne: false,
    plusOneName: "",
    plusOneMeal: "",
    songRequest: "",
    notes: "",
  });

  const updateField = (key: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error("Please enter your name");
      return;
    }

    if (fields.attending && formData.attending === null) {
      toast.error("Please let us know if you'll be attending");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/rsvp/${form.slug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit");
      }

      setIsSubmitted(true);
      toast.success("Thank you for your response!");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isSubmitted) {
    return (
      <Container maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'success.light', width: 56, height: 56 }}>
                <Check />
            </Avatar>
            <Typography variant="h4" component="h1" gutterBottom>
              You're All Set!
            </Typography>
            <Typography color="text.secondary">
              {formData.attending 
                ? `${coupleNames} can't wait to celebrate with you!`
                : `Thank you for letting ${coupleNames} know.`
              }
            </Typography>
          </Paper>
        </motion.div>
      </Container>
    );
  }

  return (
    <main>
      <Box sx={{ py: 6, bgcolor: 'grey.50', textAlign: 'center' }}>
        <Container maxWidth="md">
            <Typography variant="h2" component="h1" gutterBottom>
                {coupleNames} are getting married!
            </Typography>
            {weddingDate && (
                <Typography variant="h6" color="text.secondary">
                    {formatDate(weddingDate)}
                </Typography>
            )}
             {form.message && (
                <Typography variant="body1" sx={{ mt: 2 }}>
                    {form.message}
                </Typography>
             )}
        </Container>
      </Box>
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 } }}>
          <Typography variant="h5" component="h2" gutterBottom>
            RSVP
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {fields.name && (
                <TextField
                    label="Your Name"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Enter your full name"
                    required
                    fullWidth
                />
            )}
             {fields.attending && (
                <FormControl component="fieldset">
                    <FormLabel component="legend">Will you be attending? *</FormLabel>
                    <RadioGroup row value={formData.attending === null ? '' : String(formData.attending)} onChange={(e) => updateField("attending", e.target.value === 'true')}>
                        <FormControlLabel value="true" control={<Radio />} label="Joyfully Accept" />
                        <FormControlLabel value="false" control={<Radio />} label="Regretfully Decline" />
                    </RadioGroup>
                </FormControl>
             )}
              {formData.attending && (
                <>
                  {fields.mealChoice && mealOptions.length > 0 && (
                     <FormControl fullWidth>
                        <InputLabel>Meal Preference</InputLabel>
                        <Select value={formData.mealChoice} label="Meal Preference" onChange={(e) => updateField("mealChoice", e.target.value)}>
                            <MenuItem value=""><em>Select a meal option</em></MenuItem>
                            {mealOptions.map((option) => (
                                <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                  )}
                  {fields.dietaryRestrictions && (
                     <TextField
                        label="Dietary Restrictions"
                        value={formData.dietaryRestrictions}
                        onChange={(e) => updateField("dietaryRestrictions", e.target.value)}
                        placeholder="e.g., Vegetarian, gluten-free, allergies"
                        fullWidth
                    />
                  )}
                  {fields.plusOne && (
                    <FormControlLabel
                        control={<Checkbox checked={formData.plusOne} onChange={(e) => updateField("plusOne", e.target.checked)} />}
                        label="I'll be bringing a guest"
                    />
                  )}
                  {formData.plusOne && fields.plusOneName && (
                     <TextField
                        label="Guest Name"
                        value={formData.plusOneName}
                        onChange={(e) => updateField("plusOneName", e.target.value)}
                        placeholder="Guest's full name"
                        fullWidth
                    />
                  )}
                   {formData.plusOne && fields.plusOneMeal && mealOptions.length > 0 && (
                     <FormControl fullWidth>
                        <InputLabel>Guest Meal Preference</InputLabel>
                        <Select value={formData.plusOneMeal} label="Guest Meal Preference" onChange={(e) => updateField("plusOneMeal", e.target.value)}>
                            <MenuItem value=""><em>Select a meal option</em></MenuItem>
                            {mealOptions.map((option) => (
                                <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                  )}
                  {fields.songRequest && (
                    <TextField
                        label="Song Request"
                        value={formData.songRequest}
                        onChange={(e) => updateField("songRequest", e.target.value)}
                        placeholder="What song will get you on the dance floor?"
                        fullWidth
                    />
                  )}
                </>
              )}
               {fields.notes && (
                 <TextField
                    label="Anything Else?"
                    multiline
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => updateField("notes", e.target.value)}
                    placeholder="Notes, well-wishes, or anything you'd like us to know"
                    fullWidth
                />
              )}
            <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
              {isSubmitting ? <CircularProgress size={24} /> : "Submit RSVP"}
            </Button>
          </Box>
        </Paper>
        <Typography variant="caption" display="block" color="text.secondary" textAlign="center" sx={{ mt: 2 }}>
            Created with Scribe & Stem
        </Typography>
      </Container>
    </main>
  );
}