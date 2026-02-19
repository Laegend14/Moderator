"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import {
  isMetaMaskInstalled,
  connectMetaMask,
  switchAccount,
  getAccounts,
  getCurrentChainId,
  isOnGenLayerNetwork,
  GENLAYER_NETWORK,
  getEthereumProvider,
  GENLAYER_CHAIN_ID,
} from "./client";
import { error, userRejected } from "../utils/toast";

// Key to prevent annoying auto-connects if the user intentionally logged out
const DISCONNECT_FLAG = "arbiter_session_disconnected";

export interface WalletState {
  address: string | null;
  chainId: string | null;
  isConnected: boolean;
  isLoading: boolean;
  isMetaMaskInstalled: boolean;
  isOnCorrectNetwork: boolean;
}

interface WalletContextValue extends WalletState {
  connectWallet: () => Promise<string>;
  disconnectWallet: () => void;
  switchWalletAccount: () => Promise<string>;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

/**
 * Manages the connection state between the Arbiter and the GenLayer Moderation Network.
 */
export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnected: false,
    isLoading: true,
    isMetaMaskInstalled: false,
    isOnCorrectNetwork: false,
  });

  // --- Initial Session Check ---
  useEffect(() => {
    const initArbiterSession = async () => {
      const installed = isMetaMaskInstalled();
      if (!installed) {
        setState(prev => ({ ...prev, isLoading: false, isMetaMaskInstalled: false }));
        return;
      }

      // Respect explicit disconnect intent
      const wasDisconnected = localStorage.getItem(DISCONNECT_FLAG) === "true";
      if (wasDisconnected) {
        setState(prev => ({ ...prev, isLoading: false, isMetaMaskInstalled: true }));
        return;
      }

      try {
        const accounts = await getAccounts();
        const chainId = await getCurrentChainId();
        const correctNetwork = await isOnGenLayerNetwork();

        setState({
          address: accounts[0] || null,
          chainId,
          isConnected: accounts.length > 0,
          isLoading: false,
          isMetaMaskInstalled: true,
          isOnCorrectNetwork: correctNetwork,
        });
      } catch (err) {
        console.error("Session Init Error:", err);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initArbiterSession();
  }, []);

  // --- Real-time Listeners ---
  useEffect(() => {
    const provider = getEthereumProvider();
    if (!provider) return;

    const handleAccountsChanged = async (accounts: string[]) => {
      const correctNetwork = await isOnGenLayerNetwork();
      if (accounts.length > 0) localStorage.removeItem(DISCONNECT_FLAG);

      setState(prev => ({
        ...prev,
        address: accounts[0] || null,
        isConnected: accounts.length > 0,
        isOnCorrectNetwork: correctNetwork,
      }));
    };

    const handleChainChanged = (chainId: string) => {
      const isCorrect = parseInt(chainId, 16) === GENLAYER_CHAIN_ID;
      setState(prev => ({ ...prev, chainId, isOnCorrectNetwork: isCorrect }));
    };

    provider.on("accountsChanged", handleAccountsChanged);
    provider.on("chainChanged", handleChainChanged);

    return () => {
      provider.removeListener("accountsChanged", handleAccountsChanged);
      provider.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  // --- Arbiter Actions ---
  const connectWallet = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const address = await connectMetaMask();
      const correctNetwork = await isOnGenLayerNetwork();

      localStorage.removeItem(DISCONNECT_FLAG);
      setState(prev => ({
        ...prev,
        address,
        isConnected: true,
        isLoading: false,
        isOnCorrectNetwork: correctNetwork,
      }));
      return address;
    } catch (err: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      if (err.message?.includes("rejected")) userRejected("Connection cancelled");
      else error("Arbiter Login Failed", { description: err.message });
      throw err;
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    localStorage.setItem(DISCONNECT_FLAG, "true");
    setState(prev => ({ ...prev, address: null, isConnected: false }));
  }, []);

  const switchWalletAccount = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const newAddress = await switchAccount();
      localStorage.removeItem(DISCONNECT_FLAG);
      
      setState(prev => ({
        ...prev,
        address: newAddress,
        isConnected: true,
        isLoading: false,
      }));
      return newAddress;
    } catch (err: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      userRejected("Account switch cancelled");
      throw err;
    }
  }, []);

  return (
    <WalletContext.Provider value={{ ...state, connectWallet, disconnectWallet, switchWalletAccount }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) throw new Error("useWallet must be used within a WalletProvider");
  return context;
}