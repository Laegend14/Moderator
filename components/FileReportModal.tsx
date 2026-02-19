"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, ShieldAlert, BookOpen, Scale } from "lucide-react";
import { useFileReport, useModeratorContract } from "../lib/hooks/useModeration";
import { useWallet } from "@/lib/genlayer/wallet";
import { error } from "@/lib/utils/toast";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea"; // Assuming a textarea for longer descriptions

export function FileReportModal() {
  const { isConnected, address, isLoading } = useWallet();
  const { fileReport, isCreating, isSuccess } = useFileReport();

  const [isOpen, setIsOpen] = useState(false);
  const [incidentReport, setIncidentReport] = useState("");
  const [communityRules, setCommunityRules] = useState("");

  const [errors, setErrors] = useState({
    incidentReport: "",
    communityRules: "",
  });

  useEffect(() => {
    if (!isConnected && isOpen && !isCreating) {
      setIsOpen(false);
    }
  }, [isConnected, isOpen, isCreating]);

  const validateForm = (): boolean => {
    const newErrors = { incidentReport: "", communityRules: "" };
    if (!incidentReport.trim()) newErrors.incidentReport = "Description of the incident is required";
    if (!communityRules.trim()) newErrors.communityRules = "Relevant rules must be provided for arbitration";

    setErrors(newErrors);
    return !Object.values(newErrors).some((err) => err !== "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !address) {
      error("Connect your wallet to submit reports");
      return;
    }
    if (!validateForm()) return;

    fileReport({
      incidentReport,
      communityRules,
    });
  };

  const resetForm = () => {
    setIncidentReport("");
    setCommunityRules("");
    setErrors({ incidentReport: "", communityRules: "" });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isCreating) resetForm();
    setIsOpen(open);
  };

  useEffect(() => {
    if (isSuccess) {
      resetForm();
      setIsOpen(false);
    }
  }, [isSuccess]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="gradient" disabled={!isConnected || !address || isLoading}>
          <Plus className="w-4 h-4 mr-2" />
          New Arbitration Case
        </Button>
      </DialogTrigger>
      <DialogContent className="brand-card border-2 sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Scale className="w-6 h-6 text-accent" />
            Initiate Arbitration
          </DialogTitle>
          <DialogDescription>
            Submit an incident for AI-powered, decentralized moderation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Incident Report */}
          <div className="space-y-2">
            <Label htmlFor="incidentReport" className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-accent" />
              Incident Report
            </Label>
            <Textarea
              id="incidentReport"
              placeholder="Describe the behavior or provide a link to the evidence..."
              value={incidentReport}
              onChange={(e) => {
                setIncidentReport(e.target.value);
                setErrors({ ...errors, incidentReport: "" });
              }}
              className={`min-h-[120px] ${errors.incidentReport ? "border-destructive" : ""}`}
            />
            {errors.incidentReport && (
              <p className="text-xs text-destructive">{errors.incidentReport}</p>
            )}
          </div>

          {/* Community Rules */}
          <div className="space-y-2">
            <Label htmlFor="communityRules" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-accent" />
              Applicable Rules
            </Label>
            <Textarea
              id="communityRules"
              placeholder="Paste the community rules or specific terms of service here..."
              value={communityRules}
              onChange={(e) => {
                setCommunityRules(e.target.value);
                setErrors({ ...errors, communityRules: "" });
              }}
              className={`min-h-[120px] ${errors.communityRules ? "border-destructive" : ""}`}
            />
            {errors.communityRules && (
              <p className="text-xs text-destructive">{errors.communityRules}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setIsOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              className="flex-1"
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Recording...
                </>
              ) : (
                "File Case"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}