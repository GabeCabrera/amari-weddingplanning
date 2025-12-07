import React from 'react';
import { render, screen, within } from '@testing-library/react';
import GuestsTool from '../GuestsTool';
import * as PlannerData from '@/lib/hooks/usePlannerData';
import { BrowserProvider } from '../../../components/layout/browser-context';

// Mock the usePlannerData hook
jest.mock('@/lib/hooks/usePlannerData');
const mockedUsePlannerData = PlannerData.usePlannerData as jest.Mock;

describe('GuestsTool', () => {
  it('renders the empty state when there is no data', () => {
    mockedUsePlannerData.mockReturnValue({
      data: { guests: { list: [] } },
      loading: false,
      refetch: jest.fn(),
      lastRefresh: Date.now(),
    });

    render(<BrowserProvider><GuestsTool /></BrowserProvider>);

    expect(screen.getByText('No guests yet')).toBeInTheDocument();
    expect(screen.getByText("Tell me about your guests in chat and I'll add them to your list.")).toBeInTheDocument();
  });

  it('renders the guest data when available', () => {
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

    render(<BrowserProvider><GuestsTool /></BrowserProvider>);

    // Check for summary cards
    expect(screen.getByText('Total Guests')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();

    const confirmedCard = screen.getByTestId('confirmed-card');
    expect(within(confirmedCard).getByText('1')).toBeInTheDocument();
    
    // Check for an item in the list
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@smith.com')).toBeInTheDocument();
  });
});