/**
 * FCD Example Usage
 * π-ID: 3.14159.265
 * 
 * Demonstrates how the three layers work together.
 */

import {
  registerConcept,
  createTransformation,
  proposeExtension,
  getSystemState,
  approveTransformation,
  reviewProposal,
} from "./core";

// Example 1: Register a new concept
// Let's say we're adding a "budget-advisor" feature to Aisle

registerConcept({
  id: "3.14159.265",
  name: "budget-advisor",
  description: "AI module that helps couples understand wedding budget allocation",
  created: new Date(),
  parent: "3.14159",
  children: [],
  metadata: {
    domain: "wedding-planning",
    category: "financial",
  },
});


// Example 2: Create an FCD transformation
// This represents a change we want to make

const budgetTransformation = createTransformation(
  "3.14159.2", // Parent is the reasoning layer
  "Users ask vague budget questions and get generic responses",  // A
  ["Users want specific guidance", "AI has access to cost data"], // C
  ["Must not give financial advice", "Responses must be helpful"], // X
  "Budget advisor gives ranges and tradeoffs based on guest count and location" // A′
);

console.log("Created transformation:", budgetTransformation);


// Example 3: Propose a new extension
// The system identifies a gap and proposes a solution

const proposal = proposeExtension(
  "module",
  "venue-matcher",
  "Module that matches couples with venue types based on their style and budget",
  "Users frequently ask about venues but we give generic advice. A structured matcher would provide better guidance.",
  {
    A: "Generic venue advice",
    C: ["Users want personalized recommendations", "We can infer style from conversation"],
    X: ["Cannot recommend specific vendors", "Must remain neutral"],
    A_prime: "Style-based venue type matching with budget context",
  },
  `// Proposed code structure
export interface VenueMatch {
  type: string;
  budgetRange: [number, number];
  guestCapacity: [number, number];
  style: string[];
}

export function matchVenue(style: string, budget: number, guests: number): VenueMatch[] {
  // Implementation here
}`
);

console.log("Created proposal:", proposal);


// Example 4: Check system state
console.log("\nSystem State:");
console.log(JSON.stringify(getSystemState(), null, 2));


// Example 5: Approval flow (would be triggered by human)
// approveTransformation(budgetTransformation.id);
// reviewProposal(proposal.id, true, "Good idea, let's build it");
