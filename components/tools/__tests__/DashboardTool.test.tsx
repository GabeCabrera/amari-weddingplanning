import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import DashboardTool from '../DashboardTool';
import * as PlannerData from '@/lib/hooks/usePlannerData';

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
    render(<DashboardTool />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders empty state when no data is available', async () => {
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
      refetch: jest.fn(),
      lastRefresh: Date.now(),
    });
    render(<DashboardTool />);

    await waitFor(() => {
      expect(screen.getByText("Let's get started!")).toBeInTheDocument();
      expect(screen.getByText("Head to chat and tell me about your wedding plans. I'll help you organize everything.")).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Start chatting/i })).toBeInTheDocument();
    });
  });

  it('renders dashboard data when available', async () => {
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

    render(<DashboardTool />);

    await waitFor(() => {
      // Header
      expect(screen.getByText('John & Jane')).toBeInTheDocument();
      expect(screen.getByText(MOCK_DATE_STRING)).toBeInTheDocument();

      // Stats cards
      expect(screen.getByText('Days to go')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument();
      
      expect(screen.getByText('Planning progress')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
      expect(screen.getByText('5 of 10 decisions')).toBeInTheDocument();

      expect(screen.getByText('Budget')).toBeInTheDocument();
      expect(screen.getByText('$20000')).toBeInTheDocument();
      expect(screen.getByText('$15000 allocated (75%)')).toBeInTheDocument();

      expect(screen.getByText('Guests')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('80 confirmed, 20 pending')).toBeInTheDocument();

      // Quick actions
      expect(screen.getByRole('link', { name: /Chat with Aisle/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /View checklist/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Track vendors/i })).toBeInTheDocument();

      // Vendors section
      expect(screen.getByText('Your Vendors')).toBeInTheDocument();
      expect(screen.getByText('Venue Co.')).toBeInTheDocument();
      expect(screen.getByText('Photog Inc.')).toBeInTheDocument();
    });
  });

  it('displays alerts based on data', async () => {
    mockedUsePlannerData.mockReturnValue({
      data: {
        summary: { daysUntil: 50 },
        budget: { total: 10000, spent: 11000, percentUsed: 110 },
        guests: { stats: { total: 50, confirmed: 40, pending: 10 } },
        vendors: { list: [], stats: { booked: 0 } },
        decisions: {},
        kernel: {},
      },
      loading: false,
      refetch: jest.fn(),
      lastRefresh: Date.now(),
    });
    render(<DashboardTool />);

    await waitFor(() => {
      expect(screen.getByText("You're over budget by $1000")).toBeInTheDocument();
      expect(screen.getByText("10 guests haven't RSVP'd yet")).toBeInTheDocument();
    });
  });

  it('handles refresh button click', async () => {
    const mockRefetch = jest.fn(async () => {
      // Simulate an asynchronous operation
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
    render(<DashboardTool />);

    const refreshButton = screen.getByRole('button', { name: /Refresh/i });
    
    await act(async () => {
        fireEvent.click(refreshButton);
    });

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });
});