"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import ModerationArbitrator from "../contracts/ModerationArbitrator";
import { getContractAddress, getStudioUrl } from "../genlayer/client";
import { useWallet } from "../genlayer/wallet";
import { success, error, configError } from "../utils/toast";
import type { ModerationCase, ReputationEntry } from "../contracts/types";

/**
 * Hook to get the ModerationArbitrator contract instance.
 * Recreates instance on wallet changes to update the active account.
 */
export function useModeratorContract(): ModerationArbitrator | null {
  const { address } = useWallet();
  const contractAddress = getContractAddress();
  const studioUrl = getStudioUrl();

  const contract = useMemo(() => {
    if (!contractAddress) {
      configError(
        "Setup Required",
        "Moderation contract address not configured in .env file.",
        {
          label: "Studio",
          onClick: () => window.open("https://studio.genlayer.com", "_blank")
        }
      );
      return null;
    }
    return new ModerationArbitrator(contractAddress, address, studioUrl);
  }, [contractAddress, address, studioUrl]);

  return contract;
}

/**
 * Hook to fetch all active and resolved moderation cases.
 */
export function useCases() {
  const contract = useModeratorContract();

  return useQuery<ModerationCase[], Error>({
    queryKey: ["cases"],
    queryFn: () => {
      if (!contract) return Promise.resolve([]);
      return contract.getCases();
    },
    refetchOnWindowFocus: true,
    staleTime: 5000,
    enabled: !!contract,
  });
}

/**
 * Hook to fetch the reputation leaderboard of top arbiters.
 */
export function useArbiterLeaderboard() {
  const contract = useModeratorContract();

  return useQuery<ReputationEntry[], Error>({
    queryKey: ["arbiterLeaderboard"],
    queryFn: () => {
      if (!contract) return Promise.resolve([]);
      // Note: Assumes SDK method getLeaderboard is implemented
      return (contract as any).getLeaderboard(); 
    },
    refetchOnWindowFocus: true,
    staleTime: 5000,
    enabled: !!contract,
  });
}

/**
 * Hook to fetch the current user's reputation points.
 */
export function usePlayerPoints() {
  const contract = useModeratorContract();
  const { address, isConnected } = useWallet();

  return useQuery<number, Error>({
    queryKey: ["playerPoints", address],
    queryFn: async () => {
      if (!contract || !address) return 0;
      // Note: Assumes SDK method getReputation is implemented
      // Adjust the method name based on your actual contract implementation
      try {
        const reputation = await (contract as any).getReputation(address);
        return reputation || 0;
      } catch (err) {
        console.error("Failed to fetch player points:", err);
        return 0;
      }
    },
    refetchOnWindowFocus: true,
    staleTime: 10000,
    enabled: !!contract && !!address && isConnected,
  });
}

/**
 * Hook to file a new incident report for arbitration.
 */
export function useFileReport() {
  const contract = useModeratorContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);

  const mutation = useMutation({
    mutationFn: async ({
      incidentReport,
      communityRules,
    }: {
      incidentReport: string;
      communityRules: string;
    }) => {
      if (!contract || !address) throw new Error("Wallet not connected or contract missing.");
      setIsCreating(true);
      return contract.fileReport(incidentReport, communityRules);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      setIsCreating(false);
      success("Case Filed", {
        description: "The incident has been recorded for AI arbitration."
      });
    },
    onError: (err: any) => {
      setIsCreating(false);
      error("Submission Failed", { description: err?.message });
    },
  });

  return {
    ...mutation,
    isCreating,
    isSuccess: mutation.isSuccess,
    fileReport: mutation.mutate,
  };
}

/**
 * Hook to trigger GenLayer AI Arbitration consensus on a case.
 */
export function useArbitrateCase() {
  const contract = useModeratorContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();
  const [isArbitrating, setIsArbitrating] = useState(false);
  const [arbitratingCaseId, setArbitratingCaseId] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (caseId: string) => {
      if (!contract || !address) throw new Error("Wallet not connected.");
      setIsArbitrating(true);
      setArbitratingCaseId(caseId);
      return contract.arbitrate(caseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      queryClient.invalidateQueries({ queryKey: ["arbiterLeaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["playerPoints"] });
      setIsArbitrating(false);
      setArbitratingCaseId(null);
      success("Arbitration Complete", {
        description: "GenLayer consensus reached. The verdict is now immutable."
      });
    },
    onError: (err: any) => {
      setIsArbitrating(false);
      setArbitratingCaseId(null);
      error("Arbitration Error", { description: err?.message });
    },
  });

  return {
    ...mutation,
    isArbitrating,
    arbitratingCaseId,
    arbitrateCase: mutation.mutate,
  };
}