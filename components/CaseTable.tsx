"use client";

import { Loader2, Scale, Clock, AlertCircle, ShieldCheck, Gavel } from "lucide-react";
import { useCases, useArbitrateCase, useModeratorContract } from "../lib/hooks/useModeration";
import { useWallet } from "@/lib/genlayer/wallet";
import { error } from "@/lib/utils/toast";
import { AddressDisplay } from "./AddressDisplay";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import type { ModerationCase } from "@/lib/contracts/types";

export function CaseTable() {
  const contract = useModeratorContract();
  const { data: cases, isLoading, isError } = useCases();
  const { address, isConnected, isLoading: isWalletLoading } = useWallet();
  const { arbitrateCase, isArbitrating, arbitratingCaseId } = useArbitrateCase();

  const handleArbitrate = (caseId: string) => {
    if (!address) {
      error("Connect arbiter wallet to process cases");
      return;
    }

    const confirmed = confirm("Initiate GenLayer AI Arbitration? This will reach consensus on the verdict based on community rules.");

    if (confirmed) {
      arbitrateCase(caseId);
    }
  };

  if (isLoading) {
    return (
      <div className="brand-card p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="text-sm text-muted-foreground">Fetching incident reports...</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="brand-card p-12 text-center space-y-4">
        <AlertCircle className="w-16 h-16 mx-auto text-yellow-400 opacity-60" />
        <h3 className="text-xl font-bold">Contract Disconnected</h3>
        <p className="text-muted-foreground">Please configure your Moderation Contract address in the environment settings.</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="brand-card p-8 text-center">
        <p className="text-destructive">Failed to sync with GenLayer. Please refresh.</p>
      </div>
    );
  }

  if (!cases || cases.length === 0) {
    return (
      <div className="brand-card p-12 text-center space-y-3">
        <ShieldCheck className="w-16 h-16 mx-auto text-muted-foreground opacity-20" />
        <h3 className="text-xl font-bold">Clear Queue</h3>
        <p className="text-muted-foreground">All reports have been processed. The community is currently safe.</p>
      </div>
    );
  }

  return (
    <div className="brand-card p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Gavel className="w-5 h-5 text-accent" />
          Active Arbitration Queue
        </h2>
        <Badge variant="secondary">{cases.length} Total Reports</Badge>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 text-left">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Case ID</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Incident Summary</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Verdict</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {cases.map((item) => (
              <CaseRow
                key={item.id}
                caseData={item}
                currentAddress={address}
                onArbitrate={handleArbitrate}
                isProcessing={isArbitrating && arbitratingCaseId === item.id}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface CaseRowProps {
  caseData: ModerationCase;
  currentAddress: string | null;
  onArbitrate: (id: string) => void;
  isProcessing: boolean;
}

function CaseRow({ caseData, currentAddress, onArbitrate, isProcessing }: CaseRowProps) {
  const isResolved = caseData.case_resolved;

  return (
    <tr className="group hover:bg-white/5 transition-colors">
      <td className="px-4 py-4">
        <AddressDisplay address={caseData.id} maxLength={8} />
      </td>
      <td className="px-4 py-4 max-w-xs">
        <p className="text-sm truncate font-medium">{caseData.incident_report}</p>
      </td>
      <td className="px-4 py-4">
        {isResolved ? (
          <Badge className={
            caseData.verdict.includes("Ban") 
            ? "bg-destructive/20 text-destructive border-destructive/30" 
            : "bg-blue-500/20 text-blue-400 border-blue-500/30"
          }>
            {caseData.verdict}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground italic">Pending...</span>
        )}
      </td>
      <td className="px-4 py-4">
        {isResolved ? (
          <Badge variant="outline" className="text-green-400 border-green-500/30">
            <ShieldCheck className="w-3 h-3 mr-1" /> Complete
          </Badge>
        ) : (
          <Badge variant="outline" className="text-yellow-400 border-yellow-500/30 animate-pulse">
            <Clock className="w-3 h-3 mr-1" /> Reviewing
          </Badge>
        )}
      </td>
      <td className="px-4 py-4">
        {!isResolved && (
          <Button
            onClick={() => onArbitrate(caseData.id)}
            disabled={isProcessing}
            size="sm"
            variant="gradient"
            className="text-xs h-8"
          >
            {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : "Arbitrate"}
          </Button>
        )}
      </td>
    </tr>
  );
}