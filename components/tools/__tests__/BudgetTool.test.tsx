
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

    // Check for summary cards
    const totalBudgetCard = screen.getByText('Total Budget').closest('.bg-white.rounded-3xl');
    expect(within(totalBudgetCard as HTMLElement).getByText(PlannerData.formatCurrency(mockData.budget.total))).toBeInTheDocument();

    const allocatedCard = screen.getByText('Allocated').closest('.bg-white.rounded-3xl');
    expect(within(allocatedCard as HTMLElement).getByText(PlannerData.formatCurrency(mockData.budget.spent))).toBeInTheDocument();
    expect(within(allocatedCard as HTMLElement).getByText('75% of budget')).toBeInTheDocument();
    
    const paidCard = screen.getByText('Paid So Far').closest('.bg-white.rounded-3xl');
    expect(within(paidCard as HTMLElement).getByText(PlannerData.formatCurrency(mockData.budget.paid))).toBeInTheDocument();
    
    const owedCard = screen.getByText('Still Owed').closest('.bg-white.rounded-3xl');
    expect(within(owedCard as HTMLElement).getByText(PlannerData.formatCurrency(mockData.budget.remaining))).toBeInTheDocument();

    // Check for an item in the list
    expect(screen.getByText('The Grand Hall')).toBeInTheDocument();
    expect(screen.getByText('Includes catering')).toBeInTheDocument();

    // Check progress bar text
    const progressBarCard = screen.getByText('Budget used').closest('.bg-white.rounded-3xl');
    expect(within(progressBarCard as HTMLElement).getByText('75%')).toBeInTheDocument();

    // Check category breakdown
    expect(screen.getByText('By Category')).toBeInTheDocument();
    expect(screen.getByText('Venue')).toBeInTheDocument();
    expect(screen.getByText('Photography')).toBeInTheDocument();

    // Check all items list
    expect(screen.getByText('All Items')).toBeInTheDocument();
    expect(screen.getByText('The Grand Hall')).toBeInTheDocument();
    expect(screen.getByText('Perfect Pics')).toBeInTheDocument();
    expect(screen.getByText(`${PlannerData.formatCurrency(5000)} paid`)).toBeInTheDocument(); // For Venue
    expect(screen.getByText(`${PlannerData.formatCurrency(2000)} paid`)).toBeInTheDocument(); // For Photography
  });
});
