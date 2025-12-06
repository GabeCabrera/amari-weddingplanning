
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ChecklistTool from '../ChecklistTool';

// Mock the fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({
      decisions: [
        {
          id: '1',
          name: 'decide_on_venue',
          displayName: 'Decide on a Venue',
          category: 'venue',
          status: 'not_started',
          isRequired: true,
          isSkipped: false,
        },
      ],
      progress: {
        total: 1,
        locked: 0,
        decided: 0,
        researching: 0,
        notStarted: 1,
        percentComplete: 0,
      },
    }),
  })
) as jest.Mock;

describe('ChecklistTool', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('renders the checklist with fetched data', async () => {
    render(<ChecklistTool />);

    // Wait for the component to finish loading data
    await waitFor(() => {
      // Check for the main title
      expect(screen.getByText('Wedding Checklist')).toBeInTheDocument();
    });

    // Check for progress information
    expect(screen.getByText('0 of 1 complete')).toBeInTheDocument();

    // Check that an accordion for the 'Venue' category is rendered
    expect(screen.getByText('Venue')).toBeInTheDocument();

    // Check for the mock decision
    expect(screen.getByText('Decide on a Venue')).toBeInTheDocument();
  });
});
