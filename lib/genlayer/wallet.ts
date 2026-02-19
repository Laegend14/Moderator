"use client";

/**
 * Re-export wallet functionality from WalletProvider.
 * This ensures all Arbiter actions (Filing, Resolving, Reputation tracking)
 * share a single source of truth for the connected wallet state.
 */
export { useWallet, WalletProvider } from "./WalletProvider";
export type { WalletState } from "./WalletProvider";

/**
 * Utility function to format blockchain hashes (Arbiters, Reports, or TX IDs)
 * * @param address - The hex address to format
 * @param maxLength - Maximum length before truncation (default: 12)
 */
export function formatAddress(
  address: string | null,
  maxLength: number = 12
): string {
  if (!address) return "";
  if (address.length <= maxLength) return address;

  // Handles truncation like 0x123...4567
  const prefixLength = Math.floor((maxLength - 3) / 2);
  const suffixLength = Math.ceil((maxLength - 3) / 2);

  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
}