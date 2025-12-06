"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Container,
  Paper,
  LinearProgress,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  RadioButtonUnchecked,
  CheckCircle,
  Lock,
  Search,
  HorizontalRule,
} from "@mui/icons-material";

// Interfaces
interface Decision {
  id: string;
  name: string;
  displayName: string;
  category: string;
  status: string;
  isRequired: boolean;
  isSkipped: boolean;
  choiceName?: string;
  choiceAmount?: number;
  lockReason?: string;
  lockDetails?: string;
}

interface DecisionProgress {
  total: number;
  locked: number;
  decided: number;
  researching: number;
  notStarted: number;
  percentComplete: number;
}

const categoryLabels: Record<string, string> = {
  foundation: "Foundation",
  venue: "Venue",
  vendors: "Vendors",
  attire: "Attire",
  ceremony: "Ceremony",
  reception: "Reception",
  guests: "Guests & Invitations",
  logistics: "Logistics",
  legal: "Legal",
  honeymoon: "Honeymoon",
};

const categoryOrder = Object.keys(categoryLabels);

function DecisionRow({ decision }: { decision: Decision }) {
  const StatusIcon = () => {
    if (decision.isSkipped) return <HorizontalRule fontSize="small" color="disabled" />;
    switch (decision.status) {
      case "locked": return <Lock color="success" />;
      case "decided": return <CheckCircle color="success" />;
      case "researching": return <Search color="warning" />;
      default: return <RadioButtonUnchecked color="action" />;
    }
  };

  return (
    <ListItem
      secondaryAction={
        decision.choiceAmount ? (
          <Typography variant="body2">
            ${(decision.choiceAmount / 100).toLocaleString()}
          </Typography>
        ) : null
      }
      sx={{ pl: 2, pr: 4 }}
      divider
    >
      <ListItemIcon sx={{ minWidth: 40 }}>
        <StatusIcon />
      </ListItemIcon>
      <ListItemText
        primary={
          <Typography sx={{ textDecoration: decision.isSkipped ? 'line-through' : 'none' }}>
            {decision.displayName}
            {decision.isRequired && !decision.isSkipped && (
              <Typography component="span" color="error.main" sx={{ ml: 0.5 }}>*</Typography>
            )}
          </Typography>
        }
        secondary={decision.choiceName || decision.lockDetails}
      />
    </ListItem>
  );
}

export default function ChecklistTool() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [progress, setProgress] = useState<DecisionProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const loadDecisions = async () => {
      try {
        const res = await fetch("/api/decisions");
        const data = await res.json();
        if (data.decisions) {
          setDecisions(data.decisions);
          setProgress(data.progress);
        }
      } catch (e) {
        console.error("Failed to load decisions:", e);
      } finally {
        setLoading(false);
      }
    };
    loadDecisions();
  }, []);

  const byCategory = decisions.reduce((acc, d) => {
    if (!acc[d.category]) acc[d.category] = [];
    acc[d.category].push(d);
    return acc;
  }, {} as Record<string, Decision[]>);

  const getFilteredDecisions = (categoryDecisions: Decision[]) => {
    if (filter === "all") return categoryDecisions;
    if (filter === "todo") return categoryDecisions.filter(d => d.status === "not_started" && !d.isSkipped);
    if (filter === "done") return categoryDecisions.filter(d => d.status === "decided" || d.status === "locked");
    return categoryDecisions;
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>Wedding Checklist</Typography>
          {progress && (
            <Typography color="text.secondary">
              {progress.decided} of {progress.total} complete
            </Typography>
          )}
        </Box>
      </Box>

      {progress && (
        <Paper sx={{ p: 2, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <LinearProgress
              variant="determinate"
              value={progress.percentComplete}
              sx={{ flexGrow: 1, height: 10, borderRadius: 5 }}
            />
            <Typography variant="body2" color="text.secondary">{progress.percentComplete}%</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
            <Chip icon={<Lock />} label={`${progress.locked} Locked`} size="small" variant="outlined" color="success" />
            <Chip icon={<CheckCircle />} label={`${progress.decided - progress.locked} Decided`} size="small" variant="outlined" color="success" />
            <Chip icon={<Search />} label={`${progress.researching} Researching`} size="small" variant="outlined" color="warning" />
            <Chip icon={<RadioButtonUnchecked />} label={`${progress.notStarted} To-Do`} size="small" variant="outlined" />
          </Box>
        </Paper>
      )}

      <Box sx={{ mb: 4 }}>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(e, newValue) => newValue && setFilter(newValue)}
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="todo">To-Do</ToggleButton>
          <ToggleButton value="done">Done</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box>
        {categoryOrder.map(category => {
          const categoryDecisions = getFilteredDecisions(byCategory[category] || []);
          if (categoryDecisions.length === 0) return null;

          return (
            <Accordion key={category} defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">{categoryLabels[category] || category}</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <List sx={{ p: 0 }}>
                  {categoryDecisions.map(decision => (
                    <DecisionRow key={decision.id} decision={decision} />
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>
    </Container>
  );
}