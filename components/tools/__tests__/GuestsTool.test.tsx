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

    // Check for summary cards
    const totalGuestsCard = screen.getByText('Total Guests').closest('.bg-white.rounded-3xl');
    expect(within(totalGuestsCard as HTMLElement).getByText('2')).toBeInTheDocument();

    const confirmedCard = screen.getByText('Confirmed', { selector: 'p.text-green-700' }).closest('.bg-white.rounded-3xl');
    expect(within(confirmedCard as HTMLElement).getByText('1')).toBeInTheDocument();
    
    const pendingCard = screen.getByText('Pending', { selector: 'p.text-amber-700' }).closest('.bg-white.rounded-3xl');
    expect(within(pendingCard as HTMLElement).getByText('1')).toBeInTheDocument();

    const declinedCard = screen.getByText('Declined', { selector: 'p.text-red-700' }).closest('.bg-white.rounded-3xl');
    expect(within(declinedCard as HTMLElement).getByText('0')).toBeInTheDocument();
    
    // Check search and filter
    expect(screen.getByPlaceholderText('Search guests...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirmed' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pending' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Declined' })).toBeInTheDocument();

    // Check group by buttons
    expect(screen.getByRole('button', { name: 'None' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Side' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Group' })).toBeInTheDocument();

    // Check for an item in the list
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@doe.com • Family')).toBeInTheDocument(); // Combined text in single p
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane@smith.com • Friends')).toBeInTheDocument(); // Combined text in single p

    // Check RSVP status chips
    const johnDoeRow = screen.getByText('John Doe').closest('div.flex.items-center');
    expect(within(johnDoeRow as HTMLElement).getByText('Confirmed')).toBeInTheDocument();
    
    const janeSmithRow = screen.getByText('Jane Smith').closest('div.flex.items-center');
    expect(within(janeSmithRow as HTMLElement).getByText('Pending')).toBeInTheDocument();
  });
});