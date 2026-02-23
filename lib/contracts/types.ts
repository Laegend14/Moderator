/**
 * TypeScript types for GenLayer ModerationRegistry contract
 */

export interface ModerationCase {
  id: string;
  incident: string;          // Description of the incident (renamed from incident_report)
  rules: string;             // Community rules being violated (renamed from community_rules)
  verdict: string;           // "Dismissed", "Warning", "Temporary Ban", "Permanent Ban"
  reasoning: string;         // The AI's explanation for the verdict
  status: string;            // "Under Review" or "Resolved"
  resolved: boolean;         // Whether the case has been arbitrated
  reporter: string;          // Address of the user who filed the report (renamed from owner)
  filed_at: number;          // Block number when the case was filed
}

export interface ReputationEntry {
  address: string;
  reputation: number;        // Reputation score (renamed from points for consistency)
}

export interface TransactionReceipt {
  status: "ACCEPTED" | "REJECTED" | "PENDING";
  hash: string;
  blockNumber?: number;
  [key: string]: any;
}

export interface CaseFilters {
  resolved?: boolean;
  reporter?: string;         // Renamed from owner to match new contract
}