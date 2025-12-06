// jest.setup.js
import '@testing-library/jest-dom';

// Suppress specific MUI Grid warnings
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  const message = args[0];
  if (typeof message === 'string' && message.includes('MUI Grid: The `xs` prop has been removed.')) {
    return;
  }
  if (typeof message === 'string' && message.includes('MUI Grid: The `sm` prop has been removed.')) {
    return;
  }
  if (typeof message === 'string' && message.includes('MUI Grid: The `md` prop has been removed.')) {
    return;
  }
  if (typeof message === 'string' && message.includes('MUI Grid: The `item` prop has been removed.')) {
    return;
  }
  originalConsoleWarn(...args);
};