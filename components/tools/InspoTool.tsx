"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Tabs,
  Tab,
  IconButton,
  CircularProgress,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Menu,
  MenuItem,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Stack,
  InputAdornment,
} from '@mui/material';
import Masonry from '@mui/lab/Masonry';
import Add from '@mui/icons-material/Add';
import MoreVert from '@mui/icons-material/MoreVert';
import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import Share from '@mui/icons-material/Share';
import OpenInNew from '@mui/icons-material/OpenInNew';
import Label from '@mui/icons-material/Label';
import type { Palette, Spark } from '@/lib/db/schema';
import { toast } from "sonner";

// --- Types ---
interface SparkWithTags extends Spark {
  tags: string[];
}

// --- Components ---

function AddSparkDialog({ open, onClose, paletteId, onSparkAdded }: { open: boolean, onClose: () => void, paletteId: string, onSparkAdded: () => void }) {
    const [imageUrl, setImageUrl] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [tagsInput, setTagsInput] = useState("");

    const handleAddSpark = async () => {
        if (!imageUrl.trim()) return;

        const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

        try {
            const response = await fetch('/api/sparks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paletteId, imageUrl, title, description, tags }),
            });

            if (response.ok) {
                toast.success("Spark added!");
                onSparkAdded();
                onClose();
                setImageUrl("");
                setTitle("");
                setDescription("");
                setTagsInput("");
            } else {
                toast.error("Failed to add Spark.");
            }
        } catch (error) {
            console.error("Failed to add spark", error);
            toast.error("Failed to add Spark.");
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add a new Spark</DialogTitle>
            <DialogContent>
                <TextField autoFocus margin="dense" label="Image URL" type="url" fullWidth variant="outlined" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required sx={{ mb: 2, mt: 1 }} />
                <TextField margin="dense" label="Title" type="text" fullWidth variant="outlined" value={title} onChange={(e) => setTitle(e.target.value)} sx={{ mb: 2 }} />
                <TextField margin="dense" label="Description" type="text" fullWidth multiline rows={2} variant="outlined" value={description} onChange={(e) => setDescription(e.target.value)} sx={{ mb: 2 }} />
                <TextField 
                    margin="dense" 
                    label="Tags (comma separated)" 
                    type="text" 
                    fullWidth 
                    variant="outlined" 
                    value={tagsInput} 
                    onChange={(e) => setTagsInput(e.target.value)}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><Label fontSize="small" /></InputAdornment>,
                    }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleAddSpark} variant="contained">Add Spark</Button>
            </DialogActions>
        </Dialog>
    );
}

function SparkDetailDialog({ spark, open, onClose, onDelete, onEdit }: { spark: SparkWithTags | null, open: boolean, onClose: () => void, onDelete: (id: string) => void, onEdit: (spark: SparkWithTags) => void }) {
    if (!spark) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
                <Box sx={{ flex: 1, bgcolor: 'black', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                    <img 
                        src={spark.imageUrl} 
                        alt={spark.title || "Spark"} 
                        style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }} 
                    />
                </Box>
                <Box sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h5" component="h2" fontWeight="bold">
                            {spark.title || "Untitled Spark"}
                        </Typography>
                        <Box>
                            <IconButton onClick={() => onEdit(spark)} size="small"><Edit /></IconButton>
                            <IconButton onClick={() => { onDelete(spark.id); onClose(); }} size="small" color="error"><Delete /></IconButton>
                        </Box>
                    </Box>

                    {spark.description && (
                        <Typography variant="body1" color="text.secondary" paragraph>
                            {spark.description}
                        </Typography>
                    )}

                    {spark.tags && spark.tags.length > 0 && (
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" gutterBottom>Tags</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {spark.tags.map((tag, i) => (
                                    <Chip key={i} label={tag} size="small" />
                                ))}
                            </Box>
                        </Box>
                    )}

                    <Box sx={{ mt: 'auto', pt: 2 }}>
                        {spark.sourceUrl && (
                            <Button 
                                startIcon={<OpenInNew />} 
                                href={spark.sourceUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                fullWidth
                                variant="outlined"
                                sx={{ mb: 1 }}
                            >
                                Visit Source
                            </Button>
                        )}
                        <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
                            Added {new Date(spark.createdAt).toLocaleDateString()}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Dialog>
    );
}

