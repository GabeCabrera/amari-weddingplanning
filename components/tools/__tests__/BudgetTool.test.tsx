
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import BudgetTool from '../BudgetTool';
import * as PlannerData from '@/lib/hooks/usePlannerData';

// Mock the usePlannerData hook
jest.mock('@/lib/hooks/usePlannerData');
const mockedUsePlannerData = PlannerData.usePlannerData as jest.Mock;

describe('BudgetTool', () => {
  it('renders the empty state when there is no data', () => {
    mockedUsePlannerData.mockReturnValue({
      data: { budget: { items: [] } },
      loading: false,
      refetch: jest.fn(),
      lastRefresh: Date.now(),
    });

    render(<BudgetTool />);

    expect(screen.getByText('No budget items yet')).toBeInTheDocument();
    expect(screen.getByText("Tell me about your wedding expenses in chat and I'll track them here.")).toBeInTheDocument();
  });

  it('renders the budget data when available', () => {
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

    // Mock the formatCurrency function directly from the module
    // This ensures both the component and the test use the same formatting logic or a controlled mock
    jest.spyOn(PlannerData, 'formatCurrency').mockImplementation((amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
    });

    render(<BudgetTool />);

    // Check for summary cards
    const totalBudgetCard = screen.getByText('Total Budget').closest('div.MuiCard-root');
    expect(within(totalBudgetCard).getByText(PlannerData.formatCurrency(mockData.budget.total))).toBeInTheDocument();

    const allocatedCard = screen.getByText('Allocated').closest('div.MuiCard-root');
    expect(within(allocatedCard).getByText(PlannerData.formatCurrency(mockData.budget.spent))).toBeInTheDocument();
    
    const paidCard = screen.getByText('Paid So Far').closest('div.MuiCard-root');
    expect(within(paidCard).getByText(PlannerData.formatCurrency(mockData.budget.paid))).toBeInTheDocument();
    
    const owedCard = screen.getByText('Still Owed').closest('div.MuiCard-root');
    expect(within(owedCard).getByText(PlannerData.formatCurrency(mockData.budget.remaining))).toBeInTheDocument();

    // Check for an item in the list
    expect(screen.getByText('The Grand Hall')).toBeInTheDocument();
    expect(screen.getByText('Includes catering')).toBeInTheDocument();
  });
});
