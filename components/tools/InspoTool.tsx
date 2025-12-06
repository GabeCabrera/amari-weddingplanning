"use client";

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Tabs,
  Tab,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import { Add, MoreVert, FavoriteBorder, Favorite } from '@mui/icons-material';

// Mock Data
const mockInspirations = [
  { id: 1, src: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce', title: 'Boho Beach Reception', category: 'Reception' },
  { id: 2, src: 'https://images.unsplash.com/photo-1550005809-91ad75fb3155', title: 'Vintage Aisle Decor', category: 'Ceremony' },
  { id: 3, src: 'https://images.unsplash.com/photo-1519741497674-611481863552', title: 'Romantic Tablescape', category: 'Reception' },
  { id: 4, src: 'https://images.unsplash.com/photo-1515934751635-481eff042b1b', title: 'Minimalist Bouquet', category: 'Florals' },
  { id: 5, src: 'https://images.unsplash.com/photo-1523438885200-e6b541c275e3', title: 'Elegant Wedding Cake', category: 'Food & Drink' },
  { id: 6, src: 'https://images.unsplash.com/photo-1606800052052-a08af7148866', title: 'Rustic Invitations', category: 'Stationery' },
  { id: 7, src: 'https://images.unsplash.com/photo-1522057313221-333d416d8a7c', title: 'Candid Moments', category: 'Photography' },
  { id: 8, src: 'https://images.unsplash.com/photo-1542042161-d19111397507', title: 'Outdoor Ceremony Arch', category: 'Ceremony' },
];

const mockBoards = ['Overall Mood', 'Reception Ideas', 'Ceremony Details'];

export default function InspoTool() {
  const [board, setBoard] = useState(0);
  const [inspirations, setInspirations] = useState(mockInspirations);
  const [favorites, setFavorites] = useState<number[]>([]);

  const handleBoardChange = (event: React.SyntheticEvent, newValue: number) => {
    setBoard(newValue);
  };

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Inspiration
          </Typography>
          <Typography color="text.secondary">
            Your wedding moodboard and inspiration gallery.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />}>
          Add Inspiration
        </Button>
      </Box>

      <Paper sx={{ mb: 4 }}>
        <Tabs value={board} onChange={handleBoardChange} centered>
          {mockBoards.map((boardName) => (
            <Tab label={boardName} key={boardName} />
          ))}
        </Tabs>
      </Paper>

      <ImageList variant="masonry" cols={3} gap={16}>
        {inspirations.map((item) => (
          <ImageListItem key={item.id}>
            <img
              src={`${item.src}?w=248&fit=crop&auto=format`}
              srcSet={`${item.src}?w=248&fit=crop&auto=format&dpr=2 2x`}
              alt={item.title}
              loading="lazy"
              style={{ borderRadius: '12px' }}
            />
            <ImageListItemBar
              title={item.title}
              subtitle={item.category}
              actionIcon={
                <IconButton
                  sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
                  aria-label={`info about ${item.title}`}
                  onClick={() => toggleFavorite(item.id)}
                >
                  {favorites.includes(item.id) ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
              }
            />
          </ImageListItem>
        ))}
      </ImageList>
    </Container>
  );
}