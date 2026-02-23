"use client";

import { Navbar } from "@/components/Navbar";
import { CaseTable } from "../components/CaseTable";
import { ArbiterLeaderboard } from "@/components/ModerationStats";
import { Scale, Shield, Zap, Lock } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated Background Grid */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      
      {/* Glowing Orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow pt-24 pb-16 px-4 md:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm mb-6">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">Powered by GenLayer AI</span>
            </div>

            {/* Main Title */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-br from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent leading-tight">
              AI-Powered
              <br />
              <span className="relative">
                Arbitration
                <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 300 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 10C50 2 100 2 150 10C200 2 250 2 298 10" stroke="url(#gradient)" strokeWidth="3" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5"/>
                      <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.8"/>
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.5"/>
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Decentralized justice through AI consensus. Fair, transparent, and immutable 
              moderation decisions on the GenLayer blockchain.
            </p>

            {/* Stats Bar */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300">
                <div className="text-3xl font-bold text-blue-400 mb-1">Fast</div>
                <div className="text-sm text-slate-400">AI Consensus</div>
              </div>
              <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300">
                <div className="text-3xl font-bold text-cyan-400 mb-1">Fair</div>
                <div className="text-sm text-slate-400">Unbiased Verdicts</div>
              </div>
              <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300">
                <div className="text-3xl font-bold text-blue-400 mb-1">Transparent</div>
                <div className="text-sm text-slate-400">On-Chain Records</div>
              </div>
              <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300">
                <div className="text-3xl font-bold text-cyan-400 mb-1">Immutable</div>
                <div className="text-sm text-slate-400">Permanent Verdicts</div>
              </div>
            </div>
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-12">
            {/* Left Column - Active Cases */}
            <div className="lg:col-span-8 animate-slide-up">
              <CaseTable />
            </div>

            {/* Right Column - Leaderboard */}
            <div className="lg:col-span-4 animate-slide-up" style={{ animationDelay: "100ms" }}>
              <ArbiterLeaderboard />
            </div>
          </div>

          {/* Process Section */}
          <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                How It Works
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Three simple steps to reach a fair and transparent verdict
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                <div className="relative bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 hover:border-blue-500/50 transition-all duration-300">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Scale className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-5xl font-bold text-blue-400/20 mb-4">01</div>
                  <h3 className="text-xl font-bold text-white mb-3">File Report</h3>
                  <p className="text-slate-400 leading-relaxed">
                    Submit incident details and applicable community rules. All data is recorded 
                    immutably on-chain for complete transparency.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                <div className="relative bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 hover:border-cyan-500/50 transition-all duration-300">
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-5xl font-bold text-cyan-400/20 mb-4">02</div>
                  <h3 className="text-xl font-bold text-white mb-3">AI Consensus</h3>
                  <p className="text-slate-400 leading-relaxed">
                    Multiple GenLayer validator nodes use Intelligent Oracles to evaluate the case. 
                    Consensus ensures unbiased judgment.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                <div className="relative bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 hover:border-blue-500/50 transition-all duration-300">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Lock className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-5xl font-bold text-blue-400/20 mb-4">03</div>
                  <h3 className="text-xl font-bold text-white mb-3">Final Verdict</h3>
                  <p className="text-slate-400 leading-relaxed">
                    A transparent decision with clear reasoning is delivered. All verdicts are 
                    permanent and publicly verifiable.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/50 backdrop-blur-sm py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-slate-400">
                Secured by GenLayer Blockchain
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
              <a 
                href="https://genlayer.com" 
                target="_blank" 
                className="hover:text-blue-400 transition-colors duration-200"
              >
                GenLayer
              </a>
              <a 
                href="https://studio.genlayer.com" 
                target="_blank" 
                className="hover:text-blue-400 transition-colors duration-200"
              >
                Studio
              </a>
              <a 
                href="https://docs.genlayer.com" 
                target="_blank" 
                className="hover:text-blue-400 transition-colors duration-200"
              >
                Documentation
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}