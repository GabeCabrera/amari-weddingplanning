import { executeToolCall, ToolContext } from '../executor';
import { db } from '@/lib/db';
import { updateDecision, initializeDecisionsForTenant } from '../decisions';

// Mock DB
jest.mock('@/lib/db', () => ({
  db: {
    query: {
      weddingKernels: { findFirst: jest.fn() },
      planners: { findFirst: jest.fn() },
      pages: { findFirst: jest.fn() }
    },
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockResolvedValue([{ id: 'mock-id' }]),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis()
  }
}));

// Mock decisions module
jest.mock('../decisions', () => ({
  updateDecision: jest.fn().mockResolvedValue({ success: true, message: "Updated" }),
  initializeDecisionsForTenant: jest.fn(),
  getAllDecisions: jest.fn().mockResolvedValue([]),
  getDecisionProgress: jest.fn().mockResolvedValue({})
}));

describe('Checklist Tool Logic', () => {
  const mockContext: ToolContext = {
    tenantId: 'test-tenant-id',
    userId: 'test-user-id'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update checklist item status to decided when isChecked is true', async () => {
    await executeToolCall('update_checklist_item', { 
      decisionName: 'venue', 
      isChecked: true 
    }, mockContext);

    expect(initializeDecisionsForTenant).toHaveBeenCalledWith('test-tenant-id');
    expect(updateDecision).toHaveBeenCalledWith(
      'test-tenant-id',
      'venue',
      expect.objectContaining({ status: 'decided' })
    );
  });

  it('should update checklist item status to not_started when isChecked is false', async () => {
    await executeToolCall('update_checklist_item', { 
      decisionName: 'photographer', 
      isChecked: false 
    }, mockContext);

    expect(updateDecision).toHaveBeenCalledWith(
      'test-tenant-id',
      'photographer',
      expect.objectContaining({ status: 'not_started' })
    );
  });
});
