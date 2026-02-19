/**
 * TypeScript types for GenLayer Fair and Transparent Moderation contract
 */

export interface ModerationCase {
  id: string;
  incident_report: string;  // Description or evidence link
  community_rules: string;   // Ruleset provided for the AI judge
  case_resolved: boolean;    // Status of the arbitration
  verdict: string;           // "Dismissed", "Warning", "Temporary Ban", etc.
  reasoning: string;         // The AI's explanation for the verdict
  owner: string;             // Address of the user/system that filed the report
}

export interface ReputationEntry {
  address: string;
  points: number;            // Reputation/Trust score (rebranded as 'Rep')
}

export interface TransactionReceipt {
  status: "ACCEPTED" | "REJECTED" | "PENDING";
  hash: string;
  blockNumber?: number;
  [key: string]: any;
}

export interface CaseFilters {
  resolved?: boolean;
  owner?: string;
}