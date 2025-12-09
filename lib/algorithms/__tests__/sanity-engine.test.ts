import { calculateSanityScore, SanityInput } from '../sanity-engine';

describe('calculateSanityScore', () => {
  it('should return 100 for a perfect scenario', () => {
    const input: SanityInput = {
      budget: { planned: 10000, actual: 9000 },
      logistics: { daysToEvent: 300, totalGuests: 100, pendingRSVPs: 0 },
      contracts: { totalRequired: 5, signed: 5, criticalUnsigned: false },
      friction: { familyIndex: 0 },
    };

    const { score, alerts } = calculateSanityScore(input);
    expect(score).toBe(100);
    expect(alerts).toHaveLength(0);
  });

  it('should penalize for budget overage', () => {
    const input: SanityInput = {
      budget: { planned: 10000, actual: 11000 }, // 10% over
      logistics: { daysToEvent: 300, totalGuests: 100, pendingRSVPs: 0 },
      contracts: { totalRequired: 5, signed: 5, criticalUnsigned: false },
      friction: { familyIndex: 0 },
    };

    const { score } = calculateSanityScore(input);
    // 10% variance * 1.5 = 15 penalty
    expect(score).toBeCloseTo(85, 0);
  });

  it('should trigger alert for high budget overage', () => {
    const input: SanityInput = {
      budget: { planned: 10000, actual: 12000 }, // 20% over
      logistics: { daysToEvent: 300, totalGuests: 100, pendingRSVPs: 0 },
      contracts: { totalRequired: 5, signed: 5, criticalUnsigned: false },
      friction: { familyIndex: 0 },
    };

    const { alerts } = calculateSanityScore(input);
    expect(alerts[0]).toContain("Sanity Alert: Budget exceeded");
  });

  it('should penalize for unsigned contracts', () => {
    const input: SanityInput = {
      budget: { planned: 10000, actual: 10000 },
      logistics: { daysToEvent: 300, totalGuests: 100, pendingRSVPs: 0 },
      contracts: { totalRequired: 10, signed: 5, criticalUnsigned: false }, // 50% unsigned
      friction: { familyIndex: 0 },
    };

    // 50% unsigned * 15 = 7.5 penalty
    const { score } = calculateSanityScore(input);
    expect(score).toBeCloseTo(92.5, 0);
  });

  it('should heavily penalize critical unsigned contracts close to event', () => {
    const input: SanityInput = {
      budget: { planned: 10000, actual: 10000 },
      logistics: { daysToEvent: 100, totalGuests: 100, pendingRSVPs: 0 },
      contracts: { totalRequired: 5, signed: 5, criticalUnsigned: true },
      friction: { familyIndex: 0 },
    };

    const { score, alerts } = calculateSanityScore(input);
    // Base score 100 - 25 penalty = 75
    expect(score).toBeLessThan(80);
    expect(alerts[0]).toContain("Catering contract unsigned");
  });

  it('should penalize for family friction', () => {
    const input: SanityInput = {
      budget: { planned: 10000, actual: 10000 },
      logistics: { daysToEvent: 300, totalGuests: 100, pendingRSVPs: 0 },
      contracts: { totalRequired: 5, signed: 5, criticalUnsigned: false },
      friction: { familyIndex: 5 }, // 5 * 2 = 10 penalty
    };

    const { score } = calculateSanityScore(input);
    expect(score).toBe(90);
  });
  
  it('should penalize for pending RSVPs close to event', () => {
      const input: SanityInput = {
        budget: { planned: 10000, actual: 10000 },
        logistics: { daysToEvent: 30, totalGuests: 100, pendingRSVPs: 50 }, // 50% pending, 30 days out
        contracts: { totalRequired: 5, signed: 5, criticalUnsigned: false },
        friction: { familyIndex: 0 },
      };
      
      const { score, alerts } = calculateSanityScore(input);
      // rsvpRatio = 0.5
      // timeWeight = 365 / 30 = 12.16
      // penalty = (0.5 * 20) * (12.16 * 0.1) = 10 * 1.216 = 12.16
      // score approx 87.84
      expect(score).toBeLessThan(90);
      expect(alerts[0]).toContain("guests are non-responsive");
  });
});
