
export type ElementType = 'basic' | 'compound' | 'rare' | 'dangerous';

export interface ChemicalItem {
  id: string;
  symbol: string;
  name: string;
  description: string;
  type: ElementType;
  color: string;
  discoveredAt?: number;
}

export interface SynthesisResult {
  success: boolean;
  product?: ChemicalItem;
  message: string;
  reactionEquation?: string;
  reactionType?: string; // e.g., "化合反应", "置换反应"
  visualPhenomenon?: string; // e.g., "产生大量白烟"
  educationalFact?: string; // Exam point or trivia
}

export interface DragItem {
  id: string;
  type: string;
}
