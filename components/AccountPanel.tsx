"use client";

import { useState } from "react";
import { User, LogOut, AlertCircle, ExternalLink, Scale } from "lucide-react"; // Added Scale icon for legal theme
import { useWallet } from "@/lib/genlayer/wallet";
import { usePlayerPoints } from "@/lib/hooks/useModeration"; // We will rename this hook in a later file
import { success, error, userRejected } from "@/lib/utils/toast";
import { AddressDisplay } from "./AddressDisplay";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

const METAMASK_INSTALL_URL = "https://metamask.io/download/";

export function AccountPanel() {
  const {
    address,
    isConnected,
    isMetaMaskInstalled,
    isOnCorrectNetwork,
    isLoading,
    connectWallet,
    disconnectWallet,
    switchWalletAccount,
  } = useWallet();

  // 'Points' are rebranded as 'Reputation Score' in the UI
  const { data: points = 0 } = usePlayerPoints(address);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [connectionError, setConnectionError] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const handleConnect = async () => {
    if (!isMetaMaskInstalled) return;

    try {
      setIsConnecting(true);
      setConnectionError("");
      await connectWallet();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Failed to connect wallet:", err);
      setConnectionError(err.message || "Failed to connect to MetaMask");

      if (err.message?.includes("rejected")) {
        userRejected("Connection cancelled");
      } else {
        error("Failed to connect wallet", {
          description: err.message || "Check your MetaMask and try again."
        });
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setIsModalOpen(false);
  };

  const handleSwitchAccount = async () => {
    try {
      setIsSwitching(true);
      setConnectionError("");
      await switchWalletAccount();
    } catch (err: any) {
      console.error("Failed to switch account:", err);
      if (!err.message?.includes("rejected")) {
        setConnectionError(err.message || "Failed to switch account");
        error("Failed to switch account", {
          description: err.message || "Please try again."
        });
      } else {
        userRejected("Account switch cancelled");
      }
    } finally {
      setIsSwitching(false);
    }
  };

  // --- Disconnected State ---
  if (!isConnected) {
    return (
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button variant="gradient" disabled={isLoading}>
            <User className="w-4 h-4 mr-2" />
            Connect Wallet
          </Button>
        </DialogTrigger>
        <DialogContent className="brand-card border-2">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Scale className="w-6 h-6 text-accent" />
              Arbiter Access
            </DialogTitle>
            <DialogDescription>
              Connect your MetaMask wallet to review cases and enforce community rules.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {!isMetaMaskInstalled ? (
              <>
                <Alert variant="default" className="bg-accent/10 border-accent/20">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>MetaMask Required</AlertTitle>
                  <AlertDescription>
                    Arbitration requires a secure connection. Please install MetaMask to interact with the GenLayer blockchain.
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={() => window.open(METAMASK_INSTALL_URL, "_blank")}
                  variant="gradient"
                  className="w-full h-14 text-lg"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Install MetaMask
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleConnect}
                  variant="gradient"
                  className="w-full h-14 text-lg"
                  disabled={isConnecting}
                >
                  <User className="w-5 h-5 mr-2" />
                  {isConnecting ? "Connecting..." : "Connect MetaMask"}
                </Button>
                {connectionError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Connection Error</AlertTitle>
                    <AlertDescription>{connectionError}</AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // --- Connected State ---
  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <div className="flex items-center gap-4">
        <div className="brand-card px-4 py-2 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-accent" />
            <AddressDisplay address={address} maxLength={12} />
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-1" title="Arbiter Reputation Score">
            <span className="text-sm font-semibold text-accent">{points}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">rep</span>
          </div>
        </div>

        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Scale className="w-4 h-4" />
          </Button>
        </DialogTrigger>
      </div>

      <DialogContent className="brand-card border-2">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Arbiter Profile</DialogTitle>
          <DialogDescription>Your on-chain moderation credentials.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="brand-card p-4 space-y-2">
            <p className="text-sm text-muted-foreground">Arbiter Address</p>
            <code className="text-sm font-mono break-all">{address}</code>
          </div>

          <div className="brand-card p-4 space-y-2">
            <p className="text-sm text-muted-foreground">Reputation Score</p>
            <p className="text-2xl font-bold text-accent">{points}</p>
          </div>

          <div className="brand-card p-4 space-y-2">
            <p className="text-sm text-muted-foreground">GenLayer Connectivity</p>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isOnCorrectNetwork ? "bg-green-500" : "bg-yellow-500 animate-pulse"}`} />
              <span className="text-sm">{isOnCorrectNetwork ? "Verified Connection" : "Network Mismatch"}</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 space-y-3">
            <Button onClick={handleSwitchAccount} variant="outline" className="w-full" disabled={isSwitching || isLoading}>
              <User className="w-4 h-4 mr-2" />
              {isSwitching ? "Switching Arbiter..." : "Switch Account"}
            </Button>
            <Button onClick={handleDisconnect} className="w-full text-destructive hover:bg-destructive/10" variant="outline" disabled={isSwitching || isLoading}>
              <LogOut className="w-4 h-4 mr-2" />
              Disconnect
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}