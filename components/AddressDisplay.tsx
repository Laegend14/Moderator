"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { formatAddress } from "@/lib/genlayer/wallet";
import { success, error } from "@/lib/utils/toast";

interface AddressDisplayProps {
  address: string | null;
  maxLength?: number;
  className?: string;
  showCopy?: boolean;
}

/**
 * Component to display shortened blockchain addresses (Arbiters, Reporters, Subjects)
 * with a quick-copy utility for transparency.
 */
export function AddressDisplay({
  address,
  maxLength = 12,
  className = "",
  showCopy = false,
}: AddressDisplayProps) {
  const [copied, setCopied] = useState(false);

  if (!address) {
    return <span className={`text-muted-foreground ${className}`}>—</span>;
  }

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      success("Hash copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy address:", err);
      error("Copy failed", {
        description: "Please try selecting the text manually."
      });
    }
  };

  const shortened = formatAddress(address, maxLength);

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${className}`}
      title={`Full Address: ${address}`}
    >
      <span className="font-mono tracking-tight">{shortened}</span>
      {showCopy && (
        <button
          onClick={handleCopy}
          className="opacity-40 hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded-md"
          aria-label="Copy blockchain address"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-green-400" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      )}
    </span>
  );
}