function SparkCard({ spark, onClick }: { spark: SparkWithTags, onClick: (spark: SparkWithTags) => void }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Card 
            sx={{ 
                cursor: 'zoom-in', 
                position: 'relative', 
                borderRadius: 4, 
                overflow: 'hidden',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                }
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => onClick(spark)}
        >
            <CardMedia
                component="img"
                image={`${spark.imageUrl}?w=400&auto=format`}
                alt={spark.title || "Spark"}
                sx={{ display: 'block', width: '100%', height: 'auto' }}
            />
            
            {/* Hover Overlay */}
            <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: 'rgba(0,0,0,0.4)',
                opacity: isHovered ? 1 : 0,
                transition: 'opacity 0.2s',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                p: 2
            }}>
                <Typography variant="subtitle1" color="white" fontWeight="bold" noWrap>
                    {spark.title}
                </Typography>
                {spark.tags && spark.tags.length > 0 && (
                   <Typography variant="caption" color="white" noWrap>
                       {spark.tags.slice(0, 3).join(", ")}
                   </Typography>
                )}
            </Box>
        </Card>
    );
}

function EditSparkDialog({ open, onClose, spark, onUpdate }: { open: boolean, onClose: () => void, spark: SparkWithTags | null, onUpdate: () => void }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [tagsInput, setTagsInput] = useState("");

    useEffect(() => {
        if (spark) {
            setTitle(spark.title || "");
            setDescription(spark.description || "");
            setTagsInput((spark.tags || []).join(", "));
        }
    }, [spark]);

    const handleSave = async () => {
        if (!spark) return;

        const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

        try {
            const response = await fetch(`/api/sparks/${spark.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description, tags }),
            });

            if (response.ok) {
                toast.success("Spark updated");
                onUpdate();
                onClose();
            } else {
                toast.error("Failed to update spark");
            }
        } catch (error) {
            toast.error("Failed to update spark");
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Edit Spark</DialogTitle>
            <DialogContent>
                 <TextField margin="dense" label="Title" fullWidth variant="outlined" value={title} onChange={(e) => setTitle(e.target.value)} sx={{ mt: 1, mb: 2 }} />
                 <TextField margin="dense" label="Description" fullWidth multiline rows={3} variant="outlined" value={description} onChange={(e) => setDescription(e.target.value)} sx={{ mb: 2 }} />
                 <TextField margin="dense" label="Tags" fullWidth variant="outlined" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} variant="contained">Save Changes</Button>
            </DialogActions>
        </Dialog>
    );
}

function SparkList({ palette }: { palette: Palette }) {
    const [sparks, setSparks] = useState<SparkWithTags[]>([]);
    const [loading, setLoading] = useState(true);
    const [openAddSparkDialog, setOpenAddSparkDialog] = useState(false);
    
    // Details View
    const [selectedSpark, setSelectedSpark] = useState<SparkWithTags | null>(null);
    const [openDetailDialog, setOpenDetailDialog] = useState(false);

    // Edit View
    const [editingSpark, setEditingSpark] = useState<SparkWithTags | null>(null);
    const [openEditDialog, setOpenEditDialog] = useState(false);

    const fetchSparks = useCallback(async () => {
        if (!palette?.id) return;
        setLoading(true);
        try {
            const response = await fetch(`/api/palettes/${palette.id}/sparks`);
            if (response.ok) {
                const data = await response.json();
                setSparks(data);
            }
        } catch (error) {
            console.error("Failed to fetch sparks", error);
        } finally {
            setLoading(false);
        }
    }, [palette]);

    useEffect(() => {
        fetchSparks();
    }, [fetchSparks]);

    const handleSparkAdded = () => {
        fetchSparks();
    };

    const handleSparkClick = (spark: SparkWithTags) => {
        setSelectedSpark(spark);
        setOpenDetailDialog(true);
    };

    const handleEditClick = (spark: SparkWithTags) => {
        setEditingSpark(spark);
        setOpenEditDialog(true);
        setOpenDetailDialog(false); // Close detail if open
    };
    
    const handleDeleteSpark = async (sparkId: string) => {
        if (!confirm("Are you sure you want to delete this Spark?")) return;
        
        try {
            const res = await fetch(`/api/sparks/${sparkId}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success("Spark deleted");
                fetchSparks();
                if (selectedSpark?.id === sparkId) setOpenDetailDialog(false);
            } else {
                toast.error("Failed to delete spark");
            }
        } catch (e) {
            toast.error("Failed to delete spark");
        }
    }


    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    }

    return (
        <>
            <AddSparkDialog 
                open={openAddSparkDialog} 
                onClose={() => setOpenAddSparkDialog(false)} 
                paletteId={palette.id} 
                onSparkAdded={handleSparkAdded} 
            />

            <SparkDetailDialog 
                spark={selectedSpark} 
                open={openDetailDialog} 
                onClose={() => setOpenDetailDialog(false)}
                onDelete={handleDeleteSpark}
                onEdit={handleEditClick}
            />

            <EditSparkDialog 
                open={openEditDialog} 
                onClose={() => setOpenEditDialog(false)} 
                spark={editingSpark} 
                onUpdate={fetchSparks} 
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                 <Button variant="contained" startIcon={<Add />} onClick={() => setOpenAddSparkDialog(true)}>
                    Add Spark
                </Button>
            </Box>
            
            {sparks.length > 0 ? (
                <Box sx={{ width: '100%', minHeight: 200 }}>
                    <Masonry columns={{ xs: 2, sm: 3, md: 4 }} spacing={2}>
                        {sparks.map((spark) => (
                            <SparkCard key={spark.id} spark={spark} onClick={handleSparkClick} />
                        ))}
                    </Masonry>
                </Box>
            ) : (
                <Paper elevation={0} sx={{ textAlign: 'center', p: 8, bgcolor: 'grey.50', borderRadius: 4, borderStyle: 'dashed', borderWidth: 2, borderColor: 'divider' }}>
                    <Typography variant="h6" component="h2" sx={{ mb: 1 }}>Start your collection</Typography>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>Add your first Spark to this palette.</Typography>
                    <Button variant="outlined" startIcon={<Add />} onClick={() => setOpenAddSparkDialog(true)}>
                        Add Spark
                    </Button>
                </Paper>
            )}
        </>
    );
}

