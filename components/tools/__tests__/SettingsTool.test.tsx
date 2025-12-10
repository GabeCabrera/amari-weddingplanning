import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SettingsTool from '../SettingsTool';
import { useSession } from 'next-auth/react';

// Mock the next-auth/react module
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

describe('SettingsTool', () => {
  beforeEach(() => {
    // Reset mock before each test
    (useSession as jest.Mock).mockReset();
  });

  it('renders correctly for an authenticated user', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          name: 'Test User',
          email: 'test@example.com',
        },
      },
      status: 'authenticated',
    });

    render(<SettingsTool />);

    // Check header
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByText(/Manage your account and preferences/i)).toBeInTheDocument();

    // Check account section
    expect(screen.getByRole('heading', { name: 'Account' })).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('TU')).toBeInTheDocument(); // Avatar initials
    expect(screen.getByRole('button', { name: 'Edit Profile' })).toBeInTheDocument();

    // Check plan section
    expect(screen.getByRole('heading', { name: 'Plan' })).toBeInTheDocument();
    expect(screen.getByText('Free Plan')).toBeInTheDocument();
    expect(screen.getByText('Basic features included')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Upgrade' })).toBeInTheDocument();

    // Check danger zone
    expect(screen.getByRole('heading', { name: 'Danger Zone' })).toBeInTheDocument();
    expect(screen.getByText('Delete Account')).toBeInTheDocument();
    expect(screen.getByText('Permanently delete your account and all data')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument();
  });

  it('renders correctly for an unauthenticated user', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<SettingsTool />);

    // Check account section shows default values
    expect(screen.getByText('Unknown')).toBeInTheDocument();
    expect(screen.getByText('No email')).toBeInTheDocument();
    expect(screen.getByText('?')).toBeInTheDocument(); // Default avatar initials
  });

  it('opens and closes the Edit Profile dialog', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { name: 'Test User' } },
      status: 'authenticated',
    });

    render(<SettingsTool />);

    const editProfileButton = screen.getByRole('button', { name: 'Edit Profile' });
    fireEvent.click(editProfileButton);

    expect(screen.getByRole('dialog', { name: 'Edit Your Profile' })).toBeInTheDocument();
    expect(screen.getByLabelText('Display Name')).toHaveValue('Test User');

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    expect(screen.queryByRole('dialog', { name: 'Edit Your Profile' })).not.toBeInTheDocument();
  });

  it('handles Upgrade button click', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { name: 'Test User' } },
      status: 'authenticated',
    });

    render(<SettingsTool />);

    const upgradeButton = screen.getByRole('link', { name: /Upgrade/i });
    fireEvent.click(upgradeButton);
    // In a real scenario, you might expect a navigation to /choose-plan.
    // For this test, we just ensure it's clickable without error.
  });

  it('handles Delete Account button click', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { name: 'Test User' } },
      status: 'authenticated',
    });

    render(<SettingsTool />);
    
    // The Delete button is on the main page, outside any dialog initially
    const deleteButton = screen.getByRole('button', { name: /Delete/i });
    fireEvent.click(deleteButton);
    // If there were a confirmation dialog, we would assert its presence here.
    // For now, we just ensure it's clickable.
  });

});