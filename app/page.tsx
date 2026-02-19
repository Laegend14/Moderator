"use client";

import { Navbar } from "@/components/Navbar";
import { CaseTable } from "../components/CaseTable"; // Renamed from BetsTable
import { ArbiterLeaderboard } from "@/components/ModerationStats"; // Renamed from Leaderboard

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow pt-20 pb-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              AI-Powered Arbitration
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Fair and Transparent Moderation on the GenLayer blockchain.
              <br />
              Consistent rule enforcement across gaming and digital communities.
            </p>
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Left Column - Active Cases (67% on desktop) */}
            <div className="lg:col-span-8 animate-slide-up">
              <CaseTable />
            </div>

            {/* Right Column - System Stats (33% on desktop) */}
            <div className="lg:col-span-4 animate-slide-up" style={{ animationDelay: "100ms" }}>
              <ArbiterLeaderboard />
            </div>
          </div>

          {/* Info Section - The "Trust" Layer */}
          <div className="mt-8 brand-card p-6 md:p-8 animate-fade-in" style={{ animationDelay: "200ms" }}>
            <h2 className="text-2xl font-bold mb-4">The Arbitration Process</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="text-accent font-bold text-lg">1. File Report</div>
                <p className="text-sm text-muted-foreground">
                  Submit an incident report and the applicable community rules. This data is recorded on-chain for transparency.
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-accent font-bold text-lg">2. AI Consensus</div>
                <p className="text-sm text-muted-foreground">
                  GenLayer validators use Intelligent Oracles to evaluate the report. Multiple nodes must agree on the verdict.
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-accent font-bold text-lg">3. Final Verdict</div>
                <p className="text-sm text-muted-foreground">
                  A transparent decision is reached with clear reasoning. All verdicts are immutable and publicly verifiable.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 text-center">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <a href="https://genlayer.com" target="_blank" className="hover:text-accent transition-colors">
              Powered by GenLayer
            </a>
            <a href="https://studio.genlayer.com" target="_blank" className="hover:text-accent transition-colors">
              Studio
            </a>
            <a href="https://docs.genlayer.com" target="_blank" className="hover:text-accent transition-colors">
              Docs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}