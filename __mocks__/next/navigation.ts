// __mocks__/next/navigation.ts

import { NextRouter } from 'next/router';

export const mockPush = jest.fn();
export const mockReplace = jest.fn();
export const mockReload = jest.fn();
export const mockBack = jest.fn();
export const mockPrefetch = jest.fn();
export const mockBeforePopState = jest.fn();
export const mockEventsOn = jest.fn();
export const mockEventsOff = jest.fn();
export const mockEventsEmit = jest.fn();

// Mock useRouter
export const useRouter = jest.fn(() => ({
  push: mockPush,
  replace: mockReplace,
  reload: mockReload,
  back: mockBack,
  prefetch: mockPrefetch,
  beforePopState: mockBeforePopState,
  events: {
    on: mockEventsOn,
    off: mockEventsOff,
    emit: mockEventsEmit,
  },
  isFallback: false,
  route: '/',
  pathname: '/',
  query: {},
  asPath: '/',
}));

// Mock usePathname
export const usePathname = jest.fn(() => '/mock-path');

// Mock useSearchParams
export const useSearchParams = jest.fn(() => new URLSearchParams());