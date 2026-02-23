import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import type { ModerationCase, ReputationEntry, TransactionReceipt } from "./types";

/**
 * ModerationArbitrator contract class for interacting with the deployed ModerationRegistry contract
 */
class ModerationArbitrator {
  private contractAddress: `0x${string}`;
  private client: ReturnType<typeof createClient>;

  constructor(
    contractAddress: string,
    address?: string | null,
    studioUrl?: string
  ) {
    this.contractAddress = contractAddress as `0x${string}`;

    const config: any = {
      chain: studionet,
    };

    if (address) {
      config.account = address as `0x${string}`;
    }

    if (studioUrl) {
      config.endpoint = studioUrl;
    }

    this.client = createClient(config);
  }

  /**
   * Update the address used for transactions
   */
  updateAccount(address: string): void {
    const config: any = {
      chain: studionet,
      account: address as `0x${string}`,
    };

    this.client = createClient(config);
  }

  /**
   * Get all moderation cases from the contract
   * @returns Array of cases with their details
   */
  async getCases(): Promise<ModerationCase[]> {
    try {
      console.log("Fetching cases from contract:", this.contractAddress);
      
      const casesJson: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_cases",
        args: [],
      });

      console.log("Raw cases response:", casesJson);

      // Parse the JSON string returned from the contract
      const casesObj = JSON.parse(casesJson);
      const caseArray: ModerationCase[] = [];

      // casesObj is { owner_address: { case_id: case_data } }
      for (const [owner, ownerCases] of Object.entries(casesObj)) {
        if (ownerCases && typeof ownerCases === 'object') {
          for (const [caseId, caseData] of Object.entries(ownerCases as any)) {
            const case_obj = caseData as any;
            caseArray.push({
              id: case_obj.id || caseId,
              incident: case_obj.incident || "",
              rules: case_obj.rules || "",
              verdict: case_obj.verdict || "Pending",
              reasoning: case_obj.reasoning || "",
              status: case_obj.status || "Under Review",
              resolved: case_obj.resolved || false,
              reporter: case_obj.reporter || owner,
              filed_at: case_obj.filed_at || 0,
            } as ModerationCase);
          }
        }
      }

      console.log("Parsed cases:", caseArray);
      return caseArray;
    } catch (error: any) {
      console.error("Error fetching cases:", error);
      console.error("Error details:", {
        message: error.message,
        cause: error.cause,
        details: error.details,
      });
      return [];
    }
  }

  /**
   * Get reputation points for a specific arbiter
   * @param address - Arbiter's address
   * @returns Number of reputation points
   */
  async getReputation(address: string | null): Promise<number> {
    if (!address) {
      return 0;
    }

    try {
      console.log("Fetching reputation for:", address);
      
      const reputation = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_arbiter_reputation",
        args: [address],
      });

      console.log("Reputation response:", reputation);
      return Number(reputation) || 0;
    } catch (error: any) {
      console.error("Error fetching arbiter reputation:", error);
      console.error("Error details:", {
        message: error.message,
        contractAddress: this.contractAddress,
        targetAddress: address,
      });
      return 0;
    }
  }

  /**
   * Get the leaderboard with all arbiters and their reputation
   * @returns Sorted array of leaderboard entries (highest to lowest)
   */
  async getLeaderboard(): Promise<ReputationEntry[]> {
    try {
      console.log("Fetching leaderboard from contract:", this.contractAddress);
      
      const reputationJson: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_reputation",
        args: [],
      });

      console.log("Raw leaderboard response:", reputationJson);

      // Parse the JSON string returned from the contract
      const reputationObj = JSON.parse(reputationJson);
      const leaderboard: ReputationEntry[] = [];

      // reputationObj is { address: points }
      for (const [address, points] of Object.entries(reputationObj)) {
        leaderboard.push({
          address,
          reputation: Number(points) || 0,
        });
      }

      // Sort by reputation (highest to lowest)
      leaderboard.sort((a, b) => b.reputation - a.reputation);

      console.log("Parsed leaderboard:", leaderboard);
      return leaderboard;
    } catch (error: any) {
      console.error("Error fetching leaderboard:", error);
      console.error("Error details:", {
        message: error.message,
        cause: error.cause,
      });
      return [];
    }
  }

  /**
   * File a new incident report for moderation
   * @param incidentReport - Description of the incident
   * @param communityRules - Community rules being violated
   * @returns Transaction receipt
   */
  async fileReport(
    incidentReport: string,
    communityRules: string
  ): Promise<TransactionReceipt> {
    try {
      console.log("Filing new report");
      console.log("Incident:", incidentReport);
      console.log("Rules:", communityRules);
      
      const txHash = await this.client.writeContract({
        address: this.contractAddress,
        functionName: "file_report",
        args: [incidentReport, communityRules],
        value: BigInt(0),
      });

      console.log("File report transaction hash:", txHash);

      const receipt = await this.client.waitForTransactionReceipt({
        hash: txHash,
        status: "ACCEPTED" as any,
        retries: 24,
        interval: 5000,
      });

      console.log("Report filed successfully:", receipt);
      return receipt as TransactionReceipt;
    } catch (error: any) {
      console.error("Error filing report:", error);
      console.error("Error details:", {
        message: error.message,
        contractAddress: this.contractAddress,
      });
      throw new Error("Failed to file report");
    }
  }

  /**
   * Trigger AI arbitration consensus on a case
   * @param caseId - ID of the case to arbitrate
   * @returns Transaction receipt
   */
  async arbitrate(caseId: string): Promise<TransactionReceipt> {
    try {
      console.log("Triggering arbitration for case:", caseId);
      
      const txHash = await this.client.writeContract({
        address: this.contractAddress,
        functionName: "arbitrate",
        args: [caseId],
        value: BigInt(0),
      });

      console.log("Arbitration transaction hash:", txHash);

      const receipt = await this.client.waitForTransactionReceipt({
        hash: txHash,
        status: "ACCEPTED" as any,
        retries: 24,
        interval: 5000,
      });

      console.log("Arbitration completed:", receipt);
      return receipt as TransactionReceipt;
    } catch (error: any) {
      console.error("Error arbitrating case:", error);
      console.error("Error details:", {
        message: error.message,
        contractAddress: this.contractAddress,
        caseId: caseId,
      });
      throw new Error("Failed to arbitrate case");
    }
  }
}

export default ModerationArbitrator;