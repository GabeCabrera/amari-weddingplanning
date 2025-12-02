/**
 * FCD Core Architecture
 * π-ID: 3.14159
 * 
 * Three-layer system:
 * 1. Pi-Meaning Layer (3.14159.1) - Stable concept identifiers
 * 2. FCD Reasoning Layer (3.14159.2) - A → {C,X} → A′ transformations
 * 3. Self-Extension Layer (3.14159.3) - Proposal system for new capabilities
 */

// ============================================================
// LAYER 1: PI-MEANING LAYER
// π-ID: 3.14159.1
// ============================================================

export interface PiConcept {
  id: string;           // Pi-based identifier (e.g., "3.14159.1")
  name: string;         // Human-readable name
  description: string;  // What this concept represents
  created: Date;
  parent?: string;      // Parent pi-ID for hierarchy
  children: string[];   // Child pi-IDs
  metadata?: Record<string, unknown>;
}

// The Pi Registry - maps pi sequences to meanings
const piRegistry = new Map<string, PiConcept>();

// Root concepts
const ROOT_CONCEPTS: PiConcept[] = [
  {
    id: "3.14159",
    name: "root",
    description: "The root of all concepts in this system",
    created: new Date(),
    children: ["3.14159.1", "3.14159.2", "3.14159.3"],
  },
  {
    id: "3.14159.1",
    name: "meaning-layer",
    description: "Pi-based concept identification and registry",
    created: new Date(),
    parent: "3.14159",
    children: [],
  },
  {
    id: "3.14159.2",
    name: "reasoning-layer", 
    description: "FCD transformation logic: A → {C,X} → A′",
    created: new Date(),
    parent: "3.14159",
    children: [],
  },
  {
    id: "3.14159.3",
    name: "extension-layer",
    description: "Self-extension proposal system",
    created: new Date(),
    parent: "3.14159",
    children: [],
  },
];

// Initialize registry
ROOT_CONCEPTS.forEach(concept => piRegistry.set(concept.id, concept));

export function registerConcept(concept: PiConcept): void {
  piRegistry.set(concept.id, concept);
  
  // Update parent's children list
  if (concept.parent) {
    const parent = piRegistry.get(concept.parent);
    if (parent && !parent.children.includes(concept.id)) {
      parent.children.push(concept.id);
    }
  }
}

export function getConcept(piId: string): PiConcept | undefined {
  return piRegistry.get(piId);
}

export function getAllConcepts(): PiConcept[] {
  return Array.from(piRegistry.values());
}

// Generate next available pi-ID under a parent
export function generatePiId(parentId: string): string {
  const parent = piRegistry.get(parentId);
  if (!parent) throw new Error(`Parent ${parentId} not found`);
  
  const nextIndex = parent.children.length + 1;
  return `${parentId}.${nextIndex}`;
}


// ============================================================
// LAYER 2: FCD REASONING LAYER
// π-ID: 3.14159.2
// ============================================================

export interface FCDTransformation {
  id: string;           // Pi-ID for this transformation
  A: string;            // Current state
  C: string[];          // Catalyzing forces
  X: string[];          // Constraints
  A_prime: string;      // Next state
  status: "proposed" | "approved" | "executed" | "rejected";
  created: Date;
  executed?: Date;
}

const transformationRegistry = new Map<string, FCDTransformation>();

export function createTransformation(
  parentId: string,
  A: string,
  C: string[],
  X: string[],
  A_prime: string
): FCDTransformation {
  const id = generatePiId(parentId);
  
  const transformation: FCDTransformation = {
    id,
    A,
    C,
    X,
    A_prime,
    status: "proposed",
    created: new Date(),
  };
  
  transformationRegistry.set(id, transformation);
  
  // Also register as a concept
  registerConcept({
    id,
    name: `transformation-${id}`,
    description: `FCD: ${A} → ${A_prime}`,
    created: new Date(),
    parent: parentId,
    children: [],
    metadata: { type: "transformation", transformation },
  });
  
  return transformation;
}

export function getTransformation(id: string): FCDTransformation | undefined {
  return transformationRegistry.get(id);
}

export function approveTransformation(id: string): FCDTransformation {
  const t = transformationRegistry.get(id);
  if (!t) throw new Error(`Transformation ${id} not found`);
  t.status = "approved";
  return t;
}

export function executeTransformation(id: string): FCDTransformation {
  const t = transformationRegistry.get(id);
  if (!t) throw new Error(`Transformation ${id} not found`);
  if (t.status !== "approved") throw new Error(`Transformation ${id} not approved`);
  t.status = "executed";
  t.executed = new Date();
  return t;
}


// ============================================================
// LAYER 3: SELF-EXTENSION LAYER
// π-ID: 3.14159.3
// ============================================================

export type ExtensionType = "module" | "function" | "tool" | "concept";

export interface ExtensionProposal {
  id: string;                    // Pi-ID
  type: ExtensionType;
  name: string;
  description: string;
  rationale: string;             // Why this extension is needed
  fcd: {                         // The FCD reasoning behind it
    A: string;
    C: string[];
    X: string[];
    A_prime: string;
  };
  code?: string;                 // Proposed code (if applicable)
  status: "pending" | "approved" | "rejected" | "implemented";
  created: Date;
  reviewed?: Date;
  reviewNotes?: string;
}

const proposalRegistry = new Map<string, ExtensionProposal>();

export function proposeExtension(
  type: ExtensionType,
  name: string,
  description: string,
  rationale: string,
  fcd: ExtensionProposal["fcd"],
  code?: string
): ExtensionProposal {
  const id = generatePiId("3.14159.3");
  
  const proposal: ExtensionProposal = {
    id,
    type,
    name,
    description,
    rationale,
    fcd,
    code,
    status: "pending",
    created: new Date(),
  };
  
  proposalRegistry.set(id, proposal);
  
  // Register as concept
  registerConcept({
    id,
    name: `proposal-${name}`,
    description,
    created: new Date(),
    parent: "3.14159.3",
    children: [],
    metadata: { type: "proposal", proposal },
  });
  
  return proposal;
}

export function getPendingProposals(): ExtensionProposal[] {
  return Array.from(proposalRegistry.values()).filter(p => p.status === "pending");
}

export function reviewProposal(
  id: string, 
  approved: boolean, 
  notes?: string
): ExtensionProposal {
  const p = proposalRegistry.get(id);
  if (!p) throw new Error(`Proposal ${id} not found`);
  
  p.status = approved ? "approved" : "rejected";
  p.reviewed = new Date();
  p.reviewNotes = notes;
  
  return p;
}

export function getProposal(id: string): ExtensionProposal | undefined {
  return proposalRegistry.get(id);
}


// ============================================================
// UTILITY: SYSTEM STATE
// ============================================================

export function getSystemState() {
  return {
    concepts: getAllConcepts(),
    transformations: Array.from(transformationRegistry.values()),
    proposals: Array.from(proposalRegistry.values()),
    stats: {
      totalConcepts: piRegistry.size,
      totalTransformations: transformationRegistry.size,
      pendingProposals: getPendingProposals().length,
    },
  };
}
