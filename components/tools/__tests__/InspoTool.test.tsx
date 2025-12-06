
import React from 'react';
import { render, screen } from '@testing-library/react';
import InspoTool from '../InspoTool';

describe('InspoTool', () => {
  it('renders the main components and mock data', () => {
    render(<InspoTool />);

    // Check for the main title
    expect(screen.getByText('Inspiration')).toBeInTheDocument();

    // Check for a board tab
    expect(screen.getByText('Overall Mood')).toBeInTheDocument();

    // Check for an inspiration item by its title in the ImageListItemBar
    expect(screen.getByText('Boho Beach Reception')).toBeInTheDocument();
    expect(screen.getByText('Vintage Aisle Decor')).toBeInTheDocument();
  });
});
