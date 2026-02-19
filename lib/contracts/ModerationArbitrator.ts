import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import type { ModerationCase, ReputationEntry, TransactionReceipt } from "./types";

/**
 * ModerationArbitrator class for interacting with the GenLayer Moderation contract.
 * Uses GenLayer's Intelligent Oracle to reach consensus on community rule enforcement.
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
   * Update the account for active transactions
   */
  updateAccount(address: string): void {
    const config: any = {
      chain: studionet,
      account: address as `0x${string}`,
    };
    this.client = createClient(config);
  }

  /**
   * Fetches all cases from the contract and parses GenLayer's internal Map structure.
   */
  async getCases(): Promise<ModerationCase[]> {
    try {
      // In our Python contract, we might use a view function 'get_all_cases'
      const cases: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_all_cases",
        args: [],
      });

      if (cases instanceof Map) {
        return Array.from(cases.entries()).map(([id, data]: any) => {
          // Flatten GenLayer Map data into a JS Object
          const caseObj = Array.from((data as any).entries()).reduce(
            (obj: any, [key, value]: any) => {
              obj[key] = value;
              return obj;
            },
            {} as Record<string, any>
          );

          return {
            id,
            ...caseObj,
          } as ModerationCase;
        });
      }

      return [];
    } catch (error) {
      console.error("Error fetching moderation cases:", error);
      throw new Error("Failed to sync with GenLayer ledger");
    }
  }

  /**
   * Get reputation points for a specific arbiter
   */
  async getArbiterReputation(address: string | null): Promise<number> {
    if (!address) return 0;

    try {
      const rep = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_arbiter_reputation",
        args: [address],
      });

      return Number(rep) || 0;
    } catch (error) {
      console.error("Error fetching reputation:", error);
      return 0;
    }
  }

  /**
   * Submit a new incident report for arbitration
   * @param incident_report - Text or evidence link
   * @param community_rules - The ruleset to judge against
   */
  async fileReport(
    incident_report: string,
    community_rules: string
  ): Promise<TransactionReceipt> {
    try {
      const txHash = await this.client.writeContract({
        address: this.contractAddress,
        functionName: "file_report",
        args: [incident_report, community_rules],
        value: BigInt(0),
      });

      const receipt = await this.client.waitForTransactionReceipt({
        hash: txHash,
        status: "ACCEPTED" as any,
        retries: 30,
        interval: 5000,
      });

      return receipt as TransactionReceipt;
    } catch (error) {
      console.error("Error filing report:", error);
      throw new Error("Blockchain write failed: Could not file report.");
    }
  }

  /**
   * Triggers the GenLayer AI Consensus to decide on a case.
   */
  async arbitrate(caseId: string): Promise<TransactionReceipt> {
    try {
      const txHash = await this.client.writeContract({
        address: this.contractAddress,
        functionName: "arbitrate",
        args: [caseId],
        value: BigInt(0),
      });

      const receipt = await this.client.waitForTransactionReceipt({
        hash: txHash,
        status: "ACCEPTED" as any,
        retries: 50, // Moderation logic (LLM consensus) takes longer than simple data
        interval: 5000,
      });

      return receipt as TransactionReceipt;
    } catch (error) {
      console.error("Error during arbitration:", error);
      throw new Error("Consensus failed: AI Oracles could not reach agreement.");
    }
  }
}

export default ModerationArbitrator;