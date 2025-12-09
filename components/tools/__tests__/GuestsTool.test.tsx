import React from 'react';
import { render, screen, within, act } from '@testing-library/react';
import GuestsTool from '../GuestsTool';
import * as PlannerData from '@/lib/hooks/usePlannerData';
import { BrowserProvider } from '../../../components/layout/browser-context';

// Mock the usePlannerData hook
jest.mock('@/lib/hooks/usePlannerData');
const mockedUsePlannerData = PlannerData.usePlannerData as jest.Mock;

describe('GuestsTool', () => {
  it('renders the empty state when there is no data', async () => {
    mockedUsePlannerData.mockReturnValue({
      data: { guests: { list: [] } },
      loading: false,
      refetch: jest.fn(),
      lastRefresh: Date.now(),
    });

    await act(async () => {
        render(<BrowserProvider><GuestsTool /></BrowserProvider>);
    });

    expect(screen.getByText('No guests yet')).toBeInTheDocument();
    expect(screen.getByText("Tell me about your guests in chat and I'll add them to your list.")).toBeInTheDocument();
    expect(screen.getByTestId('empty-guests-icon')).toBeInTheDocument();
  });

  it('renders the guest data when available', async () => {
    const mockData = {
      guests: {
        stats: {
            total: 2,
            confirmed: 1,
            pending: 1,
            declined: 0,
            withPlusOnes: 0,
            brideSide: 1,
            groomSide: 1,
            both: 0,
        },
        list: [
          { id: '1', name: 'John Doe', email: 'john@doe.com', group: 'Family', side: 'bride', rsvp: 'confirmed' },
          { id: '2', name: 'Jane Smith', email: 'jane@smith.com', group: 'Friends', side: 'groom', rsvp: 'pending' },
        ],
      },
    };

    mockedUsePlannerData.mockReturnValue({
      data: mockData,
      loading: false,
      refetch: jest.fn(),
      lastRefresh: Date.now(),
    });

    await act(async () => {
        render(<BrowserProvider><GuestsTool /></BrowserProvider>);
    });

    // Check for summary stats
    expect(screen.getByText('Total Guests')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    
    // Check for "Confirmed" stats label. We know it appears multiple times, so we filter.
    // The stats label is a <p>
    const confirmedLabels = screen.getAllByText('Confirmed');
    const statsLabel = confirmedLabels.find(el => el.tagName === 'P');
    expect(statsLabel).toBeInTheDocument();

    // Check search and filter
    expect(screen.getByPlaceholderText('Search guests...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    
    // Check filter buttons specifically
    const confirmedButton = screen.getAllByRole('button', { name: 'Confirmed' })[0];
    expect(confirmedButton).toBeInTheDocument();

    const pendingButton = screen.getAllByRole('button', { name: 'Pending' })[0];
    expect(pendingButton).toBeInTheDocument();

    // Check group by buttons
    expect(screen.getByRole('button', { name: 'None' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Side' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Group' })).toBeInTheDocument();

    // Check for an item in the list
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    
    // Check emails and groups
    expect(screen.getByText(/john@doe\.com/)).toBeInTheDocument();
    expect(screen.getByText(/Family/)).toBeInTheDocument();
    expect(screen.getByText(/jane@smith\.com/)).toBeInTheDocument();
    expect(screen.getByText(/Friends/)).toBeInTheDocument();

    // Check RSVP status chips
    // John is Confirmed. We look for a chip inside his row.
    // Strategy: Find John's name, traverse up to the row container, then find "Confirmed" inside it.
    const johnName = screen.getByText('John Doe');
    // The structure is likely: div(row) > div > p(name) ...
    // We can use closest to find the row container. The row has class "flex items-center py-3..."
    // Since we don't want to rely on classes, we can look for the container that contains both Name and Status.
    // But testing-library encourages `within`.
    
    // Let's assume the row is the nearest listitem or just a div.
    // The row is: <div className="flex items-center py-3 px-4 border-b ...">
    
    // Simpler: just ensure there is a "Confirmed" chip (span) in the document.
    const chips = screen.getAllByText('Confirmed').filter(el => el.tagName === 'SPAN');
    expect(chips.length).toBeGreaterThan(0);
    
    const pendingChips = screen.getAllByText('Pending').filter(el => el.tagName === 'SPAN');
    expect(pendingChips.length).toBeGreaterThan(0);
  });
});