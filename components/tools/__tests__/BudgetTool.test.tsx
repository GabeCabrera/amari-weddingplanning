import React from 'react';
import { render, screen, within, act } from '@testing-library/react';
import BudgetTool from '../BudgetTool';
import * as PlannerData from '@/lib/hooks/usePlannerData';
import { BrowserProvider } from '../../../components/layout/browser-context';

// Mock the usePlannerData hook
jest.mock('@/lib/hooks/usePlannerData');
const mockedUsePlannerData = PlannerData.usePlannerData as jest.Mock;

describe('BudgetTool', () => {
  it('renders the empty state when there is no data', async () => {
    mockedUsePlannerData.mockReturnValue({
      data: { budget: { items: [] } },
      loading: false,
      refetch: jest.fn(),
      lastRefresh: Date.now(),
    });

    await act(async () => {
        render(<BrowserProvider><BudgetTool /></BrowserProvider>);
    });

    expect(screen.getByText('No budget items yet')).toBeInTheDocument();
    expect(screen.getByText("Tell me about your wedding expenses in chat and I'll track them here.")).toBeInTheDocument();
    expect(screen.getByTestId('empty-budget-icon')).toBeInTheDocument();
  });

  it('renders the budget data when available', async () => {
    const mockData = {
      budget: {
        total: 20000,
        spent: 15000,
        paid: 7000,
        remaining: 8000,
        percentUsed: 75,
        items: [
          { id: '1', category: 'Venue', vendor: 'The Grand Hall', totalCost: 10000, amountPaid: 5000, notes: 'Includes catering' },
          { id: '2', category: 'Photography', vendor: 'Perfect Pics', totalCost: 5000, amountPaid: 2000, notes: '' },
        ],
      },
    };

    mockedUsePlannerData.mockReturnValue({
      data: mockData,
      loading: false,
      refetch: jest.fn(),
      lastRefresh: Date.now(),
    });

    jest.spyOn(PlannerData, 'formatCurrency').mockImplementation((amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
    });

    await act(async () => {
        render(<BrowserProvider><BudgetTool /></BrowserProvider>);
    });

    // Check for presence of key data points
    expect(screen.getByText('$20,000')).toBeInTheDocument(); // Total
    expect(screen.getByText('$15,000')).toBeInTheDocument(); // Spent
    expect(screen.getByText('$7,000')).toBeInTheDocument(); // Paid
    expect(screen.getByText('$8,000')).toBeInTheDocument(); // Remaining
    
    // Check specific labels
    expect(screen.getByText('Total Budget')).toBeInTheDocument();
    expect(screen.getByText('Allocated')).toBeInTheDocument();
    expect(screen.getByText('Paid So Far')).toBeInTheDocument();
    expect(screen.getByText('Still Owed')).toBeInTheDocument();

    // Check for items
    expect(screen.getByText('The Grand Hall')).toBeInTheDocument();
    expect(screen.getByText('Perfect Pics')).toBeInTheDocument();
    
    // Check for category breakdown
    expect(screen.getByText('Venue')).toBeInTheDocument();
    expect(screen.getByText('Photography')).toBeInTheDocument();
    
    // Check percentage logic
    expect(screen.getByText('75% of budget')).toBeInTheDocument();
  });
});