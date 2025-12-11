import { executeToolCall } from '../executor';
import { db } from '@/lib/db';
import { pages, planners, tenants, weddingKernels } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Mock DB
jest.mock('@/lib/db', () => ({
  db: {
    insert: jest.fn(() => ({ values: jest.fn(() => ({ returning: jest.fn() })) })),
    select: jest.fn(() => ({ from: jest.fn(() => ({ where: jest.fn() })) })),
    update: jest.fn(() => ({ set: jest.fn(() => ({ where: jest.fn() })) })),
    delete: jest.fn(() => ({ where: jest.fn() })),
    query: {
      planners: { findFirst: jest.fn() },
      pages: { findFirst: jest.fn() },
      tenants: { findFirst: jest.fn() },
      rsvpForms: { findFirst: jest.fn() },
      rsvpResponses: { findMany: jest.fn() },
      boards: { findFirst: jest.fn(), findMany: jest.fn() },
      knowledgeBase: { findMany: jest.fn() },
      weddingKernels: { findFirst: jest.fn() },
    },
  },
}));

// Mock other dependencies
jest.mock('@/lib/db/queries', () => ({
  getCalendarEventsByTenantId: jest.fn(),
  updateCalendarEvent: jest.fn(),
  deleteCalendarEvent: jest.fn(),
}));

jest.mock('../decisions', () => ({
  updateDecision: jest.fn().mockResolvedValue({ success: true, message: "Decision updated" }),
  getDecision: jest.fn(),
  getAllDecisions: jest.fn(),
  getDecisionsByCategory: jest.fn(),
  initializeDecisionsForTenant: jest.fn(),
  getDecisionProgress: jest.fn(),
}));

describe('AI Tool Executor (User-Facing)', () => {
  const mockContext = { tenantId: 'tenant-123', userId: 'user-123' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Budget Tools', () => {
    it('should return a friendly message when adding a budget item', async () => {
      // Mock getOrCreatePage to return a mock page
      (db.query.planners.findFirst as jest.Mock).mockResolvedValue({ id: 'planner-1' });
      (db.query.pages.findFirst as jest.Mock).mockResolvedValue({ 
        id: 'page-1', 
        fields: { items: [] } 
      });
      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{ id: 'page-1' }])
        })
      });

      const result = await executeToolCall('add_budget_item', {
        category: 'venue',
        vendor: 'Grand Plaza',
        estimatedCost: 5000,
        notes: 'Deposit due soon'
      }, mockContext);

      expect(result.success).toBe(true);
      // We want the AI to see exactly what was done
      expect(result.message).toContain('Added venue to budget: $5,000');
    });

    it('should return a detailed message when updating a budget item', async () => {
      const mockItem = {
        id: 'item-1',
        category: 'venue',
        vendor: 'Grand Plaza',
        totalCost: '500000', // 5000 in cents
        amountPaid: '0'
      };

      (db.query.planners.findFirst as jest.Mock).mockResolvedValue({ id: 'planner-1' });
      (db.query.pages.findFirst as jest.Mock).mockResolvedValue({ 
        id: 'page-1', 
        fields: { items: [mockItem] } 
      });

      const result = await executeToolCall('update_budget_item', {
        itemId: 'item-1',
        estimatedCost: 6000
      }, mockContext);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Updated venue: changed cost to $6,000');
    });
  });

  describe('Guest Tools', () => {
    it('should handle adding a guest with a clear confirmation', async () => {
      (db.query.planners.findFirst as jest.Mock).mockResolvedValue({ id: 'planner-1' });
      (db.query.pages.findFirst as jest.Mock).mockResolvedValue({ 
        id: 'page-1', 
        fields: { guests: [] } 
      });

      const result = await executeToolCall('add_guest', {
        name: 'John Doe',
        group: 'Family',
        rsvp: 'confirmed'
      }, mockContext);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Added John Doe to guest list');
      expect(result.message).toContain('group: Family');
      expect(result.message).toContain('confirmed');
    });
  });
});
