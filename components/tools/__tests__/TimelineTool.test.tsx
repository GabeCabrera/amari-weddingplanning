
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import TimelineTool from '../TimelineTool';
import * as PlannerData from '@/lib/hooks/usePlannerData';
import { formatTime } from '../TimelineEventCard'; // Import formatTime directly
import { BrowserProvider } from '../../../components/layout/browser-context';

// We don't need to import TimelineEventCard directly in the test file if we're mocking its default export.

// Mock the usePlannerData hook
jest.mock('@/lib/hooks/usePlannerData');
const mockedUsePlannerData = PlannerData.usePlannerData as jest.Mock;

// Mock the TimelineEventCard module directly to control formatTime and default export
jest.mock('../TimelineEventCard', () => ({
  __esModule: true,
  ...jest.requireActual('../TimelineEventCard'), // Keep actual exports like types
  formatTime: jest.fn((time: string | undefined): string => {
    if (!time) return "";
    const [hours, minutes] = time.split(":").map(Number);
    if (!isNaN(hours) && !isNaN(minutes)) {
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    }
    return time;
  }),
  default: jest.fn((props) => <div data-testid="TimelineEventCard-mock">{jest.requireActual('../TimelineEventCard').default(props)}</div>),
}));


// Define MOCK_DATE_STRING globally for test scope
const MOCK_DATE_STRING = 'Friday, December 5, 2025';

// Store original Date methods
const originalToLocaleDateString = Date.prototype.toLocaleDateString;
const originalToLocaleTimeString = Date.prototype.toLocaleTimeString;


describe('TimelineTool', () => {
    // Mock Date.prototype.toLocaleDateString and toLocaleTimeString for consistent testing
    beforeAll(() => {
        // Mock toLocaleDateString
        Object.defineProperty(Date.prototype, 'toLocaleDateString', {
            configurable: true,
            value: jest.fn(() => MOCK_DATE_STRING),
        });

        // Mock toLocaleTimeString, ensuring 'this' context is preserved if needed by the component
        Object.defineProperty(Date.prototype, 'toLocaleTimeString', {
            configurable: true,
            value: jest.fn(function(this: Date, _: undefined, options: Intl.DateTimeFormatOptions | undefined) {
                if (options?.hour === 'numeric' && options?.minute === '2-digit') {
                    // Re-implement the formatting logic here for mock consistency
                    const hour = this.getHours();
                    const minute = this.getMinutes();
                    const ampm = hour >= 12 ? 'PM' : 'AM';
                    const displayHour = hour % 12 || 12;
                    return `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
                }
                return originalToLocaleTimeString.call(this, _, options); // Fallback to original
            }),
        });
    });

    afterAll(() => {
        // Restore original Date methods
        Object.defineProperty(Date.prototype, 'toLocaleDateString', {
            configurable: true,
            value: originalToLocaleDateString,
        });
        Object.defineProperty(Date.prototype, 'toLocaleTimeString', {
            configurable: true,
            value: originalToLocaleTimeString,
        });
    });


  beforeEach(() => {
    mockedUsePlannerData.mockReset();
    (formatTime as jest.Mock).mockClear(); // Clear mock usage for formatTime
  });

  it('renders loading state initially', async () => {
    mockedUsePlannerData.mockReturnValue({
      data: null,
      loading: true,
      refetch: jest.fn(),
      lastRefresh: 0,
    });
    await act(async () => {
        render(<BrowserProvider><TimelineTool /></BrowserProvider>);
    });
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders empty state when no timeline data is available', async () => {
    mockedUsePlannerData.mockReturnValue({
      data: {
        timeline: { events: [] },
        summary: {},
      },
      loading: false,
      refetch: jest.fn(),
      lastRefresh: Date.now(),
    });
    await act(async () => {
        render(<BrowserProvider><TimelineTool /></BrowserProvider>);
    });

    await waitFor(() => {
      expect(screen.getByText('No timeline events yet')).toBeInTheDocument();
      expect(screen.getByText("Tell me about your wedding day schedule in chat and I'll build your timeline.")).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Go to chat/i })).toBeInTheDocument();
    });
  });

  it('renders timeline events when data is available', async () => {
    mockedUsePlannerData.mockReturnValue({
      data: {
        timeline: {
          events: [
            { id: '1', title: 'Hair & Makeup', time: '10:00', duration: 180, category: 'Prep' },
            { id: '2', title: 'Ceremony Start', time: '16:00', category: 'Ceremony', location: 'Garden' },
            { id: '3', title: 'Cocktail Hour', time: '17:00', category: 'Cocktail Hour', vendor: 'Bar Service' },
          ],
        },
        summary: {
          weddingDate: '2025-12-05T00:00:00.000Z', // Use a consistent date for testing
        },
      },
      loading: false,
      refetch: jest.fn(),
      lastRefresh: Date.now(),
    });
    await act(async () => {
        render(<BrowserProvider><TimelineTool /></BrowserProvider>);
    });

    await waitFor(() => {
      expect(screen.getByText('Wedding Day Timeline')).toBeInTheDocument();
      expect(screen.getByText(`Your schedule for ${MOCK_DATE_STRING}`)).toBeInTheDocument();
      
      // Category headers (h2)
      expect(screen.getByRole('heading', { name: 'Prep', level: 2 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Ceremony', level: 2 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Cocktail Hour', level: 2 })).toBeInTheDocument();

      // Event titles (h3 from TimelineEventCard)
      expect(screen.getByRole('heading', { name: 'Hair & Makeup', level: 3 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Ceremony Start', level: 3 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Cocktail Hour', level: 3 })).toBeInTheDocument();


      // Use more flexible matching for time as it's formatted by toLocaleTimeString now
      expect(screen.getByText('10:00 AM')).toBeInTheDocument(); 
      expect(screen.getByText('4:00 PM')).toBeInTheDocument();
      expect(screen.getByText('Garden')).toBeInTheDocument();
      expect(screen.getByText('Bar Service')).toBeInTheDocument();
    });
  });

  it('formats time correctly', async () => {
    mockedUsePlannerData.mockReturnValue({
      data: {
        timeline: {
          events: [
            { id: '1', title: 'Event A', time: '08:30', category: 'Prep' },
            { id: '2', title: 'Event B', time: '12:00', category: 'Ceremony' },
            { id: '3', title: 'Event C', time: '20:15', category: 'Reception' },
          ],
        },
        summary: {},
      },
      loading: false,
      refetch: jest.fn(),
      lastRefresh: Date.now(),
    });
    await act(async () => {
        render(<BrowserProvider><TimelineTool /></BrowserProvider>);
    });

    await waitFor(() => {
      expect(screen.getByText('8:30 AM')).toBeInTheDocument();
      expect(screen.getByText('12:00 PM')).toBeInTheDocument();
      expect(screen.getByText('8:15 PM')).toBeInTheDocument();
    });
  });
});
