
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import InspoTool from '../InspoTool';

// Mock data
const mockPalettes = [
  { id: '1', name: 'Overall Mood', isPublic: false, userId: 'user1', createdAt: '2023-01-01T12:00:00Z', updatedAt: '2023-01-01T12:00:00Z' },
  { id: '2', name: 'Color Schemes', isPublic: true, userId: 'user1', createdAt: '2023-01-02T12:00:00Z', updatedAt: '2023-01-02T12:00:00Z' },
];

const mockSparks = [
  { id: 's1', paletteId: '1', imageUrl: 'https://example.com/boho.jpg', title: 'Boho Beach Reception', description: 'Description 1', tags: ['boho', 'beach'], sourceUrl: 'https://example.com/source1', createdAt: '2023-01-01T12:00:00Z', updatedAt: '2023-01-01T12:00:00Z' },
  { id: 's2', paletteId: '1', imageUrl: 'https://example.com/vintage.jpg', title: 'Vintage Aisle Decor', description: 'Description 2', tags: ['vintage', 'decor'], sourceUrl: 'https://example.com/source2', createdAt: '2023-01-01T12:00:00Z', updatedAt: '2023-01-01T12:00:00Z' },
];

describe('InspoTool', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    fetchMock.mockResponse(async req => {
      if (req.url === '/api/palettes') {
        return JSON.stringify(mockPalettes);
      }
      if (req.url === `/api/palettes/${mockPalettes[0].id}/sparks`) {
        return JSON.stringify(mockSparks);
      }
      if (req.url.includes('/api/palettes/explore')) {
        return JSON.stringify([]);
      }
      return JSON.stringify({});
    });
  });

  it('renders the main components and mock data', async () => {
    await act(async () => {
      render(<InspoTool />);
    });

    // Check for the main title
    expect(screen.getByText('Inspiration')).toBeInTheDocument();

    // Check for a board tab
    expect(await screen.findByText('Overall Mood')).toBeInTheDocument();

    // Check for an inspiration item by its title in the ImageListItemBar
    expect(await screen.findByText('Boho Beach Reception')).toBeInTheDocument();
    expect(await screen.findByText('Vintage Aisle Decor')).toBeInTheDocument();
  });
});
