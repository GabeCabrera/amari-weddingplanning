import React from 'react';
import { render, screen, within, act } from '@testing-library/react';
import VendorsTool from '../VendorsTool';
import * as PlannerData from '@/lib/hooks/usePlannerData';
import { BrowserProvider } from '../../../components/layout/browser-context';

// Mock the usePlannerData hook
jest.mock('@/lib/hooks/usePlannerData', () => ({
  __esModule: true,
  ...jest.requireActual('@/lib/hooks/usePlannerData'), // Import and retain default behavior
  usePlannerData: jest.fn(), // Mock only usePlannerData
}));

const mockedUsePlannerData = require('@/lib/hooks/usePlannerData').usePlannerData; // Get the mocked usePlannerData
const { formatCurrency } = require('@/lib/hooks/usePlannerData'); // Get the real formatCurrency

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
    expect(screen.getByTestId('empty-vendors-icon')).toBeInTheDocument();
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
    const totalVendorsCard = screen.getByText('Total Vendors', { selector: 'p.text-sm.mb-1' }).closest('.bg-white.rounded-3xl');
    expect(within(totalVendorsCard as HTMLElement).getByText('2')).toBeInTheDocument();

    const bookedCard = screen.getByText('Booked', { selector: 'p.text-green-700.text-sm.mb-1' }).closest('.bg-white.rounded-3xl');
    expect(within(bookedCard as HTMLElement).getByText('1')).toBeInTheDocument();
    
    const totalCostCard = screen.getByText('Total Cost', { selector: 'p.text-sm.mb-1' }).closest('.bg-white.rounded-3xl');
    expect(within(totalCostCard as HTMLElement).getByText(PlannerData.formatCurrency(mockData.vendors.stats.totalCost))).toBeInTheDocument();
    
    const depositsPaidCard = screen.getByText('Deposits Paid', { selector: 'p.text-sm.mb-1' }).closest('.bg-white.rounded-3xl');
    expect(within(depositsPaidCard as HTMLElement).getByText(PlannerData.formatCurrency(mockData.vendors.stats.totalDeposits))).toBeInTheDocument();

    // Check search and filter
    expect(screen.getByPlaceholderText('Search vendors...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Booked' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Researching' })).toBeInTheDocument();

    // Check vendor cards by category
    expect(screen.getByRole('heading', { name: 'Venue', level: 2 })).toBeInTheDocument();
    expect(screen.getByText('The Grand Hall')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Photography', level: 2 })).toBeInTheDocument(); // category header (h2)
    expect(screen.getByText('Perfect Pics')).toBeInTheDocument();
  });
});