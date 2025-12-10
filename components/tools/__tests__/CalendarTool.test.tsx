import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import CalendarTool from '../CalendarTool';
import '@testing-library/jest-dom';

// Mock ResizeObserver which is used by FullCalendar
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock browser context
jest.mock('@/components/layout/browser-context', () => ({
  useBrowser: () => ({
    goHome: jest.fn(),
  }),
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Variable to store props passed to mocked FullCalendar
let mockFullCalendarProps: any = {};

// Mock FullCalendar
jest.mock('@fullcalendar/react', () => {
  const React = require('react');
  const MockFullCalendar = React.forwardRef((props: any, ref: any) => {
    // Capture props
    mockFullCalendarProps = props; 
    return (
      <div data-testid="full-calendar-mock" ref={ref}>
        {/* Render a simplified version if needed for visual debugging, but primarily capture props */}
        {props.events && props.events.map((e: any) => (
          <div key={e.id}>
            <span className="truncate" data-testid="calendar-event-title">{e.title}</span>
          </div>
        ))}
      </div>
    );
  });
  MockFullCalendar.displayName = "MockFullCalendar";
  return MockFullCalendar;
});

jest.mock('@fullcalendar/daygrid', () => ({}));
jest.mock('@fullcalendar/timegrid', () => ({}));
jest.mock('@fullcalendar/interaction', () => ({}));
jest.mock('@fullcalendar/list', () => ({}));

// Mock fetch
global.fetch = jest.fn();

describe('CalendarTool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFullCalendarProps = {}; // Clear captured props for each test
  });

  it('renders loading state initially', async () => {
    let resolveFetch: any;
    const fetchPromise = new Promise(resolve => { resolveFetch = resolve; });
    (global.fetch as jest.Mock).mockImplementation(() => fetchPromise);

    render(<CalendarTool initialEvents={[]} />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    
    resolveFetch({ ok: true, json: async () => ({ events: [] }) });
    await act(async () => {}); 
  });

  it('renders the calendar and events after data load', async () => {
    const mockEvents = {
      events: [
        {
          id: '1',
          title: 'Test Wedding Event',
          startTime: new Date().toISOString(),
          category: 'milestone',
          description: 'Testing',
        },
      ],
    };

    const mockStatus = {
      connected: false
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockEvents,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStatus,
      });

    await act(async () => {
      render(<CalendarTool initialEvents={[]} />);
    });

    await waitFor(() => {
      expect(screen.getByText('Calendar')).toBeInTheDocument();
    });

    // Assert that the mock FullCalendar received the correct events
    await waitFor(() => {
      expect(mockFullCalendarProps.events).toHaveLength(1);
      expect(mockFullCalendarProps.events[0].title).toBe('Test Wedding Event');
    });
  });

  it('renders empty state when no events', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ events: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ connected: false }),
      });

    await act(async () => {
      render(<CalendarTool initialEvents={[]} />);
    });

    await waitFor(() => {
      expect(screen.getByText('Calendar')).toBeInTheDocument();
    });
    
    expect(screen.getByTestId('full-calendar-mock')).toBeInTheDocument();
    // Also assert that no events were passed to the mock
    expect(mockFullCalendarProps.events).toHaveLength(0);
  });
});