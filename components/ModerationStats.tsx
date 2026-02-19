"use client";

import { Trophy, Medal, Award, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { useArbiterLeaderboard, useModeratorContract } from "../lib/hooks/useModeration";
import { useWallet } from "@/lib/genlayer/wallet";
import { AddressDisplay } from "./AddressDisplay";

export function ArbiterLeaderboard() {
  const contract = useModeratorContract();
  const { data: leaderboard, isLoading, isError } = useArbiterLeaderboard();
  const { address } = useWallet();

  const title = (
    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
      <ShieldCheck className="w-5 h-5 text-accent" />
      Top Arbiters
    </h2>
  );

  if (isLoading) {
    return (
      <div className="brand-card p-6">
        {title}
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-accent" />
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="brand-card p-6">
        {title}
        <div className="text-center py-8 space-y-3">
          <AlertCircle className="w-12 h-12 mx-auto text-yellow-400 opacity-60" />
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Configuration Missing</p>
            <p className="text-xs text-muted-foreground">Moderation contract not found</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !leaderboard) {
    return (
      <div className="brand-card p-6">
        {title}
        <div className="text-center py-8">
          <p className="text-sm text-destructive">Failed to sync reputation data</p>
        </div>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="brand-card p-6">
        {title}
        <div className="text-center py-8">
          <ShieldCheck className="w-12 h-12 mx-auto text-muted-foreground opacity-30 mb-3" />
          <p className="text-sm text-muted-foreground">No active arbiters yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="brand-card p-6">
      {title}

      <div className="space-y-2">
        {leaderboard.slice(0, 10).map((entry, index) => {
          const isCurrentUser = address?.toLowerCase() === entry.address?.toLowerCase();
          const rank = index + 1;

          return (
            <div
              key={entry.address}
              className={`
                flex items-center gap-3 p-3 rounded-lg transition-all
                ${isCurrentUser ? "bg-accent/20 border-2 border-accent/50" : "hover:bg-white/5"}
              `}
            >
              {/* Rank with Icon */}
              <div className="flex-shrink-0 w-8 flex items-center justify-center">
                {rank === 1 && <Trophy className="w-5 h-5 text-yellow-400" />}
                {rank === 2 && <Medal className="w-5 h-5 text-gray-400" />}
                {rank === 3 && <Award className="w-5 h-5 text-amber-600" />}
                {rank > 3 && (
                  <span className="text-sm font-bold text-muted-foreground">
                    #{rank}
                  </span>
                )}
              </div>

              {/* Arbiter Identity */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <AddressDisplay
                    address={entry.address}
                    maxLength={10}
                    className="text-sm"
                    showCopy={false}
                  />
                  {isCurrentUser && (
                    <span className="text-[10px] bg-accent/30 text-accent px-1.5 py-0.5 rounded-full font-bold uppercase">
                      You
                    </span>
                  )}
                </div>
              </div>

              {/* Reputation Score */}
              <div className="flex-shrink-0 text-right">
                <div className="flex items-baseline gap-1 justify-end">
                  <span className="text-lg font-bold text-accent">
                    {entry.points}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase">Rep</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {leaderboard.length > 10 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-medium">
            Top Tier Verified Arbiters
          </p>
        </div>
      )}
    </div>
  );
}