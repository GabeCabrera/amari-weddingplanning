import React from 'react';
import { render, screen, waitFor, within, fireEvent } from '@testing-library/react';
import ChecklistTool from '../ChecklistTool';
import { act } from 'react'; // Import act for async rendering

// Mock the fetch function
const mockFetch = (data: any, delay = 0) =>
  jest.fn(() =>
    new Promise(resolve => setTimeout(() => resolve({ json: () => Promise.resolve(data) }), delay))
  );

describe('ChecklistTool', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders loading state initially', async () => {
    (global.fetch as jest.Mock) = mockFetch({}, 1000); // Simulate loading
    
    await act(async () => {
        render(<ChecklistTool />);
    });

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders the checklist with fetched data', async () => {
    (global.fetch as jest.Mock) = mockFetch({
      decisions: [
        {
          id: '1',
          name: 'decide_on_venue',
          displayName: 'Decide on a Venue',
          category: 'venue',
          status: 'not_started',
          isRequired: true,
          isSkipped: false,
        },
      ],
      progress: {
        total: 1,
        locked: 0,
        decided: 0,
        researching: 0,
        notStarted: 1,
        percentComplete: 0,
      },
    });

    await act(async () => {
        render(<ChecklistTool />);
    });

    // Wait for the component to finish loading data
    await waitFor(() => {
      // Check for the main title
      expect(screen.getByText('Wedding Checklist')).toBeInTheDocument();
    });

    // Check for progress information
    expect(screen.getByText(/0\s+of\s+1\s+decisions\s+complete/i)).toBeInTheDocument();

    // Check progress chips
    const lockedChip = screen.getByText('Locked').closest('div.flex.flex-col.items-center');
    expect(within(lockedChip as HTMLElement).getByText('0')).toBeInTheDocument();
    
    const decidedChip = screen.getByText('Decided').closest('div.flex.flex-col.items-center');
    expect(within(decidedChip as HTMLElement).getByText('0')).toBeInTheDocument();
    
    const researchingChip = screen.getByText('Researching').closest('div.flex.flex-col.items-center');
    expect(within(researchingChip as HTMLElement).getByText('0')).toBeInTheDocument();
    
    const todoChip = screen.getByText('To-Do').closest('div.flex.flex-col.items-center');
    expect(within(todoChip as HTMLElement).getByText('1')).toBeInTheDocument();

    // Check filter buttons
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Todo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();

    // Simulate click to expand "Venue" category
    const venueCategoryHeader = screen.getByRole('heading', { name: 'Venue' });
    fireEvent.click(venueCategoryHeader);

    // Now check for the mock decision
    expect(screen.getByText('Decide on a Venue')).toBeInTheDocument();
  });
});