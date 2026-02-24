"use client";

import { useState } from "react";
import { Loader2, Scale, Clock, AlertCircle, ShieldCheck, Gavel, Eye } from "lucide-react";
import { useCases, useArbitrateCase, useModeratorContract } from "../lib/hooks/useModeration";
import { useWallet } from "@/lib/genlayer/wallet";
import { error } from "@/lib/utils/toast";
import { AddressDisplay } from "./AddressDisplay";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { CaseDetailModal } from "./CaseDetailModal";
import type { ModerationCase } from "@/lib/contracts/types";

export function CaseTable() {
  const contract = useModeratorContract();
  const { data: cases, isLoading, isError } = useCases();
  const { address, isConnected, isLoading: isWalletLoading } = useWallet();
  const { arbitrateCase, isArbitrating, arbitratingCaseId } = useArbitrateCase();
  const [selectedCase, setSelectedCase] = useState<ModerationCase | null>(null);

  const handleArbitrate = (caseId: string, e?: React.MouseEvent) => {
    // Prevent row click when clicking arbitrate button
    if (e) {
      e.stopPropagation();
    }

    if (!address) {
      error("Connect arbiter wallet to process cases");
      return;
    }

    const confirmed = confirm("Initiate GenLayer AI Arbitration? This will reach consensus on the verdict based on community rules.");

    if (confirmed) {
      arbitrateCase(caseId);
    }
  };

  const handleRowClick = (caseData: ModerationCase) => {
    setSelectedCase(caseData);
  };

  if (isLoading) {
    return (
      <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          <p className="text-sm text-slate-400">Fetching incident reports...</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-12 text-center space-y-4">
        <AlertCircle className="w-16 h-16 mx-auto text-yellow-400 opacity-60" />
        <h3 className="text-xl font-bold text-white">Contract Disconnected</h3>
        <p className="text-slate-400">Please configure your Moderation Contract address in the environment settings.</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 text-center">
        <p className="text-red-400">Failed to sync with GenLayer. Please refresh.</p>
      </div>
    );
  }

  if (!cases || cases.length === 0) {
    return (
      <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-12 text-center space-y-3">
        <ShieldCheck className="w-16 h-16 mx-auto text-slate-500 opacity-20" />
        <h3 className="text-xl font-bold text-white">Clear Queue</h3>
        <p className="text-slate-400">All reports have been processed. The community is currently safe.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <Gavel className="w-5 h-5 text-blue-400" />
            Active Arbitration Queue
          </h2>
          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
            {cases.length} Total Reports
          </Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50 text-left">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Case ID</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Incident Summary</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Verdict</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {cases.map((item) => (
                <CaseRow
                  key={item.id}
                  caseData={item}
                  currentAddress={address}
                  onArbitrate={handleArbitrate}
                  onRowClick={handleRowClick}
                  isProcessing={isArbitrating && arbitratingCaseId === item.id}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Case Detail Modal */}
      <CaseDetailModal
        caseData={selectedCase!}
        isOpen={!!selectedCase}
        onClose={() => setSelectedCase(null)}
      />
    </>
  );
}

interface CaseRowProps {
  caseData: ModerationCase;
  currentAddress: string | null;
  onArbitrate: (id: string, e?: React.MouseEvent) => void;
  onRowClick: (caseData: ModerationCase) => void;
  isProcessing: boolean;
}

function CaseRow({ caseData, currentAddress, onArbitrate, onRowClick, isProcessing }: CaseRowProps) {
  const isResolved = caseData.resolved;

  return (
    <tr 
      className="group hover:bg-slate-700/30 transition-colors cursor-pointer"
      onClick={() => onRowClick(caseData)}
    >
      <td className="px-4 py-4">
        <AddressDisplay address={caseData.id} maxLength={8} className="font-mono text-sm" />
      </td>
      <td className="px-4 py-4 max-w-xs">
        <div className="flex items-center gap-2">
          <p className="text-sm truncate font-medium text-white">{caseData.incident}</p>
          <Eye className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </td>
      <td className="px-4 py-4">
        {isResolved ? (
          <Badge className={
            caseData.verdict.includes("Ban") 
            ? "bg-red-500/20 text-red-400 border-red-500/30" 
            : caseData.verdict === "Warning"
            ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
            : "bg-green-500/20 text-green-400 border-green-500/30"
          }>
            {caseData.verdict}
          </Badge>
        ) : (
          <span className="text-xs text-slate-500 italic">Pending...</span>
        )}
      </td>
      <td className="px-4 py-4">
        {isResolved ? (
          <Badge variant="outline" className="text-green-400 border-green-500/30 bg-green-500/10">
            <ShieldCheck className="w-3 h-3 mr-1" /> Complete
          </Badge>
        ) : (
          <Badge variant="outline" className="text-yellow-400 border-yellow-500/30 bg-yellow-500/10 animate-pulse">
            <Clock className="w-3 h-3 mr-1" /> Reviewing
          </Badge>
        )}
      </td>
      <td className="px-4 py-4">
        {!isResolved && (
          <Button
            onClick={(e) => onArbitrate(caseData.id, e)}
            disabled={isProcessing}
            size="sm"
            className="text-xs h-8 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0"
          >
            {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : "Arbitrate"}
          </Button>
        )}
      </td>
    </tr>
  );
}