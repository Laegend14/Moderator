"use client";

import { X, Scale, AlertCircle, CheckCircle, Clock, User, FileText, Gavel } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { AddressDisplay } from "./AddressDisplay";
import type { ModerationCase } from "@/lib/contracts/types";

interface CaseDetailModalProps {
  caseData: ModerationCase;
  isOpen: boolean;
  onClose: () => void;
}

export function CaseDetailModal({ caseData, isOpen, onClose }: CaseDetailModalProps) {
  if (!isOpen) return null;

  const getVerdictIcon = () => {
    if (!caseData.resolved) return <Clock className="w-5 h-5 text-yellow-400" />;
    if (caseData.verdict.includes("Ban")) return <AlertCircle className="w-5 h-5 text-red-400" />;
    if (caseData.verdict === "Warning") return <AlertCircle className="w-5 h-5 text-orange-400" />;
    return <CheckCircle className="w-5 h-5 text-green-400" />;
  };

  const getVerdictColor = () => {
    if (!caseData.resolved) return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
    if (caseData.verdict.includes("Ban")) return "text-red-400 bg-red-400/10 border-red-400/30";
    if (caseData.verdict === "Warning") return "text-orange-400 bg-orange-400/10 border-orange-400/30";
    return "text-green-400 bg-green-400/10 border-green-400/30";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 px-8 py-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Scale className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Case Details</h2>
                  <AddressDisplay address={caseData.id} maxLength={16} className="text-sm text-slate-400" />
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Status & Verdict Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status */}
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-400">Status</span>
              </div>
              <Badge 
                variant="outline" 
                className={caseData.resolved 
                  ? "text-green-400 border-green-500/30 bg-green-500/10" 
                  : "text-yellow-400 border-yellow-500/30 bg-yellow-500/10 animate-pulse"
                }
              >
                {caseData.resolved ? (
                  <><CheckCircle className="w-3 h-3 mr-1" /> Resolved</>
                ) : (
                  <><Clock className="w-3 h-3 mr-1" /> Under Review</>
                )}
              </Badge>
            </div>

            {/* Verdict */}
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Gavel className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-400">Verdict</span>
              </div>
              {caseData.resolved ? (
                <Badge className={`${getVerdictColor()} border px-3 py-1`}>
                  {getVerdictIcon()}
                  <span className="ml-2 font-semibold">{caseData.verdict}</span>
                </Badge>
              ) : (
                <span className="text-sm text-slate-500 italic">Awaiting AI consensus...</span>
              )}
            </div>
          </div>

          {/* Reporter */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-400">Reported By</span>
            </div>
            <AddressDisplay address={caseData.reporter} className="text-white font-mono" />
          </div>

          {/* Incident Report */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-400">Incident Report</span>
            </div>
            <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
              {caseData.incident}
            </p>
          </div>

          {/* Community Rules */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Scale className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-400">Community Rules</span>
            </div>
            <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
              {caseData.rules}
            </p>
          </div>

          {/* AI Reasoning (if resolved) */}
          {caseData.resolved && caseData.reasoning && (
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Gavel className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-blue-300">AI Arbitration Reasoning</span>
              </div>
              <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                {caseData.reasoning}
              </p>
              <div className="mt-4 pt-4 border-t border-blue-500/20">
                <p className="text-xs text-blue-300/70">
                  ✓ This verdict was reached through GenLayer's multi-node AI consensus mechanism
                </p>
              </div>
            </div>
          )}

          {/* Pending Message */}
          {!caseData.resolved && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 text-center">
              <Clock className="w-12 h-12 mx-auto mb-3 text-yellow-400 animate-pulse" />
              <h3 className="text-lg font-semibold text-yellow-300 mb-2">
                AI Arbitration Pending
              </h3>
              <p className="text-sm text-slate-400">
                This case is awaiting GenLayer consensus. Click "Arbitrate" to trigger the AI evaluation process.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50 px-8 py-6">
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl h-12 font-semibold"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}