export default function InspoTool() {
  const [palettes, setPalettes] = useState<Palette[]>([]);
  const [activePaletteIndex, setActivePaletteIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [openNewPaletteDialog, setOpenNewPaletteDialog] = useState(false);
  const [newPaletteName, setNewPaletteName] = useState("");

  useEffect(() => {
    fetchPalettes();
  }, []);

  const fetchPalettes = async () => {
    try {
      const response = await fetch('/api/palettes');
      if (response.ok) {
        const data = await response.json();
        setPalettes(data);
      }
    } catch (error) {
      console.error("Failed to fetch palettes", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaletteChange = (event: React.SyntheticEvent, newValue: number) => {
    setActivePaletteIndex(newValue);
  };
  
  const handleCreatePalette = async () => {
    if (!newPaletteName.trim()) return;

    try {
      const response = await fetch('/api/palettes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPaletteName }),
      });
      if (response.ok) {
        toast.success("Palette created!");
        await fetchPalettes(); // Re-fetch to get the new list
        setNewPaletteName("");
        setOpenNewPaletteDialog(false);
        setActivePaletteIndex(palettes.length); // Switch to the new palette
      } else {
        toast.error("Failed to create palette.");
      }
    } catch (error) {
      console.error("Failed to create palette", error);
      toast.error("Failed to create palette.");
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Dialog open={openNewPaletteDialog} onClose={() => setOpenNewPaletteDialog(false)}>
        <DialogTitle>Create a New Palette</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Palette Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newPaletteName}
            onChange={(e) => setNewPaletteName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewPaletteDialog(false)}>Cancel</Button>
          <Button onClick={handleCreatePalette} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Inspiration
          </Typography>
          <Typography color="text.secondary">
            Collect and organize your wedding ideas.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpenNewPaletteDialog(true)}>
          New Palette
        </Button>
      </Box>

      {palettes.length > 0 ? (
        <>
          <Box sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
                value={activePaletteIndex} 
                onChange={handlePaletteChange} 
                variant="scrollable" 
                scrollButtons="auto"
                sx={{ '& .MuiTab-root': { textTransform: 'none', fontSize: '1rem' } }}
            >
              {palettes.map((palette) => (
                <Tab label={palette.name} key={palette.id} />
              ))}
            </Tabs>
          </Box>
          
          <SparkList palette={palettes[activePaletteIndex]} />
        </>
      ) : (
        <Paper elevation={0} sx={{ textAlign: 'center', p: 10, bgcolor: 'grey.50', borderRadius: 4 }}>
            <Typography variant="h5" component="h2" sx={{ mb: 2 }} fontWeight="bold">
                Create your first Palette
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
                Palettes are boards where you can save and organize your ideas. Create one for your Venue, Dress, Cake, or anything else!
            </Typography>
            <Button variant="contained" size="large" onClick={() => setOpenNewPaletteDialog(true)}>
                Create Palette
            </Button>
        </Paper>
      )}
    </Container>
  );
}
