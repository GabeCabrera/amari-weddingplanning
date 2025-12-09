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

  it('renders the new Wedding Hub dashboard correctly including Sanity Score', async () => {
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

      // Sanity Score Section
      expect(screen.getByText('System Status')).toBeInTheDocument();
      expect(screen.getByText('Sanity')).toBeInTheDocument();
      
      // Check score using testId
      const scoreElement = screen.getByTestId('sanity-score');
      expect(scoreElement).toBeInTheDocument();
      // Verify it contains a number
      expect(scoreElement.textContent).toMatch(/\d+/);

      // Friction Slider
      expect(screen.getByText('Family Friction Index')).toBeInTheDocument();
      expect(screen.getByRole('slider')).toBeInTheDocument();

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
      
      // Guests Card
      const guestsCard = screen.getByRole('heading', { name: 'Guest List' }).closest('.group');
      expect(guestsCard).toBeInTheDocument();
      expect(within(guestsCard as HTMLElement).getByText('100')).toBeInTheDocument();
    });
  });

  it('updates Sanity Score when Family Friction slider changes', async () => {
    const mockData = {
        summary: { coupleNames: 'A & B', weddingDate: '2025-01-01', daysUntil: 100 },
        budget: { total: 10000, spent: 5000, paid: 0, remaining: 5000, percentUsed: 50, items: [] },
        guests: { stats: { total: 100, confirmed: 0, pending: 0, declined: 0 }, list: [] },
        vendors: { list: [], stats: { booked: 0 } },
        decisions: { progress: { percentComplete: 0 } },
        kernel: { guestCount: 100 },
    };

    mockedUsePlannerData.mockReturnValue({
        data: mockData,
        loading: false,
        refetch: jest.fn(),
        lastRefresh: Date.now(),
    });

    render(<BrowserProvider><DashboardTool /></BrowserProvider>);

    const slider = screen.getByRole('slider');
    const initialScoreElement = screen.getByTestId('sanity-score');
    const initialScore = parseInt(initialScoreElement.textContent || '100');

    // Increase friction to max (10)
    fireEvent.change(slider, { target: { value: '10' } });

    // Score should decrease
    await waitFor(() => {
         const newScoreElement = screen.getByTestId('sanity-score');
         const newScore = parseInt(newScoreElement.textContent || '0');
         expect(newScore).toBeLessThan(initialScore);
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
