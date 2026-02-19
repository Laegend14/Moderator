"use client";

import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { createWalletClient, custom, type WalletClient } from "viem";

// GenLayer Network Configuration for the Arbitration Platform
export const GENLAYER_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_GENLAYER_CHAIN_ID || "61999");
export const GENLAYER_CHAIN_ID_HEX = `0x${GENLAYER_CHAIN_ID.toString(16).toUpperCase()}`;

export const GENLAYER_NETWORK = {
  chainId: GENLAYER_CHAIN_ID_HEX,
  chainName: process.env.NEXT_PUBLIC_GENLAYER_CHAIN_NAME || "GenLayer Moderation Network",
  nativeCurrency: {
    name: process.env.NEXT_PUBLIC_GENLAYER_SYMBOL || "GEN",
    symbol: process.env.NEXT_PUBLIC_GENLAYER_SYMBOL || "GEN",
    decimals: 18,
  },
  rpcUrls: [process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || "https://studio.genlayer.com/api"],
  blockExplorerUrls: [],
};

// Ethereum provider type definition
interface EthereumProvider {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, handler: (...args: any[]) => void) => void;
  removeListener: (event: string, handler: (...args: any[]) => void) => void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

/**
 * Get the GenLayer RPC URL from environment variables
 */
export function getStudioUrl(): string {
  return process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || "https://studio.genlayer.com/api";
}

/**
 * Get the Moderation Contract address
 */
export function getContractAddress(): string {
  const address = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  if (!address) {
    console.warn("Moderation Contract address not found in environment variables.");
    return "";
  }
  return address;
}

/**
 * Wallet Utility: Check if MetaMask is available
 */
export function isMetaMaskInstalled(): boolean {
  if (typeof window === "undefined") return false;
  return !!window.ethereum?.isMetaMask;
}

export function getEthereumProvider(): EthereumProvider | null {
  if (typeof window === "undefined") return null;
  return window.ethereum || null;
}

/**
 * Wallet Utility: Connection and Network Switching
 */
export async function requestAccounts(): Promise<string[]> {
  const provider = getEthereumProvider();
  if (!provider) throw new Error("MetaMask is not installed");

  try {
    const accounts = await provider.request({ method: "eth_requestAccounts" });
    return accounts;
  } catch (error: any) {
    if (error.code === 4001) throw new Error("User rejected connection");
    throw new Error(`Connection failed: ${error.message}`);
  }
}

export async function addGenLayerNetwork(): Promise<void> {
  const provider = getEthereumProvider();
  if (!provider) throw new Error("MetaMask is not installed");

  try {
    await provider.request({
      method: "wallet_addEthereumChain",
      params: [GENLAYER_NETWORK],
    });
  } catch (error: any) {
    throw new Error(`Failed to add Arbitration Network: ${error.message}`);
  }
}

export async function switchToGenLayerNetwork(): Promise<void> {
  const provider = getEthereumProvider();
  if (!provider) throw new Error("MetaMask is not installed");

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: GENLAYER_CHAIN_ID_HEX }],
    });
  } catch (error: any) {
    if (error.code === 4902) {
      await addGenLayerNetwork();
    } else {
      throw new Error(`Failed to switch network: ${error.message}`);
    }
  }
}

/**
 * Wallet Utility: Get current accounts
 */
export async function getAccounts(): Promise<string[]> {
  const provider = getEthereumProvider();
  if (!provider) return [];

  try {
    const accounts = await provider.request({ method: "eth_accounts" });
    return accounts;
  } catch (error) {
    console.error("Failed to get accounts:", error);
    return [];
  }
}

/**
 * Wallet Utility: Get current chain ID
 */
export async function getCurrentChainId(): Promise<string> {
  const provider = getEthereumProvider();
  if (!provider) throw new Error("MetaMask is not installed");

  try {
    const chainId = await provider.request({ method: "eth_chainId" });
    return chainId;
  } catch (error: any) {
    throw new Error(`Failed to get chain ID: ${error.message}`);
  }
}

/**
 * Wallet Utility: Check if currently on GenLayer network
 */
export async function isOnGenLayerNetwork(): Promise<boolean> {
  try {
    const chainId = await getCurrentChainId();
    return parseInt(chainId, 16) === GENLAYER_CHAIN_ID;
  } catch (error) {
    return false;
  }
}

/**
 * Wallet Utility: Connect MetaMask and switch to GenLayer network
 * Returns the connected address as a string
 */
export async function connectMetaMask(): Promise<string> {
  const provider = getEthereumProvider();
  if (!provider) throw new Error("MetaMask is not installed");

  try {
    // Request account access
    const accounts = await requestAccounts();
    
    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found");
    }
    
    // Switch to GenLayer network
    await switchToGenLayerNetwork();
    
    return accounts[0];
  } catch (error: any) {
    if (error.code === 4001) throw new Error("User rejected connection");
    throw error;
  }
}

/**
 * Wallet Utility: Switch account (request new account selection)
 * Returns the newly selected address as a string
 */
export async function switchAccount(): Promise<string> {
  const provider = getEthereumProvider();
  if (!provider) throw new Error("MetaMask is not installed");

  try {
    // This will prompt the user to select a different account
    await provider.request({
      method: "wallet_requestPermissions",
      params: [{ eth_accounts: {} }],
    });
    
    // Get the newly selected accounts
    const accounts = await getAccounts();
    
    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found after switch");
    }
    
    return accounts[0];
  } catch (error: any) {
    if (error.code === 4001) throw new Error("User rejected account switch");
    throw new Error(`Failed to switch account: ${error.message}`);
  }
}

/**
 * Client Creation for Arbitration Interactions
 */
export function createGenLayerClient(address?: string) {
  const config: any = {
    chain: studionet,
  };

  if (address) {
    config.account = address as `0x${string}`;
  }

  try {
    return createClient(config);
  } catch (error) {
    console.error("Error creating GenLayer client:", error);
    return createClient({ chain: studionet });
  }
}

export async function getClient() {
  const provider = getEthereumProvider();
  if (!provider) return createGenLayerClient();
  
  try {
    const accounts = await provider.request({ method: "eth_accounts" });
    return createGenLayerClient(accounts[0]);
  } catch {
    return createGenLayerClient();
  }
}