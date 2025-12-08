import React from 'react';
import { render, screen, waitFor, fireEvent, act, within } from '@testing-library/react';
import DashboardTool from '../DashboardTool';
import * as PlannerData from '@/lib/hooks/usePlannerData';
import { BrowserProvider } from '../../../components/layout/browser-context';

// Mock the usePlannerData hook and formatCurrency function
jest.mock('@/lib/hooks/usePlannerData');
const mockedUsePlannerData = PlannerData.usePlannerData as jest.Mock;
const mockedFormatCurrency = PlannerData.formatCurrency as jest.Mock;

// Define MOCK_DATE_STRING globally for test scope
const MOCK_DATE_STRING = 'Friday, December 5, 2025';

// Store original Date methods
const originalToLocaleDateString = Date.prototype.toLocaleDateString;

describe('DashboardTool', () => {
    beforeAll(() => {
        // Mock toLocaleDateString
        Object.defineProperty(Date.prototype, 'toLocaleDateString', {
            configurable: true,
            value: jest.fn(() => MOCK_DATE_STRING),
        });
        mockedFormatCurrency.mockImplementation((amount: number) => `$${amount}`);
    });

    afterAll(() => {
        // Restore original Date method
        Object.defineProperty(Date.prototype, 'toLocaleDateString', {
            configurable: true,
            value: originalToLocaleDateString,
        });
        // Restore original formatCurrency mock if necessary
        mockedFormatCurrency.mockRestore();
    });

  beforeEach(() => {
    mockedUsePlannerData.mockReset();
    mockedFormatCurrency.mockClear();
  });

  it('renders loading state initially', () => {
    mockedUsePlannerData.mockReturnValue({
      data: null,
      loading: true,
      refetch: jest.fn(),
      lastRefresh: 0,
    });
    render(<BrowserProvider><DashboardTool /></BrowserProvider>);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders the new Wedding Hub dashboard correctly', async () => {
    const mockData = {
      summary: {
        coupleNames: 'John & Jane',
        weddingDate: '2025-12-05T00:00:00.000Z',
        daysUntil: 30,
      },
      budget: {
        total: 20000,
        spent: 15000,
        paid: 7000,
        remaining: 8000,
        percentUsed: 75,
        items: [],
      },
      guests: {
        stats: { total: 100, confirmed: 80, pending: 20, declined: 0 },
        list: [],
      },
      vendors: {
        list: [
          { id: 'v1', name: 'Venue Co.', category: 'Venue', status: 'booked' },
          { id: 'v2', name: 'Photog Inc.', category: 'Photography', status: 'confirmed' },
        ],
        stats: { total: 2, booked: 2, contacted: 0, researching: 0, totalCost: 0, totalDeposits: 0 },
      },
      decisions: {
        progress: { total: 10, decided: 5, locked: 1, researching: 2, notStarted: 2, percentComplete: 50 },
      },
      kernel: { guestCount: 100 },
    };

    mockedUsePlannerData.mockReturnValue({
      data: mockData,
      loading: false,
      refetch: jest.fn(),
      lastRefresh: Date.now(),
    });

    render(<BrowserProvider><DashboardTool /></BrowserProvider>);

    await waitFor(() => {
      // Header
      expect(screen.getByText('John & Jane')).toBeInTheDocument();
      expect(screen.getByText(MOCK_DATE_STRING)).toBeInTheDocument();

      // Hub cards
      // Checklist Card
      const checklistCard = screen.getByRole('heading', { name: 'Checklist' }).closest('.group');
      expect(checklistCard).toBeInTheDocument();
      expect(within(checklistCard as HTMLElement).getByText('50%')).toBeInTheDocument();
      expect(within(checklistCard as HTMLElement).getByText('5 of 10 decisions made')).toBeInTheDocument();

      // Budget Card
      const budgetCard = screen.getByRole('heading', { name: 'Budget' }).closest('.group');
      expect(budgetCard).toBeInTheDocument();
      expect(within(budgetCard as HTMLElement).getByText('$20000')).toBeInTheDocument();
      // New assertions for allocated budget:
      expect(within(budgetCard as HTMLElement).getByText('$15000')).toBeInTheDocument(); // Finds the span
      expect(within(budgetCard as HTMLElement).getByText(/\s*allocated\s*\(/i)).toBeInTheDocument(); // Finds the text node for " allocated ("
      expect(within(budgetCard as HTMLElement).getByText(/\s*75\s*/)).toBeInTheDocument(); // Finds the text node for "75"
      expect(within(budgetCard as HTMLElement).getByText(/%\)/i)).toBeInTheDocument(); // Finds the text node for "%)"

      // Guests Card
      const guestsCard = screen.getByRole('heading', { name: 'Guest List' }).closest('.group'); // Changed from 'Guests' to 'Guest List'
      expect(guestsCard).toBeInTheDocument();
      expect(within(guestsCard as HTMLElement).getByText('100')).toBeInTheDocument();
      expect(within(guestsCard as HTMLElement).getByText('80 confirmed')).toBeInTheDocument(); // Split into two spans now
      expect(within(guestsCard as HTMLElement).getByText('20 pending')).toBeInTheDocument(); // Split into two spans now

      // Vendors Card
      const vendorsCard = screen.getByRole('heading', { name: 'Vendors' }).closest('.group');
      expect(vendorsCard).toBeInTheDocument();
      expect(within(vendorsCard as HTMLElement).getByText('Venue Co.')).toBeInTheDocument();
      expect(within(vendorsCard as HTMLElement).getByText('Photog Inc.')).toBeInTheDocument();
    });
  });

  it('handles refresh button click', async () => {
    const mockRefetch = jest.fn(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      return {};
    });

    mockedUsePlannerData.mockReturnValue({
      data: {
        summary: {},
        budget: {},
        guests: { stats: {} },
        vendors: { list: [], stats: {} },
        decisions: {},
        kernel: {},
      },
      loading: false,
      refetch: mockRefetch,
      lastRefresh: Date.now(),
    });
    render(<BrowserProvider><DashboardTool /></BrowserProvider>);

    const refreshButton = screen.getByRole('button', { name: /Refresh/i });
    
    await act(async () => {
        fireEvent.click(refreshButton);
    });

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });
});
