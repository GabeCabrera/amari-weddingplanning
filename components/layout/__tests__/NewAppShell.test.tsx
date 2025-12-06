
import React from 'react';
import { render, screen } from '@testing-library/react';
import NewAppShell from '@/components/layout/NewAppShell';
import { useSession } from 'next-auth/react';

// Mock next-auth
jest.mock('next-auth/react');
const mockedUseSession = useSession as jest.Mock;

// Mock the browser context
jest.mock('@/components/layout/browser-context', () => ({
  ...jest.requireActual('@/components/layout/browser-context'),
  useBrowser: () => ({
    openTool: jest.fn(),
    goHome: jest.fn(),
  }),
}));

describe('NewAppShell', () => {
  it('renders the main components', () => {
    // Mock the session
    mockedUseSession.mockReturnValue({
      data: { user: { name: 'Test User', email: 'test@example.com' } },
      status: 'authenticated',
    });

    render(<NewAppShell><div>Test Children</div></NewAppShell>);

    // Check for the main title
    expect(screen.getByText('Aisle')).toBeInTheDocument();

    // Check for the child content
    expect(screen.getByText('Test Children')).toBeInTheDocument();

    // Check for a navigation item
    expect(screen.getByText('Chat')).toBeInTheDocument();
  });
});
