
import React from 'react';
import { render, screen, within, act } from '@testing-library/react';
import VendorsTool from '../VendorsTool';
import * as PlannerData from '@/lib/hooks/usePlannerData';
import { BrowserProvider } from '../../../components/layout/browser-context';

// Mock the usePlannerData hook
jest.mock('@/lib/hooks/usePlannerData');
const mockedUsePlannerData = PlannerData.usePlannerData as jest.Mock;

describe('VendorsTool', () => {
  it('renders the empty state when there is no data', async () => {
    mockedUsePlannerData.mockReturnValue({
      data: { vendors: { list: [] } },
      loading: false,
      refetch: jest.fn(),
      lastRefresh: Date.now(),
    });

    await act(async () => {
        render(<BrowserProvider><VendorsTool /></BrowserProvider>);
    });

    expect(screen.getByText('No vendors yet')).toBeInTheDocument();
    expect(screen.getByText("Tell me about your vendors in chat and I'll track them here.")).toBeInTheDocument();
  });

  it('renders the vendor data when available', async () => {
    const mockData = {
      vendors: {
        stats: {
            total: 2,
            booked: 1,
            researching: 1,
            totalCost: 15000,
            totalDeposits: 7000,
        },
        list: [
          { id: '1', name: 'The Grand Hall', category: 'Venue', status: 'booked', cost: 10000, depositPaid: 5000 },
          { id: '2', name: 'Perfect Pics', category: 'Photography', status: 'researching', cost: 5000, depositPaid: 2000 },
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
        render(<BrowserProvider><VendorsTool /></BrowserProvider>);
    });

    // Check for summary cards
    expect(screen.getByText('Total Vendors')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();

    const bookedCard = screen.getByTestId('booked-card');
    expect(within(bookedCard).getByText('1')).toBeInTheDocument();
    
    // Check for an item in the list
    expect(screen.getByText('The Grand Hall')).toBeInTheDocument();
    expect(screen.getByText('Perfect Pics')).toBeInTheDocument();
  });
});
