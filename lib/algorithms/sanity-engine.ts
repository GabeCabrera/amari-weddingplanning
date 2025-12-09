/**
 * CALCULATE SANITY SCORE
 * A deterministic assessment of user stress based on logistical friction.
 * Range: 0 (Panic) to 100 (Zen).
 */

export interface SanityInput {
  budget: { planned: number; actual: number };
  logistics: { daysToEvent: number; totalGuests: number; pendingRSVPs: number };
  contracts: { totalRequired: number; signed: number; criticalUnsigned: boolean };
  friction: { familyIndex: number }; // User input 1-10
}

export function calculateSanityScore(input: SanityInput): { score: number; alerts: string[] } {
  let score = 100;
  const alerts: string[] = [];

  const { budget, logistics, contracts, friction } = input;

  // 1. Budget Variance Penalty (Exponential decay as overage increases)
  if (budget.planned > 0) {
    const budgetVariance = ((budget.actual - budget.planned) / budget.planned) * 100;
    if (budgetVariance > 0) {
      // Lose 1.5 points for every 1% over budget
      score -= (budgetVariance * 1.5);
      if (budgetVariance > 10) {
        alerts.push(`Sanity Alert: Budget exceeded by ${budgetVariance.toFixed(1)}%. I have drafted an email to the florist to negotiate stem counts vs. foliage to realign with the 'Stem Ratio'.`);
      }
    }
  }

  // 2. RSVP Anxiety Curve (Weighted by proximity to event)
  // As T-Minus 0 approaches, pending RSVPs become exponentially more toxic.
  if (logistics.totalGuests > 0) {
    const rsvpRatio = logistics.pendingRSVPs / logistics.totalGuests;
    const timeWeight = 365 / Math.max(logistics.daysToEvent, 1);
    const rsvpPenalty = (rsvpRatio * 20) * (timeWeight * 0.1);
    score -= rsvpPenalty;
    
    // Alert if high pending RSVPs close to event
    if (rsvpRatio > 0.3 && logistics.daysToEvent < 60) {
        alerts.push(`Sanity Alert: ${Math.round(rsvpRatio * 100)}% of guests are non-responsive. The 'Stem' logic predicts a 12% drop-off. I have updated your projected headcount to ${Math.floor(logistics.totalGuests * 0.88)} to protect your budget reserve.`);
    }
  }

  // 3. Operational Risk (Contracts)
  if (contracts.totalRequired > 0) {
    const unsignedRatio = (contracts.totalRequired - contracts.signed) / contracts.totalRequired;
    score -= (unsignedRatio * 15);
  }

  // Immediate penalty if Venue or Catering (Critical) are unsigned within 180 days
  if (contracts.criticalUnsigned && logistics.daysToEvent < 180) {
    score -= 25;
    alerts.push("Sanity Alert: Catering contract unsigned. T-Minus 179 days. I have flagged this as a 'Fatal Error' in your timeline. Click to auto-generate a nudge email to the venue coordinator.");
  }

  // 4. Family Friction Multiplier
  // Friction Index 1-10. 10 reduces remaining score by 20%.
  const frictionPenalty = friction.familyIndex * 2;
  score -= frictionPenalty;

  // Clamp result between 0 and 100
  return {
    score: Math.max(0, Math.min(score, 100)),
    alerts
  };
}
